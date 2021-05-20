let BigNumber = require('bignumber.js');
let ContractsHelper = require('../Helpers/ContractsHelper');
let InsightApiRepository = require('../Repositories/InsightApiRepository');
let async = require('async');
const logger = require('log4js').getLogger('History Service');

class HistoryService {

    /**
     *
     * @param {Object} history
     * @param {Array.<Object>} history.items
     * @param {Number} history.totalItems
     * @param next
     * @returns {*}
     */
    static formatHistory(history, next) {

        if (!history || !history.transactions || !history.transactions.length) {
            return next(null, {
                totalItems: 0,
                items: []
            });
        }

        let items = new Array(history.transactions.length);

        return async.each(history.transactions, (item, callback) => {
            let idx = history.transactions.indexOf(item);
            return InsightApiRepository.getTrx(item.id, (err, result) => {
                return HistoryService.formatHistoryItem(result, (err, result) => {

                    items[idx] = result;

                    items[idx].amount /= 1e7;

                    items[idx].vin.forEach((input) => {
                        input.value = parseInt(input.value)/1e7.toString();
                    });

                    items[idx].vout.forEach((output) => {
                        output.value = parseInt(output.value)/1e7.toString();        
                    });

                    return callback();
                });
            });
            
        },  
        (err) => {
            return next(err, {
                totalItems: history && history.totalCount ? history.totalcount : 0,
                items: items
            })
        });


    }

    /**
     *
     * @param {Object} item
     * @param {Function} cb
     * @returns {*}
     */
    static formatHistoryItem(item, cb) {
        let vout = [],
            vin = [],
            addressCallString = null,
            addressCreateString = null;

        if (item.inputs) {
            item.inputs.forEach((input) => {

                if (input.address) {

                    let num = new BigNumber(input.value);

                    vin.push({
                        value: num.toString(10),
                        address: input.address
                    });

                }

            });
        }

        if (item.outputs) {

            item.outputs.forEach((output) => {

                if (output.scriptPubKey) {

                    try {
                        if (ContractsHelper.isContractCreateVOutHex(output.scriptPubKey.hex)) {
                            addressCreateString = ContractsHelper.getContractAddress(item.id, output.n);
                        }
                    } catch (e) {}

                    try {
                        if (!addressCreateString && ContractsHelper.isContractCallVOutHex(output.scriptPubKey.hex)) {
                            addressCallString = ContractsHelper.getCallContractAddressFromVOutHex(output.scriptPubKey.hex);
                        }
                    } catch (e) {}

                    if (output.address && typeof output.value !== 'undefined') {

                        let num = new BigNumber(output.value);

                        vout.push({
                            value: num.toString(10),
                            address: output.address ? output.address : null
                        });

                    }

                }

            });

        }

        let result = {
            block_time: item.timestamp ? item.timestamp : null,
            block_height: item.blockHeight ? item.blockHeight : -1,
            block_hash: item.blockHash ? item.blockHash : null,
            tx_hash: item.id,
            amount: item.inputValue,
            vout: vout,
            vin: vin
        };

        if (!addressCreateString && !addressCallString) {
            return cb(null, result);
        }

        return InsightApiRepository.getAccountInfo(addressCreateString ? addressCreateString : addressCallString, (err, res) => {

            if (err) {
                return cb(err)
            }

            if (res && addressCreateString) {
                result.contract_has_been_created = true;
            }

            if (!res && addressCallString) {
                result.contract_has_been_deleted = true;
            }

            return cb(null, result);

        });

    }

}

module.exports = HistoryService;