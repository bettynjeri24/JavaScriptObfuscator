"use strict";
const { normalConsole } = require('../UssdLogs/logChalk')
class Cache {
    constructor(connect = false) {
		this.redis = require('./redis');
		this.connect = connect
	}
	
    //crud methods
    async put(userId, data, keyExpiryTime) { 
        data = this.valuesToJson(data);
        //create the data then close the connection
        let redis = new this.redis();
		let client = await redis.connect();
		
		if ( client ) {
			let response = await redis.createHash(client, userId, data, keyExpiryTime);
			redis.close(client);
			if (response === 'OK') {
				response = true;
			}
			else {
				response = false;
			}
			return response;
		}
		else {
			return false
		}
	}
	async existsInSet ( setName, userId ) { 
		//create the data then close the connection
		let redis = new this.redis();
		let client = await redis.connect(this.connect);
		
		if ( client ) {
			let response = await redis.checkIfExistsInSet ( client, setName, userId);
			
			//close our connection
			redis.close(client)
			return response;
		}
		else {
			throw new Error ('Redis Connection Error')
		}		
	}
    async get(userId) {
        //create the data then close the connection
        let redis = new this.redis();
		let client = await redis.connect();
		
		if ( client ) {
			let response = await redis.readHash(client, userId);
			//close our connection
			redis.close(client);
			if (response) {
				response = this.valuesFromJson(response); 

			}
			else {
				response = false;
			}
			return response;
		}
		else {
			throw new Error ('Redis Connection Error')
		}
    }
    async getMany(keys) {
        //create the data then close the connection
        let redis = new this.redis();
		let client = await redis.connect();

		if ( client ) {
			let response = await redis.readMultipleHashes(client, keys);

			//close our connection
			redis.close(client);
			if (response) {

				
				response = response.map((name) => {
					return this.valuesFromJson(name);
				});
				let obj = {};
				keys = keys.map((key) => {
					let arr = key.split(':');
					return arr[arr.length - 1];
				});
				for (let index in keys) {
					obj[keys[index]] = response[index];
				}

				response = obj;
			}
			else {
				response = false;
			}
			return response;
		}
		else {
			return false
		}
    
    }
    async delete(userId) {
        //create the data then close the connection
        let redis = new this.redis();
		let client = await redis.connect();
		
		if ( client ) {
			let response = await redis.deleteHash(client, userId);
			redis.close(client);
			if (response === 0) {
				return false;
			}
			if (response === 1) {
				return true;
			}
			return response;
			}
		else {
			return false
		}
    }
    async exists(userId) {
        //create the data then close the connection
        let redis = new this.redis();
		let client = await redis.connect();

		if ( client ) {
			let response = await redis.keyExists(client, userId);
			redis.close(client);
			return response;
		}
		else {
			return false
		}
    }
    //helper functions
    valuesToJson(data) {
        let jsonObj = {};
        try {
            let keys = Object.keys(data);
            for (let key of keys) {
                jsonObj[key] = JSON.stringify(data[key]);
            }
        }
        catch (e) {
        }
        return jsonObj;
    }
    valuesFromJson(data) {
		try{
			let jsonObj = {};

			data = data || ""
			
			let keys = Object.keys(data);
			for (let key of keys) {
				try {
					jsonObj[key] = JSON.parse(data[key]);
				}
				catch (e) {
					jsonObj[key] = data[key];
					console.log ( {key,e, data:data[key]} )
				}
				
			}
			
			return jsonObj;
		}
		catch (e ){
			console.log  ( data, e )
			return data
		}

    }
}
module.exports = Cache;
