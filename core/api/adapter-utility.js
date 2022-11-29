"use strict";
const { normalConsole } = require('../UssdLogs/logChalk')
let hasMultiple = () => {
	return true
};
let isAmount = (Joi, min) => {
	let minInt = parseInt(min, 10);
	return ({
		isAmount: Joi.number().required().min(minInt)
	});
};
let isText = (data) => {
	//let dataLength = data.length;
	//let regex         = /[^a-zA-Z]/g;
	let regex = /^[A-Za-z]+$/i;
	let newData = data.replace(regex, "");
	let newDataLength = newData.length;
	normalConsole(newDataLength);
	if (regex.test(data)) {
		return true;
	}
	else {
		return false;
	}
};
let isNumber = (joi) => {
	return ({
		isNumber: joi.number().required()
	});
};
let checkIfIsNumber = (data) => {
	//isNaN
	let dataLength = data.length;
	let regex = /[^0-9]/g;
	let newData = data.replace(regex, "");
	let newDataLength = newData.length;
	if (dataLength == newDataLength) {
		// if ( regex.test(data) ) {
		return true;
	}
	else {
		return false;
	}
};
let isEmail = (data) => {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	let isEmail = re.test(data);
	if (data && !isEmail && data.toLowerCase() === 's') {
		return true;
	}
	else {
		return isEmail;
	}
};
let isCorrectPin = (input, env) => {

	//console.log ({ "validator message" :  "checking for the correct PIN" })

	//check if mode is internal authentication or external authentication
	let isInternalAuth = env.app_config["internal-authentication"]

	if (isInternalAuth) {

		//format the PIN according to the rules defined
		let oldPin = env.user_data['account-details'].pin || false;

		//transform the entered pin

		let transform_function = env.prompt_data["transform-function"] || false

		let codeString = env.app_code[transform_function];
		//create a new dynamic function
		let f = new Function(codeString);
		let newPin = f({
			data: input,
			msisdn: env.user_data.msisdn,
			crypto: require("crypto-js")
		});

		if (oldPin === newPin) {
			return true;
		}
		else {
			return false;
		}
	}

	//else skip and return control to the external authenticator
	else {
		return true;
	}
};
let isDate = (data) => {
	//format DD-MM-YYYY
	let wDashes = data.replace(/-/g, '');
	//total length is correct
	if (wDashes.length !== 8) {
		return false;
	}
	let splitData = data.split('-');
	//parts are the correct length
	if (splitData[0].length !== 2) {
		return false;
	}
	if (splitData[1].length !== 2) {
		return false;
	}
	if (splitData[2].length !== 4) {
		return false;
	}
	//contains only numbers
	if (!checkIfIsNumber(splitData[0])) {
		return false;
	}
	if (!checkIfIsNumber(splitData[1])) {
		return false;
	}
	if (!checkIfIsNumber(splitData[2])) {
		return false;
	}
	//is a valid date
	if (parseInt(splitData[0], 10) > 31) {
		return false;
	}
	if (parseInt(splitData[1], 10) > 12) {
		return false;
	}
	return true;
};
let checkPinStrength = (pinString) => {
	//invalid length
	if (pinString.length !== 4) {
		return { "valid": false, "msg": "invalid_pin_length" };
	}
	//Convert the PIN into an array
	let pin = [];
	for (let p = 0; p < pinString.length; p++) {
		pin.push(pinString.charAt(p));
	}
	//helper function to map only unique values
	let onlyUnique = (value, index, self) => {
		return self.indexOf(value) === index;
	};
	try {
		let numbers = '1,2,3,4,5,6,7,8,9,0';
		let numericArray = numbers.split(',');
		let totinvalid = pin.length;
		//let unique = pin.filter(onlyUnique);
		//Ensures all digits are numbers
		for (let i = 0; i < totinvalid; i++) {
			if (numericArray.indexOf(pin[i]) == -1) {
				return { "valid": false, "msg": "alpha_characters_found" };
			}
		}
		//Ensures that the pin doesnt consist of a single character
		//let uniquePin = pin.filter(onlyUnique);
		//Ensure no sequence passwords exist e.g 1234, 4321, 9876,6789
		let sequence = [];
		for (let x = 0; x < pin.length; x++) {
			let difference = pin[x] - pin[x + 1];
			sequence.push(difference);
		}
		let sequenceDetected = sequence.filter(onlyUnique);
		if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '1') {
			return { "valid": false, "msg": "easy_pin" };
		}
		if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '0') {
			return { "valid": false, "msg": "easy_pin" };
		}
		if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '-1') {
			return { "valid": false, "msg": "easy_pin" };
		}
		//ensure that no birthdays are entered
		let birthdays = [];
		let date = new Date();
		let year = date.getFullYear();
		let maxyear = parseInt(year) - 18;
		let minyear = parseInt(year) - 100;
		for (let t = minyear; t <= maxyear; t++) {
			birthdays.push(t);
		}
		if (birthdays.indexOf(parseInt(pinString)) != -1) {
			return { "valid": false, "msg": "birthday_found" };
		}
		return { "valid": true, "msg": "valid_pin" };
	}
	catch (e) {
	}
};
let isValidPin = (data) => {
	// if (checkPinStrength(data).valid) {
	//     return true;
	// }
	// else {
	//     return false;
	// }

	return true
};
let isStrongPin = (data) => {
	if (checkPinStrength(data).valid) {
		return true;
	}
	else {
		return false;
	}

	return true
};
let isEqualToLastEntry = (input, env, comparisonPath) => {

	let dot = require("dot-object")

	//check if mode is internal authentication or external authentication
	let isInternalAuth = env.app_config["internal-authentication"]

	if (isInternalAuth) {

		//format the PIN according to the rules defined
		let oldValue = dot.pick(comparisonPath, env.user_data['global-request-details']);

		//transform the entered pin
		let transform_function = env.prompt_data["transform-function"] || false

		if (transform_function) {

			let codeString = env.app_code[transform_function];

			//create a new dynamic function
			let f = new Function(codeString);

			let newValue = f({
				data: input,
				msisdn: env.user_data.msisdn,
				crypto: require("crypto-js")
			});

			if (oldValue === newValue) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			if (oldValue === input) {
				return true
			}
			else {
				return false
			}
		}
	}

	//else skip and return control to the external authenticator
	else {
		return true;
	}
};
let transform = (id, value, extra) => {
	let transformed = value;
	let CryptoJS = require("crypto-js");
	switch (id) {

		case 'loan-products-format':
			try {
				//normalConsole({value})
				if (value.includes('~') && value.includes('|')) {
					let items = value.split('~')
					items = items.filter((item) => {
						return item && item.trim() !== ''
					})
					//"FKL.CHAP.CHAP.LN|10|100.00|10.00|0|D|1|Pesa Chap Chap|9400|10000.00|~0|15|100.00|5.00|1|D|10|Digital Loan|700|50000.00|~"  - cbsIdentifier|repaymentPeriod|minAmount|interestRate|digitalLoan|frequescy|productCode|maxAmount
					//'0|FKL.CHAP.CHAP.LN|10.00|10|100.00|10.00|0|D|1|Pesa Chap Chap|9400|10000.00|~1|FKL.UNSECURED.SAL.ADV|500.00|6|100.00|12.00|0|M|2|Staff Salary Advances|8600|100000.00|~1|FKL.IMARA.LOAN|0.00|84|100.00|20.53|0|M|3|Imara Topup Loan|8500|130000.00|~0|0|0.00|15|100.00|5.00|1|D|10|Digital Loan|7001|50000.00|~'				
					transformed = items.map((item) => {
						item = item.split('|')
						if (item[4] === '0') {
							return {
								'label': item[9],
								'value': `${item[0]}|${item[1]}|${item[2]}|${item[3]}|${item[4]}|${item[5]}|${item[8]}|${item[9]}|${item[7]}`,
								'jump-to': "loan-application-account",
							}
						} else {
							return {
								'label': item[7],
								'value': `${item[0]}|${item[1]}|${item[2]}|${item[3]}|${item[4]}|${item[5]}|${item[8]}|${item[9]}|${item[7]}`,
							}
						}

					});
				} else {
					transformed = []
				}
			} catch (e) {
				normalConsole(e.message);
			}


			break;
		case 'faulu-loan-products':
			try {
				if (value.includes('~') && value.includes('|')) {
					let loanitems = value.split('~')
					loanitems = loanitems.filter((item) => {
						return item && item.trim() !== ''
					})

					transformed = loanitems.map((item) => {
						item = item.split('|')
						return {
							'label': item[7],
							'value': `${item[0]}|${item[1]}|${item[2]}|${item[3]}|${item[4]}|${item[5]}|${item[8]}|${item[9]}|${item[7]}`,
						}

					});
				} else {
					transformed = []
				}
			} catch (e) {
				normalConsole(e.message);
			}

			break;
		case 'faulu-loan-balance':
			try {
				if (value.includes('~') && value.includes('|')) {
					let loanitems = value.split('~')
					loanitems = loanitems.filter((item) => {
						return item && item.trim() !== ''
					})

					transformed = loanitems.map((item) => {
						item = item.split('|')
						if (item[4] === '1') {
							return {
								'label': item[7],
								'value': `${item[0]}|${item[1]}|${item[2]}|${item[3]}|${item[4]}|${item[5]}|${item[8]}|${item[9]}|${item[7]}`,
								'jump-to': "loan-digital-balance",
							}
						} else {
							return {
								'label': item[7],
								'value': `${item[0]}|${item[1]}|${item[2]}|${item[3]}|${item[4]}|${item[5]}|${item[8]}|${item[9]}|${item[7]}`,
							}
						}

					});
				} else {
					transformed = []
				}
			} catch (e) {
				normalConsole(e.message);
			}

			break;
		case 'faulu-loan-repayment':
			try {
				if (value.includes('~') && value.includes('|')) {
					let loanitems = value.split('~')
					loanitems = loanitems.filter((item) => {
						return item && item.trim() !== ''
					})

					transformed = loanitems.map((item) => {
						item = item.split('|')
						if (item[4] === '1') {
							return {
								'label': item[7],
								'value': `${item[0]}|${item[1]}|${item[2]}|${item[3]}|${item[4]}|${item[5]}|${item[8]}|${item[9]}|${item[7]}`,
								'jump-to': "digital-loan-repayment-amount",
							}
						} else {
							return {
								'label': item[7],
								'value': `${item[0]}|${item[1]}|${item[2]}|${item[3]}|${item[4]}|${item[5]}|${item[8]}|${item[9]}|${item[7]}`,
							}
						}

					});
				} else {
					transformed = []
				}
			} catch (e) {
				normalConsole(e.message);
			}

			break;
		case "loanProducts":
			// console.log ( { value } )
			// [
			// 	{
			// 	  "ProductCode": "3001",
			// 	  "B": [
			// 		{
			// 		  "ProductName": "CB E-WALLET LOAN"
			// 		}
			// 	  ]
			// 	},
			// 	{
			// 	  "ProductCode": "3002",
			// 	  "B": [
			// 		{
			// 		  "ProductName": "SALARY ADVANCE LOAN"
			// 		}
			// 	  ]
			// 	}
			//   ]

			// [{"name":"CB E-WALLET LOAN","code":"3001"},{"name":"SALARY ADVANCE LOAN","code":"3002"}]

			transformed = JSON.parse(value).map((item) => {
				let value = item.code + '|' + item.name
				let label = item.name
				return {
					label,
					value
				}
				// if ( value === '3001') {
				// 	obj ["jump-to"] =  "loan-application-amount"
				// }
			})
			break;
		case "applyLoanProducts":

			transformed = JSON.parse(value).map((item) => {
				let value = item.code + '|' + item.name
				let label = item.name
				// return {
				// 	label,
				// 	value
				// }
				let obj = {
					label: label,
					value: value
				}
				if (label.includes('E-WALLET')) {
					obj["jump-to"] = "wallet-loan-amount"
				}

				return obj

			})
			break;
		case 'money':
			transformed = `${parseFloat(value).toFixed(2)}`;
			break;
		case 'integer':
			transformed = parseInt(value, 10)
			break;
		case 'capitalize':
			try {
				transformed = value.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
			}
			catch (e) {
				transformed = ' '
			}
			break;
		case "pin-hash":
			let config = require('../../config/config.json')
			transformed = CryptoJS.HmacSHA256(Buffer.from(value + this.user_data.msisdn).toString(config.security.base64), config.security.secret).toString(CryptoJS.enc.Hex);
			break;
		case "ukulima-pin-hash":
			let secret = "hksdjoisdhsd";
			let passwordHash = CryptoJS.HmacSHA256(value, secret);
			transformed = CryptoJS.enc.Base64.stringify(passwordHash);
			break;
		case "remove-white-space":
			transformed = value.trim().replace(/\s/g, '');
			break;
		case "to-number":
			transformed = value.trim().replace(/[^0-9]/g, '');
			break;
		case "moment-date-range":
			let periodFigure = '', periodMeasure = '';

			if (value && value.toLowerCase().includes('day')) {
				periodFigure = parseInt(value, 10);
				periodMeasure = 'days';

			}
			if (value && value.toLowerCase().includes('week')) {
				periodFigure = parseInt(value, 10);
				periodMeasure = 'weeks';

			}
			if (value && value.toLowerCase().includes('month')) {
				periodFigure = parseInt(value, 10);
				periodMeasure = 'months';

			}
			if (value && value.toLowerCase().includes('year')) {
				periodFigure = parseInt(value, 10);
				periodMeasure = 'years';

			}

			let moment = require('moment');
			let today = moment();
			let selection = moment().subtract(periodFigure, periodMeasure);
			let dateTo = today.format(extra);
			let dateFrom = selection.format(extra);

			return {
				dateTo,
				dateFrom,
				periodMeasure,
				periodFigure
			}
			break;
		case "save-accounts":

			if (value) {
				let saveaccount = value.split('|')
				//normalConsole(saveaccount)
				saveaccount = saveaccount.filter((item) => {
					return item && item.trim !== ' '
				})
				transformed = saveaccount.map((item) => {
					let itemParts = item

					let obj = {
						label: itemParts,
						value: itemParts
					}

					return obj
				})
			}
			break;
		case "mini-statement":

			let items = value.split('|')
			items = items.filter((item) => {
				return item && item.trim !== ''
			})

			for (let item of items) {
				let itemParts = item.split('-')

				let amounts = itemParts[5]
				let date = itemParts[1]
				let trans = itemParts[2]
				let mini = trans + '-' + date + 'UGX' + amounts + '\n';
				return mini

			}
			break;
		case 'walletAccount':
			if (value) {
				let walle = value.trim();

				if (walle.length > 0) {
					transformed = [
						{
							'label': walle,
							'value': walle
						}
					]
				} else {
					transformed = []
				}

			}
			break;
		case 'formatLanguage': {
			normalConsole(`formatLanguage USER LANGUAGE IS 2 ==${value}`);
			if (value == null || value == undefined || value === "undefined") {
				transformed = "swahili"
				normalConsole("LANGUAGE IS UNDEFINED");
			} else 
			if (value == "en") {
				transformed = "english"
				normalConsole("LANGUAGE IS ENGLISH");
			} else if (value === "sw") {
				transformed = "swahili"
				normalConsole("LANGUAGE IS SWAHILI");
			} else if (value == "fr") {
				transformed = "french"
				normalConsole("LANGUAGE IS FRENCH");
			} else {
				normalConsole("NO LANGUAGE SET");
				transformed = "swahili"
			}
			normalConsole(`formatLanguage USER LANGUAGE IS 2 ==${transformed}`);
		} break;
		case "universal-coreAccount":
			try {
				let UniCoreAcc = JSON.parse(value)
				//normalConsole(UniCoreAcc)
				if (UniCoreAcc.length < 1) {
					transformed = []


				} else {
					transformed = []

					//LINKEDACCOUNTS: '[{"CURRENCY":"KES","LINKEDACCOUNT":"123456789","accountType":"I"}]'
					// UniCoreAcc = UniCoreAcc.filter ( ( item ) => {
					// 	return item && item.trim !== ' '
					// })

					transformed = UniCoreAcc.map((item) => {
						let itemParts = item

						let obj = {
							label: itemParts.LINKEDACCOUNT,
							value: itemParts.LINKEDACCOUNT
						}

						return obj
					})
				}
			} catch (error) {
				transformed = []
			}

			break;
	}
	return transformed;
}
module.exports = {
	hasMultiple,
	isAmount,
	isText,
	isNumber,
	isEmail,
	//isCorrectPin,
	isDate,
	isValidPin,
	isStrongPin,
	isEqualToLastEntry,
	transform
};