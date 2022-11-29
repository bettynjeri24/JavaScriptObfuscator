"use strict"
const { normalConsole } = require('../UssdLogs/logChalk')
let hasMultiple = () => {
	return true
}
let isAmount = (env, Joi, min) => {

	//this code enables us to perform multi currency request validation based on the current working currency
	//funds-transfer-minimum-@working-currency'
	let minParts = min.split('%')
	//console.log ( { minParts })

	if (minParts.length > 1) {
		for (let item of minParts) {
			if (item.startsWith('@')) {
				//normalConsole(item)
				let replacementData = env.user_data['global-request-details'][item.replace('@', '')]
				//normalConsole(replacementData)
				min = min.replace(`%${item}`, replacementData)
			}
		}
		//console.log ( { min } )
		min = env.user_data['global-constants'][min]
		//console.log ( { min  })
	}
	let minInt = parseInt(min, 10)
	return ({
		isAmount: Joi.number().required().min(minInt)
	})
}

let isCorrectDate = (date, env, dateFormat, canBePast = true) => {
	// let moment = require
  
	//get the dates as epoch strings
	let moment = require("moment");
	let fdate = moment(date, dateFormat).valueOf();
	let tdate = moment(moment().format(dateFormat), dateFormat).valueOf();
  
	//console.log ( { fdate, tdate } )
  
	//check if the end date is a future date
	if (!canBePast) {
	  if (fdate < tdate) {
		//console.log ( 'the end date is in the past' )
		return false;
	  }
	}
  
	let wDashes = date.replace(/-/g, "");
	let splitData = date.split("-");
  
	switch (dateFormat) {
	  case "YYYY-MM-DD":
		//total length is correct
		if (wDashes.length !== 8) {
		  return false;
		}
  
		//parts are the correct length
		if (splitData[0].length !== 4) {
		  return false;
		}
		if (splitData[1].length !== 2) {
		  return false;
		}
		if (splitData[2].length !== 2) {
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
		if (parseInt(splitData[2], 10) > 31) {
		  return false;
		}
		if (parseInt(splitData[1], 10) > 12) {
		  return false;
		}
		return true;
		break;
	  case "DD-MM-YYYY":
		//total length is correct
		if (wDashes.length !== 8) {
		  return false;
		}
  
		//parts are the correct length
		if (splitData[2].length !== 4) {
		  return false;
		}
		if (splitData[1].length !== 2) {
		  return false;
		}
		if (splitData[0].length !== 2) {
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
		break;
	  case "MM-DD":
		//total length is correct
		if (wDashes.length !== 4) {
		  return false;
		}
  
		//parts are the correct length
		if (splitData[0].length !== 2) {
		  return false;
		}
		if (splitData[1].length !== 2) {
		  return false;
		}
		//contains only numbers
		if (!checkIfIsNumber(splitData[0])) {
		  return false;
		}
		if (!checkIfIsNumber(splitData[1])) {
		  return false;
		}
		//is a valid date
		if (parseInt(splitData[0], 10) > 12) {
		  return false;
		}
		if (parseInt(splitData[1], 10) > 31) {
		  return false;
		}
		return true;
		break;
	}
  };

let isCorrectDob = (dob) => {
	var datenew = new Date();
	var ynew = datenew.getFullYear();
	var mnew = datenew.getMonth();
	var dnew = datenew.getDate();
	dob = new Date(dob);
	var yold = dob.getFullYear();
	var mold = dob.getMonth();
	var dold = dob.getDate();
	var diff = ynew - yold;
	if (mold > mnew) diff--;
	else {
		if (mold == mnew) {
			if (dold > dnew) diff--;
		}
	}
	if (diff >= 18) {
		return true;
	} else {
		return false;
	}
}
let isWithinAmountRange= ( data, env, min, max ) => {

	//this code enables us to perform multi currency request validation based on the current working currency
	//funds-transfer-minimum-@working-currency'
	let minParts = min.split ( '%' )
	let maxParts = max.split( '%' )
	//console.log ( { minParts })
	//console.log ( { maxParts })

	if ( minParts.length > 1 ) {
		for ( let item of minParts ) {
			if ( item.startsWith ('@')) {
				let replacementData = env.user_data ['global-request-details'][item.replace('@','')]
				min = min.replace ( `%${item}`, replacementData )
			}
		}

		//console.log ( { min } )
		//min =  env.user_data ['global-request-details'][min]
		//console.log ( { min  })
	}

	if ( maxParts.length > 1 ) {
		for ( let item of maxParts ) {
			if ( item.startsWith ('@')) {
				let replacementData = env.user_data ['global-request-details'][item.replace('@','')]
				max = max.replace ( `%${item}`, replacementData )
			}
		}

		//console.log ( { max } )
		//max =  env.user_data ['global-request-details'][max]
		//console.log ( { max  })
	}


	data = parseInt ( data, 10 ) //undefined
	min = parseInt ( min, 10 )
	max = parseInt ( max, 10 )

	

	if ( 
		data >=min &&  data <= max 
	) {
		return true
	}
	return false
}
let isWithinLoanLimit = (data, env, min, max) => {
	console.log ( `ISWITHINLOANLIMIT max ${ max } min ${ min } DATE ==${new Date().toString()}`)
	
	//console.log ( {data, min, max} )

	//this code enables us to perform multi currency request validation based on the current working currency
	//funds-transfer-minimum-@working-currency'
	let minParts = min.split('%')
	let maxParts = max.split('%')
	

	if (minParts.length > 1) {
		for (let item of minParts) {
			if (item.startsWith('@')) {
				let replacementData = env.user_data['global-request-details'][item.replace('@', '')]
				min = min.replace(`%${item}`, replacementData)
				console.log ( `ISWITHINLOANLIMIT minParts ${ minParts } min ${ min } DATE ==${new Date().toString()}`)
			}
		}

		//console.log ( { min } )
		//min =  env.user_data ['global-request-details'][min]
		//console.log ( { min  })
	}

	if (maxParts.length > 1) {
		for (let item of maxParts) {
			if (item.startsWith('@')) {
				let replacementData = env.user_data['global-request-details'][item.replace('@', '')]
				max = max.replace(`%${item}`, replacementData)
				console.log ( `ISWITHINLOANLIMIT maxParts ${ maxParts } max ${ max } DATE ==${new Date().toString()}`)


			}
		}

		//console.log ( { max } )
		//max =  env.user_data ['global-request-details'][max]
		//console.log ( { max  })
	}


	data = parseInt(data, 10) //undefined
	min = parseInt(min, 10)
	max = parseInt(max, 10)



	if (
		data >= min && data <= max
	) {
		return true
	}
	return false
}

let isMinimumAmt = (data, env, min) => {

	//console.log ( {data, min, max} )

	//this code enables us to perform multi currency request validation based on the current working currency
	//funds-transfer-minimum-@working-currency'
	let minParts = min.split('%')
	//let maxParts = max.split( '%' )
	//console.log ( { minParts })
	//console.log ( { maxParts })

	if (minParts.length > 1) {
		for (let item of minParts) {
			if (item.startsWith('@')) {
				let replacementData = env.user_data['global-request-details'][item.replace('@', '')]
				min = min.replace(`%${item}`, replacementData)
			}
		}

		//console.log ( { min } )
		//min =  env.user_data ['global-request-details'][min]
		//console.log ( { min  })
	}

	// if ( maxParts.length > 1 ) {
	// 	for ( let item of maxParts ) {
	// 		if ( item.startsWith ('@')) {
	// 			let replacementData = env.user_data ['global-request-details'][item.replace('@','')]
	// 			max = max.replace ( `%${item}`, replacementData )
	// 		}
	// 	}

	// 	//console.log ( { max } )
	// 	//max =  env.user_data ['global-request-details'][max]
	// 	//console.log ( { max  })
	// }


	data = parseInt(data, 10) //undefined
	min = parseInt(min, 10)
	//max = parseInt ( max, 10 )



	if (
		data >= min
	) {
		return true
	}
	return false
}
let isAlphaNumeric = (data, env) => {
	let len = data.length
	data = data.replace(/[^0-9a-zA-Z]/g, '')

	let newLen = data.length

	if (newLen !== len) {
		return false
	}

	return true
}
let isAlphaNumericSpecial = (data, env) => {
	let len = data.length;
	data = data.replace(/[^0-9a-zA-Z\-]/g, "");
  
	let newLen = data.length;
  
	if (newLen !== len) {
	  return false;
	}
  
	return true;
  };
let isEslip = (data) => {
	return true
}
let is4DigitPin = (data, env) => {

	if (checkIfIsNumber(data) && data.length === 4) {
		return true
	}
	return false
}
let isNotOldPin = (data, env) => {

	let oldPin = env.user_data['global-request-details'].oldPin
	if (data === oldPin) {
		return false
	}
	return true
}
let isEqualToNewPin = (data, env, min, max) => {

	let newPin = env.user_data['global-request-details'].newPin
	if (data === newPin) {
		return true
	}
	return false
}
let isExternalAuthentication = (data) => {
	return true
}
let isWithinNumericRange = (data, env, min, max) => {
	if (checkIfIsNumber(data) && data.length >= min && data.length <= max) {
		return true
	}
	return false
}
let isStudentId = (data) => {
	return true
}
let isText = (data) => {
	//let dataLength = data.length
	//let regex         = /[^a-zA-Z]/g
	let regex = /^[A-Za-z ]+$/i
	let newData = data.replace(regex, "")
	let newDataLength = newData.length
	normalConsole(newDataLength);
	if (regex.test(data) && data.length > 0) {
		return true
	}
	else {
		return false
	}
}
let isStatement = (data) => {

	data = data.replace(/[.]/g, ' ')//replace dots with spaces ( eclectics issues )
	data = data.toString().trim()

	try {
		let dataLength = data.length
		//let regex         = /[^a-zA-Z]/g
		let regex = /[^A-Za-z\s]+$/i
		let newData = data.replace(regex, "")
		let newDataLength = newData.length
		if (dataLength === newDataLength) {
			return true
		}
		else {
			return false
		}
	}
	catch (e) {
		normalConsole(e)
	}
}
let isNumber = (env, joi) => {
	return ({
		isNumber: joi.number().positive().required()
	})
}

let isAbove18 = (data) => {
	let moment = require('moment')

	try {
		//let fdate = moment(data, 'YYYY-MM-DD')

		// if(fdate < 0){
		// 	return false
		// }


		let past = moment().subtract(18, 'years');

		let isValidDate = moment(data).format()
		if (!isValidDate) {
			return false
		}


		return moment(data).isBefore(past, 'year');
	} catch (error) {
		return false
	}
}

let isValidDate = (date, env, dateFormat, canBePast = false) => {

	// let moment = require

	//get the dates as epoch strings
	let moment = require('moment')
	let fdate = moment(date, dateFormat).valueOf()
	let tdate = moment(moment().format(dateFormat), dateFormat).valueOf()

	//console.log ( { fdate, tdate } )

	//check if the end date is a future date
	if (!canBePast) {
		if (fdate < tdate) {
			//console.log ( 'the end date is in the past' )
			return false
		}
	}

	let wDashes = date.replace(/-/g, '')
	let splitData = date.split('-')

	switch (dateFormat) {
		case 'YYYY-MM-DD':

			//total length is correct
			if (wDashes.length !== 8) {
				return false
			}

			//parts are the correct length
			if (splitData[0].length !== 4) {
				return false
			}
			if (splitData[1].length !== 2) {
				return false
			}
			if (splitData[2].length !== 2) {
				return false
			}
			//contains only numbers
			if (!checkIfIsNumber(splitData[0])) {
				return false
			}
			if (!checkIfIsNumber(splitData[1])) {
				return false
			}
			if (!checkIfIsNumber(splitData[2])) {
				return false
			}
			//is a valid date
			if (parseInt(splitData[2], 10) > 31) {
				return false
			}
			if (parseInt(splitData[1], 10) > 12) {
				return false
			}
			return true
			break
		case 'MM-DD':


			//total length is correct
			if (wDashes.length !== 4) {
				return false
			}

			//parts are the correct length
			if (splitData[0].length !== 2) {
				return false
			}
			if (splitData[1].length !== 2) {
				return false
			}
			//contains only numbers
			if (!checkIfIsNumber(splitData[0])) {
				return false
			}
			if (!checkIfIsNumber(splitData[1])) {
				return false
			}
			//is a valid date
			if (parseInt(splitData[0], 10) > 12) {
				return false
			}
			if (parseInt(splitData[1], 10) > 31) {
				return false
			}
			return true
			break
	}
}
let isValidDateRange = (endDate, env, dateFormat, startDatepath, startDateFormat) => {
	const moment = require('moment')
	const Joi = require('joi')
	const dot = require('dot-object')


	// startDate
	let startDate = dot.pick(startDatepath, env.user_data['global-request-details'])

	//get the dates as epoch strings
	let sdate = moment(startDate, startDateFormat).valueOf()
	let edate = moment(endDate, dateFormat).valueOf()

	//check if the end date is a future date
	if (edate < sdate) {
		//console.log ( 'the end date is before the start date' )
		return false
	}

	//joi schema to compare the two dates
	let schema = Joi.object().keys({
		startTime: Joi.date().required(),
		endTime: Joi.date().greater(Joi.ref('startTime')).required()
	})

	//run the validation against the schema
	let result = Joi.validate({
		startTime: sdate,
		endTime: edate
	}, schema)


	//handle the result
	if (result['error'] === null) {
		//console.log ( 'the date range is valid' )
		return true
	}
	else {
		//console.log ( 'the date range is not valid' )
		return false
	}
}
let checkIfIsNumber = (data) => {
	//isNaN
	let dataLength = data.length
	let regex = /[^0-9]/g
	let newData = data.replace(regex, "")
	let newDataLength = newData.length
	if (dataLength == newDataLength) {
		// if ( regex.test(data) ) {
		return true
	}
	else {
		return false
	}
}
let matchesLength = (env, Joi, length) => {
	let requiredlength = parseInt(length, 10)

	return ({
		matchesLength: Joi.string().length(requiredlength)
	})
	// try {		
	// if ( data.length === length ) {
	// 	return true
	// }
	// else { 
	// 	return false
	// }
	// }
	// catch ( e ) {
	// 	return false
	// }
}
let isEmail = (data) => {
	var re = /^(([^<>()[\]\\.,:\s@\"]+(\.[^<>()[\]\\.,:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	let isEmail = re.test(data)
	if (data && !isEmail && data.toLowerCase() === 's') {
		normalConsole(`DATA isEmail false===> ${JSON.stringify(data)}`);
		return true
	}
	else {
		normalConsole(`DATA isEmail false===> ${JSON.stringify(data)}`);
		return isEmail
	}
}

let isCorrectDefaultPin = (input, env) => {
	try {
	  //check if mode is internal authentication or external authentication
	  let isInternalAuth = env.app_config["internal-authentication"];
	  if (isInternalAuth) {
		normalConsole("FALSE");
		return false;
	  }
	  //else skip and return control to the external authenticator
	  else {
		normalConsole("TRUE");
		return true;
	  }
	}
	catch (e) {
	  normalConsole("exception: ", e);
	}
  };

let isCorrectPinInput = (input, env) => {


	//check if mode is internal authentication or external authentication
	let isInternalAuth = env.app_config["internal-authentication"]

	if (isInternalAuth) {

		//format the PIN according to the rules defined
		let oldPin = env.user_data['account-details'].pin || false

		let newPin = input
		//normalConsole('msisdn',env.user_data.msisdn,'Input pin',input,'****** Old Pin',oldPin,'******* Entered Pin',newPin)
		if (oldPin === newPin) {
			return true
		}
		else {
			return false
		}
	}

	//else skip and return control to the external authenticator
	else {
		return true
	}
}

let isCorrectPin = (input, env) => {


	//check if mode is internal authentication or external authentication
	let isInternalAuth = env.app_config["internal-authentication"]

	if (isInternalAuth) {
		let CryptoJS = require("crypto-js");
		let config =require('../../config/config.json')
		//format the PIN according to the rules defined
		let oldPin = env.user_data['account-details'].pin || false

		let newPin = CryptoJS.HmacSHA256(Buffer.from(input + env.user_data.msisdn).toString(config.security.base64), config.security.secret).toString(CryptoJS.enc.Hex);
		//normalConsole('msisdn',env.user_data.msisdn,'Input pin',input,'****** Old Pin',oldPin,'******* Entered Pin',newPin)
		if (oldPin === newPin) {
			return true
		}
		else {
			return false
		}
	}

	//else skip and return control to the external authenticator
	else {
		return true
	}
}

let operatorManagement = (input, env) => {

	return env['account-details'].operatorManagement
}

let isAgencyPin = (input, env) => {


	//check if mode is internal authentication or external authentication
	let isInternalAuth = env.app_config["internal-authentication"]

	if (isInternalAuth) {
		let CryptoJS = require("crypto-js");
		let config =require('../../config/config.json')
		//format the PIN according to the rules defined
		let oldPin = env.user_data['account-details'].pin || false

		let newPin = CryptoJS.HmacSHA512(Buffer.from(env.user_data['account-details'].loginId + input).toString(config.security.base64), config.security.hashed).toString(CryptoJS.enc.Hex);
		//normalConsole('LOGIN ID',env.user_data ['account-details'].loginId,'Input pin',input,'****** Old Pin',oldPin,'******* Entered Pin',newPin)
		if (oldPin === newPin) {
			return true
		}
		else {
			return false
		}
	}

	//else skip and return control to the external authenticator
	else {
		return true
	}
}

let isDate = (data) => {
	//format DD-MM-YYYY
	let wDashes = data.replace(/-/g, '')
	//total length is correct
	if (wDashes.length !== 8) {
		return false
	}
	let splitData = data.split('-')
	//parts are the correct length
	if (splitData[0].length !== 2) {
		return false
	}
	if (splitData[1].length !== 2) {
		return false
	}
	if (splitData[2].length !== 4) {
		return false
	}
	//contains only numbers
	if (!checkIfIsNumber(splitData[0])) {
		return false
	}
	if (!checkIfIsNumber(splitData[1])) {
		return false
	}
	if (!checkIfIsNumber(splitData[2])) {
		return false
	}
	//is a valid date
	if (parseInt(splitData[0], 10) > 31) {
		return false
	}
	if (parseInt(splitData[1], 10) > 12) {
		return false
	}
	return true
}
let checkPinStrength = (pinString) => {
	//invalid length
	if (pinString.length !== 4) {
		return { "valid": false, "msg": "invalid_pin_length" }
	}
	//Convert the PIN into an array
	let pin = []
	for (let p = 0; p < pinString.length; p++) {
		pin.push(pinString.charAt(p))
	}
	//helper function to map only unique values
	let onlyUnique = (value, index, self) => {
		return self.indexOf(value) === index
	}
	try {
		let numbers = '1,2,3,4,5,6,7,8,9,0'
		let numericArray = numbers.split(',')
		let totinvalid = pin.length
		//let unique = pin.filter(onlyUnique)
		//Ensures all digits are numbers
		for (let i = 0; i < totinvalid; i++) {
			if (numericArray.indexOf(pin[i]) == -1) {
				return { "valid": false, "msg": "alpha_characters_found" }
			}
		}
		//Ensures that the pin doesnt consist of a single character
		//let uniquePin = pin.filter(onlyUnique)
		//Ensure no sequence passwords exist e.g 1234, 4321, 9876,6789
		let sequence = []
		for (let x = 0; x < pin.length; x++) {
			let difference = pin[x] - pin[x + 1]
			sequence.push(difference)
		}
		let sequenceDetected = sequence.filter(onlyUnique)
		if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '1') {
			return { "valid": false, "msg": "easy_pin" }
		}
		if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '0') {
			return { "valid": false, "msg": "easy_pin" }
		}
		if (sequenceDetected.length == 1 && sequenceDetected[0].toString() === '-1') {
			return { "valid": false, "msg": "easy_pin" }
		}
		//ensure that no birthdays are entered
		let birthdays = []
		let date = new Date()
		let year = date.getFullYear()
		let maxyear = parseInt(year) - 18
		let minyear = parseInt(year) - 100
		for (let t = minyear; t <= maxyear; t++) {
			birthdays.push(t)
		}
		if (birthdays.indexOf(parseInt(pinString)) != -1) {
			return { "valid": false, "msg": "birthday_found" }
		}
		return { "valid": true, "msg": "valid_pin" }
	}
	catch (e) {
	}
}
let isValidPin = (data) => {
	// if (checkPinStrength(data).valid) {
	//     return true
	// }
	// else {
	//     return false
	// }

	return true
}
let isAny = () => {

	return true
}
let isStrongPin = (data) => {
	if (checkPinStrength(data).valid) {
		return true
	}
	else {
		return false
	}

	return true
}
let isEqualToLastEntry = (input, env, comparisonPath) => {

	let dot = require("dot-object")

	//check if mode is internal authentication or external authentication
	let isInternalAuth = env.app_config["internal-authentication"]

	if (isInternalAuth) {

		//format the PIN according to the rules defined
		let oldValue = dot.pick(comparisonPath, env.user_data['global-request-details'])

		//transform the entered pin
		let transform_function = env.prompt_data["transform-function"] || false

		if (transform_function) {

			let codeString = env.app_code[transform_function]

			//create a new dynamic function
			let f = new Function(codeString)

			let newValue = f({
				data: input,
				msisdn: env.user_data.msisdn,
				crypto: require("crypto-js")
			})

			if (oldValue === newValue) {
				return true
			}
			else {
				return false
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
		return true
	}
}
let isNotEqualToLastEntry = (input, env, comparisonPath) => {

	let dot = require("dot-object")

	//check if mode is internal authentication or external authentication
	let isInternalAuth = env.app_config["internal-authentication"]


	if (isInternalAuth) {

		//format the PIN according to the rules defined
		let oldValue = dot.pick(comparisonPath.trim(), env.user_data['global-request-details'])

		//transform the entered pin
		let transform_function = env.prompt_data["transform-function"] || false

		if (transform_function) {

			let codeString = env.app_code[transform_function]

			//create a new dynamic function
			let f = new Function(codeString)

			let newValue = f({
				data: input,
				msisdn: env.user_data.msisdn,
				crypto: require("crypto-js")
			})

			if (oldValue !== newValue) {
				return true
			}
			else {
				return false
			}
		}
		else {
			if (oldValue === input) {
				return false
			}
			else {
				return true
			}
		}
	}

	//else skip and return control to the external authenticator
	else {
		return true
	}
}
let isKenyanPlotNumber = (input, env, comparisonPath) => {
	return true
}
let isListEmpty = (data) => {
	normalConsole(`DATA > ${JSON.stringify(data)}`);
	if (data == undefined || data.length <= 0 || Object.keys(data)) {
		normalConsole(`DATA isListEmpty false===> ${JSON.stringify(data)}`);
		return false
	}
	else {
		normalConsole(`DATA isListEmpty true===> ${JSON.stringify(data)}`);
		return true
	}
}
let isLockSavingsAccount = (data) => {

	if (!data.startsWith('SV')) {
		return false
	}
	else {
		return true
	}

}
module.exports = {
	isListEmpty,
	isCorrectPinInput,
	hasMultiple,
	isAmount,
	isAlphaNumeric,
	isAlphaNumericSpecial,
	isEslip,
	operatorManagement,
	is4DigitPin,
	isNotOldPin,
	isAgencyPin,
	isEqualToNewPin,
	isExternalAuthentication,
	isWithinAmountRange,
	isWithinNumericRange,
	isStudentId,
	isAbove18,
	isMinimumAmt,
	isCorrectDate,
	isCorrectDefaultPin,
	isCorrectDob,
	isText,
	isStatement,
	isNumber,
	isValidDate,
	isValidDateRange,
	matchesLength,
	isEmail,
	isCorrectPin,
	isDate,
	isWithinLoanLimit,
	isValidPin,
	isAny,
	isStrongPin,
	isEqualToLastEntry,
	isNotEqualToLastEntry,
	isKenyanPlotNumber,
	isLockSavingsAccount
}