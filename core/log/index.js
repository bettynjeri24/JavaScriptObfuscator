const Queue = require ( 'bull' )

const { normalConsole } = require('../UssdLogs/logChalk')
let env = require('../../env');
require('dotenv').config({
    path: require('path').resolve(__dirname, '..', '..', '..', 'dev.env')
});
let connection = {};
switch (env.environment) {
	case 'development':
		//connection = env.cache.development;
		connection = process.env.development;
		break;
	case 'staging':
		//connection =  env.cache.staging;
		connection =  connection = process.env.staging;
		break;
	case 'production':
		//connection =  env.cache.production;
		connection =  connection = process.env.production;
		break;
	default:
		break;
}

class Enqueue {
	constructor ( ){
		this.conn      = {		
			redis: connection
		}
	}
	async add ( name, data ){
		let   q = new Queue ( name, this.conn )
		await q.add ( data )
		await q.close()
	}
}

module.exports = Enqueue