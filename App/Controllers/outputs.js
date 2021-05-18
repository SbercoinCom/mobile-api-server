let logger = require('log4js').getLogger('Outputs Controller'),
    InsightApiRepository = require("../Repositories/InsightApiRepository"),
    bs58 = require('bs58');

let Controllers = getControllers();

class OutputsControllers {

    constructor() {
        logger.info('Init');
    }

    getUnspentByAddress(cb, data) {
        return InsightApiRepository.getUnspentAddresses([data._get.address], (error, body) => {
            cb(error, this._formatAddresses(body));
    	});
	}

	getUnspentByAddresses(cb, data) {

		let addresses = data._get.addresses && Array.isArray(data._get.addresses) ? data._get.addresses : [];

		if (addresses.length) {
            return InsightApiRepository.getUnspentAddresses(addresses, (error, body) => {
                cb(error, this._formatAddresses(body));
        	});
		} else {
            cb(null, []);
		}

	}

	_formatAddresses(addresses) {
    	let newAddresses = [];

    	if (Array.isArray(addresses)) {
            addresses.forEach((address) => {

                let bytes = bs58.decode(address.address);

                while(bytes.length < 25) {
                    bytes = Buffer.concat([new Buffer('\0'), bytes]);
                }

                newAddresses.push({
                    address: address.address,
                    tx_hash: address.transactionId,
                    vout: address.outputIndex,
                    txout_scriptPubKey: address.scriptPubKey,
                    amount: address.value,
                    block_height: address.blockHeight ? address.blockHeight : -1,
                    pubkey_hash: bytes.slice(1, 21).toString('hex'),
                    is_stake: address.isStake,
                    confirmations: address.confirmations
                });

            });
        }


    	return newAddresses;
	}

}

Controllers.outputs = new OutputsControllers();