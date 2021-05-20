const request = require('request');
const _ = require('lodash');
const config = require('../../config/main.json');
const queryString = require('query-string');

class InsightApiRepository {

    /**
     *
     * @param {Function} cb
     * @returns {*}
     */
    static getInfo(cb) {
        return request.get({
            url: config.EXPLORER_API_URL + '/info',
            json: true
        }, (error, response, body) => {
                return cb(error, body);
            });
    }

    /**
     *
     * @param {String} txid
     * @param {Function} cb
     * @returns {*}
     */
    static getTrx(txid, cb) {
        return request.get({
            url: config.EXPLORER_API_URL + `/tx/${txid}`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                body = null;
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {String} rawtx
     * @param {Boolean} allowAbsurdFees
     * @param {Function} cb
     * @returns {*}
     */
    static sendRawTransaction(rawtx, allowAbsurdFees, cb) {
        return request.post({
                url: config.EXPLORER_API_URL + '/tx/send',
                form: {
                    rawtx: rawtx,
                    /*allowAbsurdFees: allowAbsurdFees*/
                }
            }, (error, response, body) => {

                try {

                    let json = JSON.parse(body);

                    if (_.isObject(json)) {
                        return cb(null, json)
                    } else {
                        return cb(body);
                    }

                } catch (e) {

                    return cb(body);
                }

            });

    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Function} cb
     * @returns {*}
     */
    static getUnspentAddresses(addresses, cb) {
        return request.get({
            url: config.EXPLORER_API_URL + `/address/${addresses.join(',')}/utxo`,
            json: true
        }, (error, response, body) => {
               return cb(error, body);
            });
    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Object} options
     * @param {Number} options.from
     * @param {Number} options.to
     * @param {Function} cb
     * @returns {*}
     */
    static getAddressesHistory(addresses, options, cb) {
        return request.get({
            url: config.EXPLORER_API_URL + `/address/${addresses.join(',')}/basic-txs?limit=${options.to}&offset=${options.from}`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                body = null;
            }

            return cb(error, body);
        });
    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Function} cb
     * @returns {*}
     */
    static getAddressesBalance(addresses, cb) {
        return request.get({
            url: config.EXPLORER_API_URL + `/address/${addresses.join(',')}/balance`,
            json: true
        }, (error, response, body) => {
            return cb(error, body);
        });
    }

    /**
     *
     * @param {String} address
     * @param {String} hash
     * @param {String} from
     * @param {Function} cb
     * @returns {*}
     */
    static callContract(address, hash, from, cb) {

        return request.get({
            url: config.EXPLORER_API_URL + `/contract/${address}/call?data=${hash}` + (from ? ('?sender=' + from) : ''),
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                return cb(body);
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {Number} nBlocks
     * @param {Function} cb
     * @returns {*}
     */
    /*static minEstimateFee(nBlocks, cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/utils/minestimatefee?nBlocks=${nBlocks}`,
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error minEstimateFee: ', body);
                return cb('Not Found')
            }

            return cb(error, body);

        });
    }*/

    /**
     *
     * @param {String} address
     * @param {Function} cb
     * @returns {*}
     */
    static getAccountInfo(address, cb) {

        return request.get({
            url: config.EXPLORER_API_URL + `/contract/${address}`,
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) { //Fix "Not Found" api response
               body = null;
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {Function} cb
     * @returns {*}
     */
    static getDgpinfo(cb) {

        return request.get({
            url: config.EXPLORER_API_URL + `/info`,
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error getDgpinfo: ', body);
                return cb('Not Found')
            }

            return cb(error, body.dgpInfo);

        });
    }

    /**
     *
     * @param {String} txHash
     * @param {Function} cb
     * @returns {*}
     */
    static getTransactionReceipt(txHash, cb) {

        return request.get({
            url: config.EXPLORER_API_URL + `/tx/${txHash}`,
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error getTransactionReceipt: ', body);
                return cb('Not Found')
            }

            return cb(error, body);

        });
    }

    static fetchQrc20Transfers(contractAddress, options, cb) {

        let queryParamsString = queryString.stringify(options, {arrayFormat: 'bracket'});

        return request.get({
            url: config.EXPLORER_API_URL + `/qrc20/${contractAddress}/txs` + (queryParamsString ? ('?' + queryParamsString) : ''),
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error fetchQrc20Transfers: ', body);
                return cb('Not Found')
            }

            return cb(error, body);

        });
    }


}

module.exports = InsightApiRepository;