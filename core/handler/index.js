"use strict";
const { normalConsole } = require('../UssdLogs/logChalk')
class MenuHandler {
	constructor(reqObj) {
		this.path = require('path');
		this.deepmerge = require('deepmerge')

		//user data    
		this.app_name = '';
		this.app_path = './www';
		this.cache_id = '';
		this.current_step = '';
		this.user_data = {};
		this.user_input = '';

		//app data
		this.api = {};
		this.adapter = {};
		this.code = {};
		this.app_config = {};
		this.language = '';
		this.pages = {};
		this.prompts = {};
		this.prompts_cache = {};
		this.app_env = '';

		//others
		this.PREVIOUS_CHARACTER = "00";
		this.HOME_CHARACTER = "000";
		this.SKIP_CHARACTER = 's';
		this.analytics = require('../analytics/client');

		this.FormatItemAs = require("./FormatData");

		//load user data
		this.user_data = reqObj.user_data;
		this.imsi = this.user_data["imsi"];
		this.app_env = reqObj.app_env;
		this.user_input = reqObj.user_input;

		this.current_step = this.user_data["current_step"];

		//load app data
		this.api = reqObj.application_data.api;
		this.adapter = reqObj.application_data.adapter;
		this.code = reqObj.application_data.code;
		this.app_config = reqObj.application_data.config;
		this.language = reqObj.application_data.language;
		this.pages = reqObj.application_data.pages;
		this.prompts = reqObj.application_data.prompts;
		this.prompts_cache = reqObj.application_data.prompts_cache;

		//normalConsole(`reqObj.application_data 52 ${JSON.stringify(reqObj.application_data.language)}`);

		//inject the global meta data into the users data
		this.user_data = this.deepmerge.all([
			this.user_data,
			this.app_config['meta-data']
		])

		if (!this.user_data['global-constants']) {
			this.user_data['global-constants'] = this.app_config['global-constants']
		}
		else {
			this.user_data['global-constants'] = this.deepmerge.all([
				this.user_data['global-constants'],
				this.app_config['global-constants'],
				//this.app_config['meta-data']
			])
		}

		this.app_name = this.user_data["app-name"];
		this.app_path = this.path.resolve(__dirname, "..", "..", "..", 'www');
		this.cache_id = `${this.user_data["app-name"]}: clients: ${this.user_data["msisdn"]}`.replace(/\s/g, '')

		//load all keys in the language file
		let langKeys = Object.keys(this.language);
		let newLanguageFile = {
			'english': {},
			'swahili': {},
			'french': {}
		};
		let languages = Object.keys(newLanguageFile);
		for (let language of languages) {
			for (let langKey of langKeys) {
				newLanguageFile[language] = Object.assign({}, newLanguageFile[language], this.language[langKey][language]);
			}
		}
		normalConsole(`^^^user_input^^^\n${this.user_input} \n^^^^^^ ${new Date().toString()}`);
		this.language = newLanguageFile;
	}
	async run() {
		//On First Request Set Start Menu
		if (this.user_input.trim() === '') {
			this.setStartMenu();
		}

		//Load previous, current and next step data
		let data = this.loadData();
		//Handle Menu 		
		let str = await this.route(data, this.user_input);

		//Audit trail log
		// let moment = require('moment');
		// let chalk = require('chalk');
		// normalConsole(chalk.green(`[ Audit Trail ]`), chalk.cyan(` [ Time: ${moment().format()} ] - ${this.current_step}`));
		// let ac = new this.analytics();
		// //add to mongo db audit queue
		// ac.enQueue({
		//     timestamp: `${moment().unix()}`,
		//     input: this.user_input,
		//     type: 'audit',
		//     menuAccessed: str,
		//     userid: this.user_data.msisdn,
		//     ussdservice: this.app_name
		// });

		return str;
	}
	async route(data, input = this.user_input) {
		//initialize our variables
		let str = '';
		let canGoBack = data.previous || false;
		let DEFAULT_MENU_ACTION = 'routeToCurrent';
		let menuAction = DEFAULT_MENU_ACTION;


		//determine the menu action
		if (input.trim() === '') {
			menuAction = 'routeToStart';
		}
		if (input.trim() === this.PREVIOUS_CHARACTER && canGoBack) {
			menuAction = 'routeToPrevious';
		}

		switch (menuAction) {
			case 'routeToStart':
				str = await this.getString(data, false, this.current_step);
				break;
			case 'routeToPrevious':
				let tx_auth_menu = data.name === "transaction-login" ? true : false

				if (tx_auth_menu) {
					//load actual current menu data
					let curr_menu = this.user_data["transaction-authenticate-next"]

					if (curr_menu.includes('page')) {
						data = this.loadPage(curr_menu);
					}
					else {
						data = this.loadPrompt(curr_menu);
					}
				}
				str = await this.previous(data);


				break;
			case 'routeToCurrent':
				switch (data.type) {
					case 'select':
						str = await this.select(data, input);
						break;
					case 'input':
						str = await this.input(data, input);
						break;
					case 'skip':
						str = await this.skip(data);
						break;
				}
				break;
		}
		return str;
	}

	/**
	 * =======================
	 * 
	 *   SKIP HANDLING
	 * 
	 * =======================
	 */
	async skip(data) {

		// let options = data.options || false;
		// let saveAs = data['save-as'] || false;
		let str = '';
		let next = this.current_step;
		let selectAction = data.action || false;
		let nextData = '';
		let input = "s"
		let transformFormat = new this.FormatItemAs(this.user_data)

		//normalConsole('NNEEXXTT',{data})

		switch (selectAction) {
			case 'update-parameters':
				//get analytics data
				let route = data['external-fetch'].route || false;
				let format = data['external-fetch']['format-as'] || false;
				let api = data['external-fetch'].api || false;
				let cache = data['external-fetch'].cache || false;
				let cache_path = data['external-fetch']['cache-path'] || false;
				let cache_params = data['external-fetch']["cache-parameters"] || false;
				let params_check = data['external-fetch']["parameter-checks"] || false;
				let prompts = [
					data['external-fetch'].success,
					data['external-fetch'].error,
				]

				/**
				 * -------------------
				 *
				 * Formulate Request
				 *
				 * -------------------
				 */
				//format the input
				if (data['format-as'] || false) {
					input = transformFormat.formatDataAs(data['format-as'], input);
				}

				//persist the inputted data to redis
				if (data['save-as'] || false) {
					normalConsole(`221 ================== ${option.value}`);
					this.user_data['global-request-details'][data['save-as']] = option.value;
				}

				//formulate our request
				let request_query = [
					{
						name: "walletAccount", value: this.user_data["msisdn"]
					},
					{
						name: "mwallet", value: this.user_data["mwallet"]
					},
					{
						name: "limit", value: this.user_data['global-request-details']["limit"]
					},
					{
						name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
					},
					{
						name: "id", value: this.user_data["account-details"]['identification-id']
					},
					{
						name: "email", value: this.user_data["email"]
					},
					{
						name: "name", value: this.user_data["account-details"]['fullname']
					},
					{
						name: "access_token",
						value: this.user_data["access_token"]
					},
					{
						name: "imsi",
						value: this.imsi
					}
				];
				let accDetails = this.user_data["account-details"];
				let requestDetails = this.user_data['global-request-details'];
				let query_data = { ...accDetails, ...requestDetails };

				let query_data_keys = Object.keys(query_data);
				for (let item of query_data_keys) {
					let obj = {
						name: item,
						value: query_data[item]
					}
					request_query.push(obj);
				}

				/**
				 * -------------------
				 *
				 * Call the API
				 *
				 * -------------------
				 */
				//fetch data from the API
				let Api = require('../api/api.js');
				let apiHandler = new Api(
					this.api, //api configuration settings: JSON
					this.code, // custom code: JSON
					this.app_config['api-environment'],
					this.app_config['api-name'],
					this.adapter
				);

				//run the api user profile call
				let apiResult = await apiHandler.run(route, request_query);

				/**
				 * ------------------------
				 *
				 * Update local parameters
				 *
				 * ------------------------
				 */
				//if responses are required, then we can redirect to another menu on error
				//examples: presentments for fetching bill amounts
				let api_response = 'success';
				//handle the api response (  it is assumed that it always returns a success or error as the status )
				let response_map = {
					'success': 0,
					"failed": 1
				};




				//on-success: perform success handling if allowed

				if (apiResult.status === 'success' && cache) {
					normalConsole(`{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{${"SUCCESS", new Date().toString()}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}`);
					next = prompts[response_map[api_response]];
					let valuesObject = apiResult.message;
					let valueKeys = Object.keys(apiResult.message);
					for (let key of valueKeys) {
						let value = valuesObject[key];
						if (format !== 'undefined') {
							value = transformFormat.formatDataAs(format, value);
						}
						if (cache_path) {
							this.user_data[cache_path][key] = value;
						}
						else {
							this.user_data[key] = value;
						}
					}
					let success_handler = data['external-fetch']["error-handler"] || false;
					if (success_handler) {
						let success_function = data['external-fetch']["success-handler"]['handler'] || false;
						let argument_name = data['external-fetch']["success-handler"]['argument'] || false;
						let save_result_as = data['external-fetch']["success-handler"]['save-as'] || false;
						if (argument_name) {
							let argument = this.user_data[argument_name];
							//run the function
							let codeString = this.code[success_function];
							//create a new dynamic function
							let f = new Function(codeString);
							let success_function_result = f(argument);
							//persist to redis
							this.user_data[save_result_as] = success_function_result;
						}
					}

					//handle cache parameters
					if (apiResult.data && cache_params) {
						let obj = {
						}

						for (let param of cache_params) {

							let dot = require('dot-object')

							let name = param["save-as"]
							let formatAs = param["format-as"] || false
							let data = dot.pick(param["path"], apiResult.data)

							normalConsole(`PARAMS_CHECK =====>${JSON.stringify(obj[name])} \n == ${new Date().toString()}`);

							if (formatAs) {
								data = transformFormat.formatDataAs(formatAs, data)
							}

							obj[name] = data

							normalConsole(`366 DATA FROM FETCH API = ${data}`);

							normalConsole(`PARAMS_CHECK 1=====>${JSON.stringify(obj[name])} =====${new Date().toString()}`);

							if (params_check && typeof (params_check) === 'object' && Object.keys(params_check).includes(name)) {

								normalConsole(`PARAMS_CHECK 2=====>${JSON.stringify(params_check)} \n ==${new Date().toString()}`);
								let check_object = params_check[name]

								normalConsole(`PARAMS_CHECK 3=====>${JSON.stringify(check_object)} ${new Date().toString()}`);

								let minParamValue = check_object["is-less-than"]

								if (minParamValue.startsWith('__')) {
									minParamValue = minParamValue.replace(/__/, '')
									minParamValue = this.user_data['global-request-details'][minParamValue]
								}


								let minimum = parseInt(minParamValue)
								normalConsole(`PARAMS_CHECK 4=====>${minimum} NUMBER==${Number(minimum)}`);

								let parsedJSON = JSON.stringify(data)
								normalConsole(`PARAMS_CHECK 5=====>${parsedJSON}  == DATA ${data}  ${new Date().toString()}`);

								if (data.length <= 0 || data == undefined) {

									next = check_object['redirect-to'];
									//normalConsole(`PARAMS_CHECK 6=====>${data.length}`);
								} else {
									//next = check_object['redirect-to'];
									normalConsole(`PARAMS_CHECK 7=====>${data.length}  ${new Date().toString()}`);
								}

								// if (Number(parsedValue) < Number(minimum)) {
								// 	next = check_object['redirect-to'];
								// }

							}


						}
						//{ obj: { charge: 0, excise_duty: 0, esb_ref: 2447 } }

						if (cache_path) {

							// if ( Object.keys(obj).length === 1 && Object.keys(obj)[0]==='ROOT'){
							// 	let newObj = obj [ 'ROOT' ]

							// 	for ( let key of Object.keys ( newObj ) ) {
							// 		this.user_data[cache_path][key] = newObj [ key ];
							// 	}
							// }
							// else{

							// }

							for (let key of Object.keys(obj)) {
								this.user_data[cache_path][key] = obj[key];
							}
						}
					}
				}


				//on-error: perform error handling if enabled
				else if (apiResult.status !== 'success') {
					normalConsole(`{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{${"FAILED SORRY", new Date().toString()}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}`);
					api_response = 'failed';
					this.user_data['global-request-details']['errMessage'] = apiResult.message;
					next = prompts[response_map[api_response]];
					let error_handler = data['external-fetch']["error-handler"] || false;
					if (error_handler) {
						let error_function = data['external-fetch']["error-handler"]['handler'] || false;
						let argument_name = data['external-fetch']["error-handler"]['argument'] || false;
						let save_result_as = data['external-fetch']["error-handler"]['save-as'] || false;
						if (argument_name) {
							//run the error handler function
							let argument = this.user_data[argument_name];
							//run the function
							let codeString = this.code[error_function];
							//create a new dynamic function
							let f = new Function(codeString);
							let error_function_result = f(argument);
							//persist to redis
							this.user_data[save_result_as] = error_function_result;
							//check if any thresholds have been set
							let threshold = data['external-fetch']["error-handler"]['threshold'] || false;
							let redirect_on_threshold = data['external-fetch']["error-handler"]['redirect-on-threshold'] || false;
							//normalConsole(data['external-fetch']["error-handler"]);

							let pinTrialsRemaining = parseInt(this.user_data["pin-trials-remaining"], 10);

							if (pinTrialsRemaining <= 0) {
								next = redirect_on_threshold;
							}
							if (threshold && error_function_result.toString() === threshold && redirect_on_threshold) {
								next = redirect_on_threshold;
								//run the threshold function
							}
						}
					}
				}

				/**
				 * ------------------------
				 *
				 * Load next menu
				 *
				 * ------------------------
				 *  { data:
						{ type: 'select',
						name: 'pesalink-to-phone-lookup-banks',
						'save-as': 'pesalinkToPhoneSortCode',
						options: [],
						'options-error': 'pesalink-to-phone-lookup-banks-options-error',
						error: 'pesalink-to-phone-lookup-banks-error',
						previous: 'pesalink-to-phone-credit-account',
						next: 'pesalink-to-phone-amount' } }
				 */

				if (data.type === 'select' && data.options.length === 0) {
					next = nextData['options-error'];
					//load new Data
					if (next.includes('page')) {
						nextData = this.loadPage(next);
					}
					else {
						nextData = this.loadPrompt(next);
					}
				}
				if (nextData.type === 'select' && typeof (nextData.options) === 'string') {
					let nextOptions = this.user_data['account-details'][nextData.options] || this.user_data['global-constants'][nextData.options] || this.user_data['global-request-details'][nextData.options];
					if (!nextOptions || nextOptions.length === 0) {
						next = nextData['options-error'];
						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
					}
				}

				// if (data.nextData.type === 'select' && typeof ( data.nextData.options) ==='string' 
				//     // normalConsole("next data is a select and is missing its options");

				// }
				//handle show if
				if (nextData['show-if'] || false) {
					//normalConsole(`show-if 489=========>${JSON.stringify(this.user_data)}`);
					//fetch the param
					let dot = require('dot-object')
					let paramValue = dot.pick(nextData['show-if']['param'], this.user_data)

					let validators = require('./validators');
					let validationRules = validators[nextData['show-if']['validates-to']];
					let validate = validationRules(paramValue, this.user_data);

					if (!validate) {
						next = nextData['show-if']['on-error'];
						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}

						showIf = true
					}
				}
				if (next.includes('page')) {
					nextData = this.loadPage(next);
				}
				else {
					nextData = this.loadPrompt(next, this.user_data);
				}

				str = await this.getString(nextData, false, next);
				/**
				 * ------------------------
				 *
				 * Perform Analytics
				 *
				 * ------------------------
				 */
				// let moment = require('moment');
				// const shortid = require('shortid');
				// let ac = new this.analytics();
				// let analyticsTransaction = {
				//     timestamp: `${moment().unix()}`,
				//     type: 'transaction',
				//     name: route,
				//     charge: '',
				//     amount: '',
				//     txid: shortid.generate().replace(/[^a-zA-Z0-9]/g, '80X').toUpperCase(),
				//     userid: this.user_data.msisdn,
				//     ussdservice: this.app_name
				// };
				// ac.enQueue(analyticsTransaction);
				break;
				break;
			case 'transact':
				switch (input) {
					case '1':


						//check for inapp authentication
						let authenticate_transactions = this.app_config["authenticate-transactions"] || false
						let authenticate_menu = data["authenticate"] || false

						if (authenticate_transactions || authenticate_menu) {

							this.user_data["transaction-authenticate-next"] = data.name
							this.user_data["transaction-authenticate-fetch"] = data['external-fetch']
							this.user_data["transaction-authenticate-previous"] = data.previous

							//load the transaction login prompt
							next = "transaction-login"

							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}
						}
						else {
							//get analytics data
							let route = data['external-fetch'].route;
							//let api_name = data['external-fetch'].api;


							//let cache = data['external-fetch'].cache || false;
							let cache_path = data['external-fetch']['cache-path'] || false;
							let cache_params = data['external-fetch']["cache-parameters"] || false;


							let prompts = [
								data['external-fetch'].success,
								data['external-fetch'].error,
							];


							//formulate our request
							let request_query = [
								{
									name: "walletAccount",
									value: this.user_data["msisdn"]
								},
								{
									name: "mwallet", value: this.user_data["mwallet"]
								},
								{
									name: "limit", value: this.user_data['global-request-details']["limit"]
								},
								{
									name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
								},
								{
									name: "id", value: this.user_data["account-details"]['identification-id']
								},
								{
									name: "email", value: this.user_data["email"]
								},
								{
									name: "name", value: this.user_data["account-details"]['fullname']
								},
								{
									name: "access_token",
									value: this.user_data["access_token"]
								},
								{
									name: "imsi",
									value: this.imsi
								},
								{
									name: "regImsi",
									value: this.imsi
								}
							];

							let accDetails = this.user_data["account-details"];
							let requestDetails = this.user_data['global-request-details'];
							let query_data = { ...accDetails, ...requestDetails };
							let query_data_keys = Object.keys(query_data);
							for (let item of query_data_keys) {
								let obj = {
									name: item,
									value: query_data[item]
								};
								request_query.push(obj);
							}


							//fetch data from the API
							let Api = require('../api/api.js');
							let apiHandler = new Api(this.api, //api configuration settings : JSON
								this.code, // custom code : JSON
								this.app_config['api-environment'], this.app_config['api-name'],
								this.adapter);


							//run the api user profile call
							let apiResult = await apiHandler.run(route, request_query);
							let api_response = 'success';

							//this.user_data['global-request-details'] = {}//reset the global request details



							//on-success, persist user data
							if (apiResult.status === 'success') {
								api_response = 'success';
								//handle cache parameters
								if (apiResult.data && cache_params) {

									let obj = {
									}

									for (let param of cache_params) {

										let dot = require('dot-object')
										let data = dot.pick(param["path"], apiResult.data)

										let saveAs = param["save-as"] || false
										let formatAs = param["format-as"] || false
										if (saveAs) {

											if (saveAs instanceof Array) {
												let splitBy = param['item-delimiter']
												let values = data.split(splitBy)

												for (let index in values) {
													if (formatAs) {
														obj[saveAs[index]] = transformFormat.formatDataAs(formatAs[index], values[index])
													}
													else {
														obj[saveAs[index]] = values[index]
													}
												}
											}
											else {

												if (formatAs) {
													data = transformFormat.formatDataAs(formatAs, data)
												}
												obj[saveAs] = data
											}

										}



										// "path"          : "field54",
										// "item-delimiter": "|",
										// "save-as"       : ["actual-balance", "available-balance" ]
									}

									if (cache_path) {

										for (let key of Object.keys(obj)) {
											this.user_data[cache_path][key] = obj[key];
										}
									}
								}
							}
							else {
								api_response = 'failed';


								if (apiResult.message) {


									this.user_data['global-request-details']['errMessage'] = apiResult.message;
								}
								else {
									//persist to redis
									let formatApiRoute = route
										.replace(/[^a-zA-Z_-]/g, '')
										.replace(/[_-]/g, ' ')
										.toLowerCase();
									this.user_data['global-request-details']['errMessage'] = `the ${formatApiRoute} request was not successful`;
								}
							}
							//handle the api response (  it is assumed that it always returns a success or error as the status )
							let response_map = {
								'success': 0,
								"failed": 1
							};
							//load the next menu data to use to create a menu response string
							next = prompts[response_map[api_response]];
							let d = this.loadPrompt(next);
							nextData = d;


							//check for cache data
							/**
								 *                     "actual_balance": 380770.35,
								"available_balance": 379770.35
							*/





							//persist to redis
							let formatApiRoute = route
								.replace(/[^a-zA-Z_-]/g, '')
								.replace(/[_-]/g, ' ')
								.toLowerCase();
							this.user_data['global-request-details']['requestName'] = formatApiRoute;
							// let moment = require('moment');
							// const shortid = require('shortid');
							// let ac = new this.analytics();
							// let analyticsTransaction = {
							// 	timestamp: `${moment().unix()}`,
							// 	type: 'transaction',
							// 	name: route,
							// 	charge: '',
							// 	amount: '',
							// 	txid: shortid.generate().replace(/[^a-zA-Z0-9]/g, '80X').toUpperCase(),
							// 	userid: this.user_data.msisdn,
							// 	ussdservice: this.app_name
							// };
							// ac.enQueue(analyticsTransaction);
						}

						break;
					//load the next step which should be the client module
					case '2':
						next = data['on-cancel'] || false;
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
						break;
				}
				break;
			case 'navigate':
				switch (input) {
					//Next step data is already loaded for a basic switch
					case '1':
						next = data['on-accept'];
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
						break;
					//load the next step which should be the client module
					case '2':
						next = data['on-cancel'];
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
						if (next.includes('logout')) {
						}
						break;
				}
				break;
			case "update-local":
				if (input !== '2') {
					let dot = require('dot-object');
					let localPath = data['local-path'].replace(/\s/g, '') || false;
					/**
					 * IMPORTANT! local path has been set to only be two levels deep at maximum
					 * hence data to be set should either be at the root level or on the first
					 * nested level
					 * e.g
					 * LEVEL 1: language=value OR
					 * LEVEL 2: account-details>language=value
					 */
					if (localPath) {
						let localPathArray = localPath.split('=');
						let path = localPathArray[0];
						let valueKey = localPathArray[1];
						let pathParts = [];
						let value = this.user_data['global-request-details'][valueKey];
						if (path.includes('>')) {
							pathParts = path.split('>');
							pathParts = pathParts.filter((p) => {
								return p !== '';
							});
							//update the path with the new value
							dot.str(pathParts.join('.'), value, this.user_data);
						}
						else {
							this.user_data[path] = value;
						}
						this.user_data = await this.refresh(this.cache_id, this.user_data);
					}
					else {
					}
				}
				break;
		}

		//skip

		// normalConsole({nextData, data, input}) 
		// if ( nextData.type === 'skip') {
		// 	this.inputIsValid = true;
		// 	console.log ( `<<<<< SKIP MENU >>>>>`)
		// 	str = await  this.skip ( nextData ) 
		// 	console.log ( `<<<<< SKIP MENU END ${str}>>>>>`)
		// }


		return str
	}


	async input(data, input) {
		let transformFormat = new this.FormatItemAs(this.user_data)
		//refresh our data
		let newData = await this.fetchCache(this.cache_id)
		this.user_data['global-constants'] = newData['global-constants']

		//initialize our variables
		//let allowNull = data.canBeEmpty || false;
		let strPrompt = '';
		let str = '';
		let next = '';
		let nextData = '';
		let action = data.action || false;
		let all_actions = ["update-parameters", "transact", "update-local"];
		let internal_fetch_enabled = data['internal-fetch'] || false
		let authenticate_transactions = this.app_config["authenticate-transactions"] || false
		let tx_auth_menu = data.name === "transaction-login" ? true : false


		//normalConsole('>>>>>>>>>>>>>>?????????????????????',{tx_auth_menu,data})

		//fetch the authentication method
		// let isInternalAuth = this.app_config [ "internal-authentication" ]

		//perform any transforms

		//validate
		let { inputIsValid, failedValidationIndex } = this.validate(data, input);

		//authenticate the input and process if valid
		if (tx_auth_menu && inputIsValid) {

			//perform the fetch process
			//get analytics data
			normalConsole(`[ Analytics ] user has run an Api call at the end of a transaction...${new Date().toString()}`);
			let route = this.user_data['transaction-authenticate-fetch'].route;
			//let api_name = this.user_data['transaction-authenticate-fetch'].api;


			//let cache = this.user_data['transaction-authenticate-fetch'].cache || false;
			let cache_path = this.user_data['transaction-authenticate-fetch']['cache-path'] || false;
			let cache_params = this.user_data['transaction-authenticate-fetch']["cache-parameters"] || false;


			let prompts = [
				this.user_data['transaction-authenticate-fetch'].success,
				this.user_data['transaction-authenticate-fetch'].error,
			];


			//formulate our request
			let request_query = [
				{
					name: "walletAccount",
					value: this.user_data["msisdn"]
				},
				{
					name: "mwallet", value: this.user_data["mwallet"]
				},
				{
					name: "limit", value: this.user_data['global-request-details']["limit"]
				},
				{
					name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
				},
				{
					name: "id", value: this.user_data["account-details"]['identification-id']
				},
				{
					name: "email", value: this.user_data["email"]
				},
				{
					name: "name", value: this.user_data["account-details"]['fullname']
				},
				{
					name: "firstname", value: this.user_data["account-details"]['firstname']
				},
				{
					name: "access_token",
					value: this.user_data["access_token"]
				},
				{
					name: "imsi",
					value: this.imsi
				}
			];
			let accDetails = this.user_data["account-details"];
			let requestDetails = this.user_data['global-request-details'];
			let query_data = { ...accDetails, ...requestDetails }
			let query_data_keys = Object.keys(query_data);
			for (let item of query_data_keys) {
				let obj = {
					name: item,
					value: query_data[item]
				};
				request_query.push(obj);
			}


			//fetch data from the API
			let Api = require('../api/api.js');
			let apiHandler = new Api(
				this.api, //api configuration settings : JSON
				this.code, // custom code : JSON
				this.app_config['api-environment'],
				this.app_config['api-name'],
				this.adapter
			);


			//run the api user profile call
			let apiResult = await apiHandler.run(route, request_query);
			let api_response = 'success';

			this.user_data['global-request-details'] = {}//reset the global request details



			//on-success, persist user data
			if (apiResult.status === 'success') {
				api_response = 'success';
				//handle cache parameters
				if (apiResult.data && cache_params) {

					let obj = {
					}

					for (let param of cache_params) {

						let dot = require('dot-object')
						let data = dot.pick(param["path"], apiResult.data)

						let saveAs = param["save-as"] || false
						let formatAs = param["format-as"] || false
						if (saveAs) {

							if (saveAs instanceof Array) {
								let splitBy = param['item-delimiter']
								let values = data.split(splitBy)

								for (let index in values) {
									if (formatAs) {
										obj[saveAs[index]] = transformFormat.formatDataAs(formatAs[index], values[index])
									}
									else {
										obj[saveAs[index]] = values[index]
									}
								}
							}
							else {


								if (formatAs) {
									data = transformFormat.formatDataAs(formatAs, data)
								}
								obj[saveAs] = data
							}

						}



						// "path"          : "field54",
						// "item-delimiter": "|",
						// "save-as"       : ["actual-balance", "available-balance" ]
					}

					if (cache_path) {

						for (let key of Object.keys(obj)) {
							this.user_data[cache_path][key] = obj[key];
						}
					}
				}
			}
			else {
				api_response = 'failed';


				if (apiResult.message) {


					this.user_data['global-request-details']['errMessage'] = apiResult.message;
				}
				else {
					//persist to redis
					let formatApiRoute = route
						.replace(/[^a-zA-Z_-]/g, '')
						.replace(/[_-]/g, ' ')
						.toLowerCase();
					this.user_data['global-request-details']['errMessage'] = `the ${formatApiRoute} request was not successful`;
				}
			}
			//handle the api response (  it is assumed that it always returns a success or error as the status )
			let response_map = {
				'success': 0,
				"failed": 1
			};
			//load the next menu data to use to create a menu response string
			next = prompts[response_map[api_response]];
			let d = this.loadPrompt(next);
			nextData = d;


			//check for cache data
			/**
				*                     "actual_balance": 380770.35,
				"available_balance": 379770.35
			*/







			//persist to redis
			let formatApiRoute = route
				.replace(/[^a-zA-Z_-]/g, '')
				.replace(/[_-]/g, ' ')
				.toLowerCase();
			this.user_data['global-request-details']['requestName'] = formatApiRoute;
			// let moment = require('moment');
			// const shortid = require('shortid');
			// let ac = new this.analytics();
			// let analyticsTransaction = {
			// 	timestamp: `${moment().unix()}`,
			// 	type: 'transaction',
			// 	name: route,
			// 	charge: '',
			// 	amount: '',
			// 	txid: shortid.generate().replace(/[^a-zA-Z0-9]/g, '80X').toUpperCase(),
			// 	userid: this.user_data.msisdn,
			// 	ussdservice: this.app_name
			// };
			// ac.enQueue(analyticsTransaction);

			//skip

			//normalConsole({nextData, data, input}) 
			if (nextData.type === 'skip') {
				this.inputIsValid = true;
				//console.log ( `<<<<< SKIP MENU >>>>>`)
				str = await this.skip(nextData)
				//console.log ( `<<<<< SELECT SKIP MENU END ${str}>>>>>`)
			} else {

				str = await this.getString(nextData, false, next);
			}


			return str
		}

		//throw an error if not valid
		else if (tx_auth_menu && authenticate_transactions && !inputIsValid) {
			let error_handler = data["transaction-auth"]["error-handler"] || false;

			if (error_handler) {
				let error_function = data["transaction-auth"]["error-handler"]['handler'] || false;
				let argument_name = data["transaction-auth"]["error-handler"]['argument'] || false;
				let save_result_as = data["transaction-auth"]["error-handler"]['save-as'] || false;
				next = data["transaction-auth"]["error"]


				if (argument_name) {

					//run the error handler function
					let argument = this.user_data[argument_name];

					//run the function
					let codeString = this.code[error_function];
					//create a new dynamic function
					let f = new Function(codeString);
					let error_function_result = f(argument);



					//persist to redis
					this.user_data[save_result_as] = error_function_result;
					//check if any thresholds have been set
					let threshold = data["transaction-auth"]["error-handler"]['threshold'];
					let redirect_on_threshold = data["transaction-auth"]["error-handler"]['redirect-on-threshold'] || false;
					//let threshold_handler = data["transaction-auth"]["error-handler"]['threshold-handler'] || false;

					if (
						error_function_result === threshold &&
						redirect_on_threshold
					) {
						next = redirect_on_threshold;
					}
				}

				if (next.includes('page')) {
					data = this.loadPage(next);
				}
				else {
					data = this.loadPrompt(next);
				}
				await this.fetchCharges(data)
				str = await this.getString(data, false, next);
				return str
			}
		}

		//search input
		if (action && action === 'search') {
			this.user_data["global-request-details"]["search_item"] = input;
			this.user_data["global-request-details"]["searchItem"] = input;

			//we dont need to validate the input, all we need to do is to perform a search
			let datasetName = data['search-options'].dataset;
			let searchLimit = data['search-options'].limit;
			let saveToName = data['search-options'].saveTo;
			let dataset = this.user_data["global-constants"][datasetName];

			//perform a search
			let searchResults = dataset.filter((item) => {
				let formattedName = item.label.toLowerCase().replace(/\s/g, '');
				let formattedInput = input.toLowerCase().replace(/\s/g, '').replace(/[^a-z]/g, '');
				if (formattedName.includes(formattedInput) && formattedInput.trim() !== '') {
					return item;
				}
			});

			//error handling
			let error = 'MATCHES_FOUND';
			let overridePrompt = false;

			//No Results
			if (searchResults.length === 0) {
				error = 'NO_MATCH';
			}

			//too many results			
			else if (searchResults.length > 0 && searchResults.length > searchLimit) {
				error = 'LIMIT_EXCEEDED';
			}

			switch (error) {
				case "MATCHES_FOUND":
					// go to the next step
					this.user_data["account-details"][saveToName] = searchResults;
					this.user_data["global-request-details"]["search_item"] = input;
					next = data.next;
					this.save(this.cache_id, this.user_data);
					let nextData = '';
					if (next.includes('page')) {
						nextData = this.loadPage(next);
					}
					else {
						nextData = this.loadPrompt(next);
					}
					nextData.options = searchResults;
					await this.fetchCharges(nextData)
					str = await this.getString(nextData, false, next);
					break;
				case "NO_MATCH":
					//show error prompt for no match
					overridePrompt = data.errors[0];
					this.user_data["global-request-details"]["search_item"] = input;
					this.save(this.cache_id, this.user_data);
					await this.fetchCharges(data.nextData)
					str = await this.getString(data, overridePrompt);
					break;
				case "LIMIT_EXCEEDED":
					//show error prompt for limit exceeded
					overridePrompt = data.errors[1];
					await this.fetchCharges(data.nextData)
					str = await this.getString(data, overridePrompt);
					break;
			}
		}
		//external fetch input ( presentments, login, etc )
		else if (action && all_actions.includes(action)) {
			if (inputIsValid) {
				switch (action) {
					case 'update-parameters':
						//get analytics data
						let route = data['external-fetch'].route || false;
						let format = data['external-fetch']['format-as'] || false;
						let api = data['external-fetch'].api || false;
						let cache = data['external-fetch'].cache || false;
						let cache_path = data['external-fetch']['cache-path'] || false;
						let cache_params = data['external-fetch']["cache-parameters"] || false;
						let params_check = data['external-fetch']["parameter-checks"] || false;
						let prompts = [
							data['external-fetch'].success,
							data['external-fetch'].error,
						]

						/**
						 * -------------------
						 *
						 * Formulate Request
						 *
						 * -------------------
						 */
						//format the input
						if (data['format-as'] || false) {
							input = transformFormat.formatDataAs(data['format-as'], input);
						}

						//persist the inputted data to redis
						if (data['save-as'] || false) {
							this.user_data['global-request-details'][data['save-as']] = input;
						}

						/////////////////////////EDITED BY DAN/////////////////////////////////////
						//persist the inputted data to redis
						if (data["save-to-account-details"] || false) {
							normalConsole(`===========SAVE-TO-ACCOUNT-DETAILS================= ${input} +++++++*****************++++++${new Date().toString()}+++++++++`);
							this.user_data["account-details"][data["save-to-account-details"]] = input;
						}

						if (data["save-without-format"] || false) {
							//input = input.replace(/[.]/g, " ");
							normalConsole(`#############${new Date().toString()}#####**********************************`, input);
							this.user_data["global-request-details"][data["save-without-format"]] = input[0].value;
						}

						//formulate our request
						let request_query = [
							{
								name: "walletAccount", value: this.user_data["msisdn"]
							},
							{
								name: "mwallet", value: this.user_data["mwallet"]
							},
							{
								name: "limit", value: this.user_data['global-request-details']["limit"]
							},
							{
								name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
							},
							{
								name: "id", value: this.user_data["account-details"]['identification-id']
							},
							{
								name: "email", value: this.user_data["email"]
							},
							{
								name: "name", value: this.user_data["account-details"]['fullname']
							},
							{
								name: "firstname", value: this.user_data["account-details"]['firstname']
							},
							{
								name: "access_token",
								value: this.user_data["access_token"]
							},
							{
								name: "imsi",
								value: this.imsi
							}
						];
						let accDetails = this.user_data["account-details"];
						let requestDetails = this.user_data['global-request-details'];
						let query_data = { ...accDetails, ...requestDetails }
						let query_data_keys = Object.keys(query_data);
						for (let item of query_data_keys) {
							let obj = {
								name: item,
								value: query_data[item]
							}
							request_query.push(obj);
						}

						/**
						 * -------------------
						 *
						 * Call the API
						 *
						 * -------------------
						 */
						//fetch data from the API
						let Api = require('../api/api.js');
						let apiHandler = new Api(
							this.api, //api configuration settings: JSON
							this.code, // custom code: JSON
							this.app_config['api-environment'],
							this.app_config['api-name'],
							this.adapter
						);

						//run the api user profile call
						let apiResult = await apiHandler.run(route, request_query);

						/**
						 * ------------------------
						 *
						 * Update local parameters
						 *
						 * ------------------------
						 */
						//if responses are required, then we can redirect to another menu on error
						//examples: presentments for fetching bill amounts
						let api_response = 'success';
						//handle the api response (  it is assumed that it always returns a success or error as the status )
						let response_map = {
							'success': 0,
							"failed": 1
						};

						//load the next menu data to use to create a menu response string
						next = prompts[response_map[api_response]];

						//on-success: perform success handling if allowed
						if (apiResult.status === 'success' && cache) {
							let valuesObject = apiResult.message;
							let valueKeys = Object.keys(apiResult.message);
							for (let key of valueKeys) {
								let value = valuesObject[key];
								if (format !== 'undefined') {
									value = transformFormat.formatDataAs(format, value);
								}
								if (cache_path) {
									this.user_data[cache_path][key] = value;
								}
								else {
									this.user_data[key] = value;
								}
							}
							let success_handler = data['external-fetch']["error-handler"] || false;
							if (success_handler) {
								let success_function = data['external-fetch']["success-handler"]['handler'] || false;
								let argument_name = data['external-fetch']["success-handler"]['argument'] || false;
								let save_result_as = data['external-fetch']["success-handler"]['save-as'] || false;
								if (argument_name) {
									let argument = this.user_data[argument_name];
									//run the function
									let codeString = this.code[success_function];
									//create a new dynamic function
									let f = new Function(codeString);
									let success_function_result = f(argument);
									//persist to redis
									this.user_data[save_result_as] = success_function_result;
								}
							}

							//handle cache parameters
							if (apiResult.data && cache_params) {
								let obj = {}
								for (let param of cache_params) {

									let dot = require('dot-object')

									let name = param["save-as"]
									let data = dot.pick(param["path"], apiResult.data)
									let formatAs = param["format-as"]

									if (formatAs) {
										data = transformFormat.formatDataAs(formatAs, data)
									}

									obj[name] = data
									if (params_check && typeof (params_check) === 'object' && Object.keys(params_check).includes(name)) {
										let check_object = params_check[name]
										let minParamValue = check_object["is-less-than"]

										//normalConsole({minParamValue})
										if (minParamValue.startsWith('__')) {
											minParamValue = minParamValue.replace(/__/, '')
											minParamValue = this.user_data['global-request-details'][minParamValue]
										}

										//normalConsole({minParamValue})
										let minimum = parseFloat(minParamValue).toFixed(2)
										let parsedValue = parseFloat(data).toFixed(2)
										//normalConsole({minimum, parsedValue, next})
										// minimum: '4.00',
										// parsedValue: '12.00',
										if (Number(parsedValue) <= Number(minimum)) {
											next = check_object['redirect-to'];
										}

									}


								}

								if (cache_path) {
									if (Object.keys(obj).length === 1 && Object.keys(obj)[0] === 'ROOT') {

										let keys = Object.keys(obj['ROOT']);
										for (let key of keys) {
											let cpath = key;
											let cvalue = obj['ROOT'][key]
											for (let item of Object.keys(cvalue)) {
												this.user_data[cpath][item] = cvalue[item];
											}
										}

									}
									else {
										for (let key of Object.keys(obj)) {
											this.user_data[cache_path][key] = obj[key];
										}
									}
								}
							}
						}
						//on-error: perform error handling if enabled
						else {
							api_response = 'failed';
							this.user_data['global-request-details']['errMessage'] = apiResult.message;
							next = prompts[response_map[api_response]];
							let error_handler = data['external-fetch']["error-handler"] || false;
							if (error_handler) {
								let error_function = data['external-fetch']["error-handler"]['handler'] || false;
								let argument_name = data['external-fetch']["error-handler"]['argument'] || false;
								let save_result_as = data['external-fetch']["error-handler"]['save-as'] || false;
								if (argument_name) {
									//run the error handler function
									let argument = this.user_data[argument_name];
									//run the function
									let codeString = this.code[error_function];
									//create a new dynamic function
									let f = new Function(codeString);
									let error_function_result = f(argument);
									//persist to redis
									this.user_data[save_result_as] = error_function_result;
									//check if any thresholds have been set
									let threshold = data['external-fetch']["error-handler"]['threshold'] || false;
									let redirect_on_threshold = data['external-fetch']["error-handler"]['redirect-on-threshold'] || false;
									let pinTrialsRemaining = parseInt(this.user_data["pin-trials-remaining"], 10);

									if (pinTrialsRemaining <= 0) {
										next = redirect_on_threshold;
									}
									//let threshold_handler = data['external-fetch']["error-handler"]['threshold-handler'] || false;
									if (threshold && error_function_result.toString() === threshold && redirect_on_threshold) {
										next = redirect_on_threshold;
										//run the threshold function
									}
								}
							}
						}
						/**
						 * ------------------------
						 *
						 * Load next menu
						 *
						 * ------------------------
						 */
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}

						if (nextData.type === 'select' && nextData.options.length === 0) {
							next = nextData['options-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}
						}
						if (nextData.type === 'select' && typeof (nextData.options) === 'string') {


							let nextOptions = this.user_data['account-details'][data.options] || this.user_data['global-constants'][data.nextData.options];

							if (!nextOptions || nextOptions.length === 0) {
								next = data.nextData['options-error'];
								//load new Data
								if (next.includes('page')) {
									nextData = this.loadPage(next);
								}
								else {
									nextData = this.loadPrompt(next);
								}
							}

						}

						//handle show if
						if (nextData['show-if'] || false) {
							////normalConsole(`show-if 1535=========>${JSON.stringify(this.user_data)}`);
							//fetch the param
							let dot = require('dot-object')
							let paramValue = dot.pick(nextData['show-if']['param'], this.user_data)

							let validators = require('./validators');
							let validationRules = validators[nextData['show-if']['validates-to']];
							let validate = validationRules(paramValue, this.user_data);

							if (!validate) {
								next = nextData['show-if']['on-error'];
								//load new Data
								if (next.includes('page')) {
									nextData = this.loadPage(next);
								}
								else {
									nextData = this.loadPrompt(next);
								}

								showIf = true
							}
						}

						await this.fetchCharges(nextData)
						str = await this.getString(nextData, false, next);
						/**
						 * ------------------------
						 *
						 * Perform Analytics
						 *
						 * ------------------------
						 */
						// let moment = require('moment');
						// const shortid = require('shortid');
						// let ac = new this.analytics();
						// let analyticsTransaction = {
						//     timestamp: `${moment().unix()}`,
						//     type: 'transaction',
						//     name: route,
						//     charge: '',
						//     amount: '',
						//     txid: shortid.generate().replace(/[^a-zA-Z0-9]/g, '80X').toUpperCase(),
						//     userid: this.user_data.msisdn,
						//     ussdservice: this.app_name
						// };
						// ac.enQueue(analyticsTransaction);
						break;
				}
			}
			else {
				//NB: failedValidationIndex is the index of the validation error which maps to the key of the error menu in the json component configuration
				let hasError = data.error || false;
				let hasErrors = data.errors || false;
				let error = false;
				if (hasError) {
					error = data.error;
				}
				if (hasErrors) {
					error = data.errors[failedValidationIndex];
				}
				await this.fetchCharges(nextData)
				str = await this.getString(data, `${error}`, this.current_step);
				strPrompt = `${error}`;
			}
		}
		//normal input
		else {
			//Show Next Step Prompt on success : input passed validation 
			let skipEntry = data.skip || false

			if (inputIsValid || input.trim().toLowerCase() === this.SKIP_CHARACTER && skipEntry) {

				if (input.trim().toLowerCase() === this.SKIP_CHARACTER) {
					input = ''
				}

				//persist the next state
				next = data.next;

				//for internal fetches, e.g internal login validation, we will fetch new data
				//on-success: perform success handling if allowed
				if (internal_fetch_enabled) {
					let success_handler = data['internal-fetch']["success-handler"] || false;
					if (success_handler) {
						let success_function = data['internal-fetch']["success-handler"]['handler'] || false;
						let argument_name = data['internal-fetch']["success-handler"]['argument'] || false;
						let save_result_as = data['internal-fetch']["success-handler"]['save-as'] || false;
						if (argument_name) {
							let argument = this.user_data[argument_name];
							//run the function
							let codeString = this.code[success_function];
							//create a new dynamic function
							let f = new Function(codeString);
							let success_function_result = f(argument);
							//persist to redis
							this.user_data[save_result_as] = success_function_result;
						}

						next = data['internal-fetch']["success"]

						if (next.includes('page')) {
							data.nextData = this.loadPage(next);
						}
						else {
							data.nextData = this.loadPrompt(next);
						}


					}
				}



				if (data['format-as'] || false) {
					input = transformFormat.formatDataAs(data['format-as'], input);
				}
				//persist the inputted data to redis
				if (data['save-as'] || false) {
					this.user_data['global-request-details'][data['save-as']] = input;
				}
				///*
				/////////////////////////EDITED BY DAN/////////////////////////////////////
				//persist the inputted data to redis
				if (data["save-to-account-details"] || false) {
					normalConsole(`===========SAVE-TO-ACCOUNT-DETAILS========${new Date().toString()}========= ${input} +++++++*****************+++++${new Date().toString()}++++++++++`);
					this.user_data["account-details"][data["save-to-account-details"]] = input;
				}

				if (data["save-without-format"] || false) {
					//input = input.replace(/[.]/g, " ");
					normalConsole(`##################*******************${new Date().toString()}***************`, input);
					this.user_data["global-request-details"][data["save-without-format"]] = input[0].value;
				}
				//*/
				/////////////////////////////////////////////////////////////
				//normalConsole({data})
				//handling in app authentication by reloading data on valid input
				if (data.name === 'inapp-login') {
					//refetch the next step data
					next = this.user_data['inapp-auth-menu'];
					if (next.includes('page')) {
						data.nextData = this.loadPage(next);
					}
					else {
						data.nextData = this.loadPrompt(next);
					}
				}
				if (data.nextData.type === 'select' && data.nextData.options.length === 0) {
					next = nextData['options-error'];
					//load new Data
					if (next.includes('page')) {
						data.nextData = this.loadPage(next);
					}
					else {
						data.nextData = this.loadPrompt(next);
					}
				}
				if (nextData.type === 'select' && typeof (nextData.options) === 'string') {
					let nextOptions = this.user_data['account-details'][nextData.options] || this.user_data['global-constants'][nextData.options] || this.user_data['global-request-details'][nextData.options];
					if (!nextOptions || nextOptions.length === 0) {
						next = nextData['options-error'];
						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
					}
				}
				//handle show if
				if (nextData['show-if'] || false) {
					//normalConsole(`show-if 1707=========>${JSON.stringify(this.user_data)}`);
					//fetch the param
					let dot = require('dot-object')
					let paramValue = dot.pick(nextData['show-if']['param'], this.user_data)
					let validatesTo = nextData['show-if']['validates-to'] || false
					let isNotEqualTo = nextData['show-if']['is-not-equal-to'] || false

					if (validatesTo) {
						let validators = require('./validators');
						let validationRules = validators[nextData['show-if']['validates-to']];
						let validate = validationRules(paramValue, this.user_data);

						if (!validate) {
							next = nextData['show-if']['on-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}

							showIf = true
						}
					}

					if (isNotEqualTo) {

						/**
						 * "show-if"       : {
								"param"          : "fundsTransferCreditAccount",
								"is-not-equal-to": "fundsTransferDebitAccount",
								"on-error"       : "ft-same-account-error"
							},
						 */


						let param1 = dot.pick(nextData['show-if']['param'], this.user_data['global-request-details'] || this.user_data['account-details'])

						let param2 = dot.pick(nextData['show-if']['is-not-equal-to'], this.user_data['account-details']) || this.user_data['global-request-details'][nextData['show-if']['is-not-equal-to']]

						let validate = param1 !== param2
						//normalConsole(`show-if 1749=========>${JSON.stringify(this.user_data)}`);
						if (!validate) {
							next = nextData['show-if']['on-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}

							showIf = true
						}
					}

				}

				await this.fetchCharges(data.nextData)
				str = await this.getString(data.nextData, false, next);
			}
			/**
			 * Show Current Step Prompt on error: input failed validation
			 */
			else {
				//NB: failedValidationIndex is the index of the validation error which maps to the key of the error menu in the json component configuration

				let hasError = data.error || false;
				let hasErrors = data.errors || false;
				let error = false;
				if (hasError) {
					error = data.error;
				}
				if (hasErrors) {
					error = data.errors[failedValidationIndex];
				}
				await this.fetchCharges(data)
				str = await this.getString(data, `${error}`, this.current_step);

				//for an internal fetch, handle it here
				if (internal_fetch_enabled) {
					let error_handler = data['internal-fetch']["error-handler"] || false;


					if (error_handler) {
						let error_function = data['internal-fetch']["error-handler"]['handler'] || false;
						let argument_name = data['internal-fetch']["error-handler"]['argument'] || false;
						let save_result_as = data['internal-fetch']["error-handler"]['save-as'] || false;
						next = data['internal-fetch']["error"]


						if (argument_name) {

							//run the error handler function
							let argument = this.user_data[argument_name];
							//run the function
							let codeString = this.code[error_function];
							//create a new dynamic function
							let f = new Function(codeString);
							let error_function_result = f(argument);



							//persist to redis
							this.user_data[save_result_as] = error_function_result;
							//check if any thresholds have been set
							let threshold = data['internal-fetch']["error-handler"]['threshold'];
							let redirect_on_threshold = data['internal-fetch']["error-handler"]['redirect-on-threshold'] || false;
							let threshold_handler = data['internal-fetch']["error-handler"]['threshold-handler'] || false;
							if (
								error_function_result === threshold &&
								redirect_on_threshold
							) {


								try {
									if (threshold_handler) {

										//formulate our request
										let request_query = [
											{
												name: "walletAccount", value: this.user_data["msisdn"]
											},
											{
												name: "mwallet", value: this.user_data["mwallet"]
											},
											{
												name: "limit", value: this.user_data['global-request-details']["limit"]
											},
											{
												name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
											},
											{
												name: "id", value: this.user_data["account-details"]['identification-id']
											},
											{
												name: "email", value: this.user_data["email"]
											},
											{
												name: "name", value: this.user_data["account-details"]['fullname']
											},
											{
												name: "firstname", value: this.user_data["account-details"]['firstname']
											},
											{
												name: "access_token",
												value: this.user_data["access_token"]
											},
											{
												name: "imsi",
												value: this.imsi
											}
										];
										let accDetails = this.user_data["account-details"];
										let requestDetails = this.user_data['global-request-details'];
										let query_data = { ...accDetails, ...requestDetails }
										let query_data_keys = Object.keys(query_data);
										for (let item of query_data_keys) {
											let obj = {
												name: item,
												value: query_data[item]
											}
											request_query.push(obj);
										}

										//fetch data from the API
										let Api = require('../api/api.js');
										let apiHandler = new Api(
											this.api, //api configuration settings: JSON
											this.code, // custom code: JSON
											this.app_config['api-environment'],
											this.app_config['api-name'],
											this.adapter
										);

										//run the api user profile call
										await apiHandler.run(threshold_handler, request_query);
									}
								}
								catch (e) {

								}
								next = redirect_on_threshold;
							}
						}

						if (next.includes('page')) {
							data = this.loadPage(next);
						}
						else {
							data = this.loadPrompt(next);
						}
						await this.fetchCharges(data)
						str = await this.getString(data, false, next);
					}
				}

				strPrompt = `${error}`;
			}
		}
		return str;
	}
	async select(data, uinput) {
		// let input =0
		// if(uinput > 9){
		// 	input=parseInt(uinput, 10)-1
		// }else {
		// 	input=uinput
		// }

		let input = uinput

		normalConsole(`#########SELECT#########\n DATA=\b${JSON.stringify(data.options, null, 3)} \n Input = \b${input}\n########${new Date().toString()}#########`);

		let transformFormat = new this.FormatItemAs(this.user_data)
		// this.user_data = await this.fetchCache ( this.cache_id )
		let options = data.options || false;
		let saveAs = data['save-as'] || false;
		let str = '';
		let next = this.current_step;
		let selectAction = data.action || false;
		let nextData = '';

		normalConsole(`\n\n ===================INDEX-3546============\n ${input} ===options.length is ${options.length}=======${new Date().toString()}=========\n\n `);
		//input is within range of allowed options
		if (input > 0 && input <= options.length) {

			//handle the selects based on their action
			/**
			 * Types:
			 * key: action
			 * 1. Update-parameters ( e.g charges )
			 * 2. Transact          ( e.g a confirm prompt )
			 * 3. Navigate          ( e.g an transaction status prompt )
			 */
			let option = options[input - 1];
			let nextKey = '';
			let showIf = false;




			/**
			 * -----------------------------
			 *
			 *  SELECT
			 *
			 * Also check if the options for the next data are empty then load invalid menu or something
			 * TODO: do the above for inputs also
			 *
			 * -----------------------------
			 */
			//load next data
			if (data.nextData instanceof Array && data.nextData.length > 0) {

				let optionIndex = input - 1;
				nextData = data.nextData[optionIndex];
				next = nextData.name;

				//normalConsole({nextData})
				//persist the menu chosen incase of the inapp_login_prompt
				if (nextData.name === 'inapp-login') {
					this.user_data['inapp-auth-menu'] = nextData.next;
				}
				if (nextData.type === 'select' && nextData.options && nextData.options.length === 0) {

					next = nextData['options-error'];
					//load new Data
					if (next.includes('page')) {
						nextData = this.loadPage(next);
					}
					else {
						nextData = this.loadPrompt(next);
					}
				}
				if (nextData.type === 'select' && typeof (nextData.options) === 'string') {
					let nextOptions = this.user_data['account-details'][nextData.options] || this.user_data['global-constants'][nextData.options] || this.user_data['global-request-details'][nextData.options];

					if (!nextOptions || nextOptions.length === 0) {
						next = nextData['options-error'];
						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
					}
				}

				//handle show if
				if (nextData['show-if'] || false) {
					//normalConsole(`show-if 1985=========>${JSON.stringify(this.user_data)}`);
					//fetch the param
					let dot = require('dot-object')
					let paramValue = dot.pick(nextData['show-if']['param'], this.user_data)
					let validatesTo = nextData['show-if']['validates-to'] || false
					let isNotEqualTo = nextData['show-if']['is-not-equal-to'] || false

					if (validatesTo) {
						let validators = require('./validators');
						let validationRules = validators[nextData['show-if']['validates-to']];
						let validate = validationRules(paramValue, this.user_data);

						if (!validate) {
							next = nextData['show-if']['on-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}

							showIf = true
						}
					}

					if (isNotEqualTo) {

						/**
						 * "show-if"       : {
								"param"          : "fundsTransferCreditAccount",
								"is-not-equal-to": "fundsTransferDebitAccount",
								"on-error"       : "ft-same-account-error"
							},
						 */


						let param1 = dot.pick(nextData['show-if']['param'], this.user_data['global-request-details'] || this.user_data['account-details'])

						let param2 = dot.pick(nextData['show-if']['is-not-equal-to'], this.user_data['global-request-details']) | this.user_data['global-request-details'][nextData['show-if']['is-not-equal-to']]

						let validate = param1 !== param2
						//normalConsole(`show-if 2027=========>${JSON.stringify(this.user_data)}`);
						if (!validate) {
							next = nextData['show-if']['on-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}

							showIf = true
						}
					}
				}


			}
			else {
				if (selectAction !== 'update-parameters') {
					nextKey = data.next;
					nextData = data.nextData;
					next = nextKey;
					if (nextData.type === 'select' && data.nextData.options.length === 0) {

						next = nextData['options-error'];
						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
					}
					if (nextData.type === 'select' && typeof (nextData.options) === 'string') {
						let nextOptions = this.user_data['account-details'][nextData.options] || this.user_data['global-constants'][nextData.options] || this.user_data['global-request-details'][nextData.options];
						if (!nextOptions || nextOptions.length === 0) {

							next = nextData['options-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}
						}
					}

					//handle show if
					if (nextData['show-if'] || false) {
						//normalConsole(`show-if 2078=========>${JSON.stringify(this.user_data)}`);
						//fetch the param
						let dot = require('dot-object')
						let paramValue = dot.pick(nextData['show-if']['param'], this.user_data)

						let validatesTo = nextData['show-if']['validates-to'] || false
						if (validatesTo) {
							let validators = require('./validators');
							let validationRules = validators[nextData['show-if']['validates-to']];
							let validate = validationRules(paramValue, this.user_data);

							if (!validate) {
								next = nextData['show-if']['on-error'];
								//load new Data
								if (next.includes('page')) {
									nextData = this.loadPage(next);
								}
								else {
									nextData = this.loadPrompt(next);
								}

								showIf = true
							}
						}

						let isNotEqualTo = nextData['show-if']['is-not-equal-to'] || false


						if (isNotEqualTo) {

							/**
							 * "show-if"       : {
									"param"          : "fundsTransferCreditAccount",
									"is-not-equal-to": "fundsTransferDebitAccount",
									"on-error"       : "ft-same-account-error"
								},
							 */


							let param1 = dot.pick(nextData['show-if']['param'], this.user_data['global-request-details'] || this.user_data['account-details'])
							let param2 = option.value

							let validate = param1 !== param2

							//normalConsole(`show-if 2078=========>${JSON.stringify(this.user_data)}`);

							if (!validate) {
								next = nextData['show-if']['on-error'];
								//load new Data
								if (next.includes('page')) {
									nextData = this.loadPage(next);
								}
								else {
									nextData = this.loadPrompt(next);
								}

								showIf = true
							}
						}
					}
				}

			}

			//This section is the part where we can apply transforms to the option			
			//get analytics data

			if (saveAs === false) {
				//means that the select is purely for navigation purposes, we can use this to track user choices
				if (typeof option.name !== 'undefined') {
					if (!option.name.includes('page')) {
					}
					else {
					}
				}
			}

			//get the value that has been entered
			else {

				if (data['format-as'] || false) {
					option.value = transformFormat.formatDataAs(data['format-as'], option.value);
				}

				//persist the inputted data to redis
				this.user_data['global-request-details'][data['save-as']] = option.value;


				//////////////////////////////EDITED BY DAN/////////////////////////////	
				//persist the inputted data to redis
				this.user_data["global-request-details"][data["save-as-label"]] =
					option.label;

				//////////////////////////////EDITED BY DAN/////////////////////////////	
				//persist the inputted data to redis
				this.user_data["account-details"][data["save-value"]] =
					option.value;
				///
				this.user_data["account-details"][data["save-label"]] =
					option.label;

				//play with transforms

				/** 
				 * "option-value-transform": {
					"name"                 : "dateRange",
					"type"                 : "moment"
				},
				*/


				if (option["option-value-transform"] || false) {
					let name = option["option-value-transform"].name
					let format = option["option-value-transform"].format


					let transformed = transformFormat.formatDataAs(name, option.value, format)

					normalConsole(`"""""""\n\n\n\n options=\t${option}\n name=\t${name} \n format ${format}\n transformed ${JSON.stringify(transformed)}\n\n\n\n""""${new Date().toString()}"""`);

					//TODO: save transformed to the global request details for now
					let keys = Object.keys(transformed)

					for (let key of keys) {
						this.user_data['global-request-details'][key] = transformed[key];
					}
				}
				//----------- HANDLE META SAVING -----------
				// {
				// 	"label": "GBP~0021002001078",
				// 	"value": "GBP~0021002001078",
				// 	"meta": [
				// 		{
				// 			"save-as": "working-currency",
				// 			"value": "GBP~0021002001078",
				// 			"cache-path": "global-request-details",
				// 			"format-as": "currency-code"
				// 		}
				// 	]

				// }
				let ignoreMeta = data["ignore-meta"] || false

				let meta = option['meta'] || false
				if (meta && meta instanceof Array) {
					for (let item of meta) {
						let value = item.value
						let formatAs = item['format-as']
						let saveAs = item['save-as']
						let cachePath = item['cache-path']

						//format
						if (formatAs) {
							value = transformFormat.formatDataAs(formatAs, value)
						}

						//save
						if (ignoreMeta && !ignoreMeta.includes(saveAs)) {
							this.user_data[cachePath][saveAs] = value
						}

						if (!ignoreMeta) {
							this.user_data[cachePath][saveAs] = value
						}

						if (ignoreMeta && ignoreMeta.includes(saveAs)) {
							//do nothing..do not update the meta data as it has been flagged to be ignored
						}


					}
				}

			}


			//load other menu if jump-to-menu is enabled
			let jumpToMenu = option["jump-to"] || false;
			if (jumpToMenu) {
				next = jumpToMenu;
				//load new Data
				if (next.includes('page')) {
					nextData = this.loadPage(next);
				}
				else {
					nextData = this.loadPrompt(next);
				}

				if (nextData.type === 'select' && nextData.options.length === 0) {
					next = nextData['options-error'];
					//load new Data
					if (next.includes('page')) {
						nextData = this.loadPage(next);
					}
					else {
						nextData = this.loadPrompt(next);
					}
				}
				if (nextData.type === 'select' && typeof (nextData.options) === 'string') {
					let nextOptions = this.user_data['account-details'][nextData.options] || this.user_data['global-constants'][nextData.options] || this.user_data['global-request-details'][nextData.options];
					if (!nextOptions || nextOptions.length === 0) {
						next = nextData['options-error'];
						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
					}
				}


				//handle show if
				if (nextData['show-if'] || false) {
					//normalConsole(`show-if 2288 =========>${JSON.stringify(this.user_data)}`);
					//fetch the param
					let dot = require('dot-object')
					let paramValue = dot.pick(nextData['show-if']['param'], this.user_data)

					let validators = require('./validators');
					let validationRules = validators[nextData['show-if']['validates-to']];
					let validate = validationRules(paramValue, this.user_data);

					if (!validate) {
						next = nextData['show-if']['on-error'];
						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}

						showIf = true
					}
				}
			}


			//if cache-local is set to true, cache selection data
			//handle special select actions
			switch (selectAction) {
				case 'update-parameters':
					//get analytics data
					let route = data['external-fetch'].route || false;
					let format = data['external-fetch']['format-as'] || false;
					let api = data['external-fetch'].api || false;
					let cache = data['external-fetch'].cache || false;
					let cache_path = data['external-fetch']['cache-path'] || false;
					let cache_params = data['external-fetch']["cache-parameters"] || false;
					let params_check = data['external-fetch']["parameter-checks"] || false;
					let prompts = [
						data['external-fetch'].success,
						data['external-fetch'].error,
					]

					/**
					 * -------------------
					 *
					 * Formulate Request
					 *
					 * -------------------
					 */
					//format the input
					if (data['format-as'] || false) {
						input = transformFormat.formatDataAs(data['format-as'], input);
					}

					//persist the inputted data to redis
					if (data['save-as'] || false) {
						this.user_data['global-request-details'][data['save-as']] = option.value;
					}

					//formulate our request
					let request_query = [
						{
							name: "walletAccount", value: this.user_data["msisdn"]
						},
						{
							name: "mwallet", value: this.user_data["mwallet"]
						},
						{
							name: "limit", value: this.user_data['global-request-details']["limit"]
						},
						{
							name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
						},
						{
							name: "id", value: this.user_data["account-details"]['identification-id']
						},
						{
							name: "email", value: this.user_data["email"]
						},
						{
							name: "name", value: this.user_data["account-details"]['fullname']
						},
						{
							name: "access_token",
							value: this.user_data["access_token"]
						},
						{
							name: "imsi",
							value: this.imsi
						}
					];
					let accDetails = this.user_data["account-details"];
					let requestDetails = this.user_data['global-request-details'];
					let query_data = { ...accDetails, ...requestDetails };

					let query_data_keys = Object.keys(query_data);
					for (let item of query_data_keys) {
						let obj = {
							name: item,
							value: query_data[item]
						}
						request_query.push(obj);
					}

					/**
					 * -------------------
					 *
					 * Call the API
					 *
					 * -------------------
					 */
					//fetch data from the API
					let Api = require('../api/api.js');
					let apiHandler = new Api(
						this.api, //api configuration settings: JSON
						this.code, // custom code: JSON
						this.app_config['api-environment'],
						this.app_config['api-name'],
						this.adapter
					);

					//run the api user profile call
					let apiResult = await apiHandler.run(route, request_query);

					/**
					 * ------------------------
					 *
					 * Update local parameters
					 *
					 * ------------------------
					 */
					//if responses are required, then we can redirect to another menu on error
					//examples: presentments for fetching bill amounts
					let api_response = 'success';
					//handle the api response (  it is assumed that it always returns a success or error as the status )
					let response_map = {
						'success': 0,
						"failed": 1
					};

					//load the next menu data to use to create a menu response string
					if (!jumpToMenu) {
						next = prompts[response_map[api_response]];
					}



					//on-success: perform success handling if allowed

					if (apiResult.status === 'success' && cache) {
						let valuesObject = apiResult.message;
						let valueKeys = Object.keys(apiResult.message);
						for (let key of valueKeys) {
							let value = valuesObject[key];
							if (format !== 'undefined') {
								value = transformFormat.formatDataAs(format, value);
							}
							if (cache_path) {
								this.user_data[cache_path][key] = value;
							}
							else {
								this.user_data[key] = value;
							}
						}
						let success_handler = data['external-fetch']["error-handler"] || false;
						if (success_handler) {
							let success_function = data['external-fetch']["success-handler"]['handler'] || false;
							let argument_name = data['external-fetch']["success-handler"]['argument'] || false;
							let save_result_as = data['external-fetch']["success-handler"]['save-as'] || false;
							if (argument_name) {
								let argument = this.user_data[argument_name];
								//run the function
								let codeString = this.code[success_function];
								//create a new dynamic function
								let f = new Function(codeString);
								let success_function_result = f(argument);
								//persist to redis
								this.user_data[save_result_as] = success_function_result;
							}
						}

						//handle cache parameters
						if (apiResult.data && cache_params) {
							let obj = {
							}

							for (let param of cache_params) {

								let dot = require('dot-object')

								let name = param["save-as"]
								let formatAs = param["format-as"] || false
								let data = dot.pick(param["path"], apiResult.data)

								if (formatAs) {
									data = transformFormat.formatDataAs(formatAs, data)
								}

								obj[name] = data



								if (params_check && typeof (params_check) === 'object' && Object.keys(params_check).includes(name)) {
									let check_object = params_check[name]
									let minimum = parseFloat(check_object["is-less-than"]).toFixed(2)
									let parsedValue = parseFloat(data).toFixed(2)

									if (Number(parsedValue) < Number(minimum)) {
										next = check_object['redirect-to'];
									}

								}


							}
							//{ obj: { charge: 0, excise_duty: 0, esb_ref: 2447 } }

							if (cache_path) {

								// if ( Object.keys(obj).length === 1 && Object.keys(obj)[0]==='ROOT'){
								// 	let newObj = obj [ 'ROOT' ]

								// 	for ( let key of Object.keys ( newObj ) ) {
								// 		this.user_data[cache_path][key] = newObj [ key ];
								// 	}
								// }
								// else{

								// }

								for (let key of Object.keys(obj)) {
									this.user_data[cache_path][key] = obj[key];
								}
							}
						}
					}


					//on-error: perform error handling if enabled
					else if (apiResult.status !== 'success') {
						api_response = 'failed';
						this.user_data['global-request-details']['errMessage'] = apiResult.message;
						next = prompts[response_map[api_response]];
						let error_handler = data['external-fetch']["error-handler"] || false;
						if (error_handler) {
							let error_function = data['external-fetch']["error-handler"]['handler'] || false;
							let argument_name = data['external-fetch']["error-handler"]['argument'] || false;
							let save_result_as = data['external-fetch']["error-handler"]['save-as'] || false;
							if (argument_name) {
								//run the error handler function
								let argument = this.user_data[argument_name];
								//run the function
								let codeString = this.code[error_function];
								//create a new dynamic function
								let f = new Function(codeString);
								let error_function_result = f(argument);
								//persist to redis
								this.user_data[save_result_as] = error_function_result;
								//check if any thresholds have been set
								let threshold = data['external-fetch']["error-handler"]['threshold'] || false;
								let redirect_on_threshold = data['external-fetch']["error-handler"]['redirect-on-threshold'] || false;
								//let threshold_handler = data['external-fetch']["error-handler"]['threshold-handler'] || false;
								if (threshold && error_function_result.toString() === threshold && redirect_on_threshold) {
									next = redirect_on_threshold;
									//run the threshold function
								}
							}
						}
					}

					/**
					 * ------------------------
					 *
					 * Load next menu
					 *
					 * ------------------------
					 *  { data:
							{ type: 'select',
							name: 'pesalink-to-phone-lookup-banks',
							'save-as': 'pesalinkToPhoneSortCode',
							options: [],
							'options-error': 'pesalink-to-phone-lookup-banks-options-error',
							error: 'pesalink-to-phone-lookup-banks-error',
							previous: 'pesalink-to-phone-credit-account',
							next: 'pesalink-to-phone-amount' } }
					 */


					if (data.nextData.type === 'select' && data.nextData.options.length === 0) {
						next = nextData['options-error'];

						//load new Data
						if (next.includes('page')) {
							nextData = this.loadPage(next);
						}
						else {
							nextData = this.loadPrompt(next);
						}
					}
					if (nextData.type === 'select' && typeof (nextData.options) === 'string') {
						let nextOptions = this.user_data['account-details'][nextData.options] || this.user_data['global-constants'][nextData.options] || this.user_data['global-request-details'][nextData.options];

						if (!nextOptions || nextOptions.length === 0) {
							next = nextData['options-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}
						}
					}

					// if (data.nextData.type === 'select' && typeof ( data.nextData.options) ==='string' 
					//     // normalConsole("next data is a select and is missing its options");

					// }
					//handle show if
					if (nextData['show-if'] || false) {
						//normalConsole(`show-if 2605=========>${JSON.stringify(this.user_data)}`);
						//fetch the param
						let dot = require('dot-object')
						let paramValue = dot.pick(nextData['show-if']['param'], this.user_data)

						let validators = require('./validators');
						let validationRules = validators[nextData['show-if']['validates-to']];
						let validate = validationRules(paramValue, this.user_data);

						if (!validate) {
							next = nextData['show-if']['on-error'];
							//load new Data
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}

							showIf = true
						}
					}
					if (next.includes('page')) {
						nextData = this.loadPage(next);
					}
					else {
						nextData = this.loadPrompt(next, this.user_data);
					}

					str = await this.getString(nextData, false, next);
					/**
					 * ------------------------
					 *
					 * Perform Analytics
					 *
					 * ------------------------
					 */
					// let moment = require('moment');
					// const shortid = require('shortid');
					// let ac = new this.analytics();
					// let analyticsTransaction = {
					//     timestamp: `${moment().unix()}`,
					//     type: 'transaction',
					//     name: route,
					//     charge: '',
					//     amount: '',
					//     txid: shortid.generate().replace(/[^a-zA-Z0-9]/g, '80X').toUpperCase(),
					//     userid: this.user_data.msisdn,
					//     ussdservice: this.app_name
					// };
					// ac.enQueue(analyticsTransaction);
					break;
				case 'transact':
					switch (input) {
						case '1':


							//check for inapp authentication
							let authenticate_transactions = this.app_config["authenticate-transactions"] || false
							let authenticate_menu = data["authenticate"] || false

							//console.log ( { authenticate_menu } )
							if (authenticate_transactions || authenticate_menu) {

								this.user_data["transaction-authenticate-next"] = data.name
								this.user_data["transaction-authenticate-fetch"] = data['external-fetch']
								this.user_data["transaction-authenticate-previous"] = data.previous

								//load the transaction login prompt
								next = "transaction-login"

								if (next.includes('page')) {
									nextData = this.loadPage(next);
								}
								else {
									nextData = this.loadPrompt(next);
								}
							}
							else {
								//get analytics data
								let route = data['external-fetch'].route;
								//let api_name = data['external-fetch'].api;


								//let cache = data['external-fetch'].cache || false;
								let cache_path = data['external-fetch']['cache-path'] || false;
								let cache_params = data['external-fetch']["cache-parameters"] || false;


								let prompts = [
									data['external-fetch'].success,
									data['external-fetch'].error,
								];


								//formulate our request
								let request_query = [
									{
										name: "walletAccount",
										value: this.user_data["msisdn"]
									},
									{
										name: "mwallet", value: this.user_data["mwallet"]
									},
									{
										name: "limit", value: this.user_data['global-request-details']["limit"]
									},
									{
										name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
									},
									{
										name: "id", value: this.user_data["account-details"]['identification-id']
									},
									{
										name: "email", value: this.user_data["email"]
									},
									{
										name: "name", value: this.user_data["account-details"]['fullname']
									},
									{
										name: "access_token",
										value: this.user_data["access_token"]
									},
									{
										name: "imsi",
										value: this.imsi
									},
									{
										name: "regImsi",
										value: this.imsi
									}
								];

								let accDetails = this.user_data["account-details"];
								let requestDetails = this.user_data['global-request-details'];
								let query_data = { ...accDetails, ...requestDetails };
								let query_data_keys = Object.keys(query_data);
								for (let item of query_data_keys) {
									let obj = {
										name: item,
										value: query_data[item]
									};
									request_query.push(obj);
								}


								//fetch data from the API
								let Api = require('../api/api.js');
								let apiHandler = new Api(this.api, //api configuration settings : JSON
									this.code, // custom code : JSON
									this.app_config['api-environment'], this.app_config['api-name'],
									this.adapter);


								//run the api user profile call
								let apiResult = await apiHandler.run(route, request_query);
								let api_response = 'success';

								//this.user_data['global-request-details'] = {}//reset the global request details



								//on-success, persist user data
								if (apiResult.status === 'success') {
									api_response = 'success';
									//handle cache parameters
									if (apiResult.data && cache_params) {

										let obj = {
										}

										for (let param of cache_params) {

											let dot = require('dot-object')
											let data = dot.pick(param["path"], apiResult.data)

											let saveAs = param["save-as"] || false
											let formatAs = param["format-as"] || false
											if (saveAs) {

												if (saveAs instanceof Array) {
													let splitBy = param['item-delimiter']
													let values = data.split(splitBy)

													for (let index in values) {
														if (formatAs) {
															obj[saveAs[index]] = transformFormat.formatDataAs(formatAs[index], values[index])
														}
														else {
															obj[saveAs[index]] = values[index]
														}
													}
												}
												else {

													if (formatAs) {
														data = transformFormat.formatDataAs(formatAs, data)
													}
													obj[saveAs] = data
												}

											}



											// "path"          : "field54",
											// "item-delimiter": "|",
											// "save-as"       : ["actual-balance", "available-balance" ]
										}

										if (cache_path) {

											for (let key of Object.keys(obj)) {
												this.user_data[cache_path][key] = obj[key];
											}
										}
									}
								}
								else {
									api_response = 'failed';


									if (apiResult.message) {


										this.user_data['global-request-details']['errMessage'] = apiResult.message;
									}
									else {
										//persist to redis
										let formatApiRoute = route
											.replace(/[^a-zA-Z_-]/g, '')
											.replace(/[_-]/g, ' ')
											.toLowerCase();
										this.user_data['global-request-details']['errMessage'] = `the ${formatApiRoute} request was not successful`;
									}
								}
								//handle the api response (  it is assumed that it always returns a success or error as the status )
								let response_map = {
									'success': 0,
									"failed": 1
								};
								//load the next menu data to use to create a menu response string
								next = prompts[response_map[api_response]];
								let d = this.loadPrompt(next);
								nextData = d;


								//check for cache data
								/**
									 *                     "actual_balance": 380770.35,
									"available_balance": 379770.35
								*/





								//persist to redis
								let formatApiRoute = route
									.replace(/[^a-zA-Z_-]/g, '')
									.replace(/[_-]/g, ' ')
									.toLowerCase();
								this.user_data['global-request-details']['requestName'] = formatApiRoute;
								// let moment = require('moment');
								// const shortid = require('shortid');
								// let ac = new this.analytics();
								// let analyticsTransaction = {
								// 	timestamp: `${moment().unix()}`,
								// 	type: 'transaction',
								// 	name: route,
								// 	charge: '',
								// 	amount: '',
								// 	txid: shortid.generate().replace(/[^a-zA-Z0-9]/g, '80X').toUpperCase(),
								// 	userid: this.user_data.msisdn,
								// 	ussdservice: this.app_name
								// };
								// ac.enQueue(analyticsTransaction);
							}

							break;
						//load the next step which should be the client module
						case '2':
							next = data['on-cancel'] || false;
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}
							break;
					}
					break;
				case 'navigate':
					switch (input) {
						//Next step data is already loaded for a basic switch
						case '1':
							next = data['on-accept'];
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}
							break;
						//load the next step which should be the client module
						case '2':
							next = data['on-cancel'];
							if (next.includes('page')) {
								nextData = this.loadPage(next);
							}
							else {
								nextData = this.loadPrompt(next);
							}
							if (next.includes('logout')) {
							}
							break;
					}
					break;
				case "update-local":
					if (input !== '2') {
						let dot = require('dot-object');
						let localPath = data['local-path'].replace(/\s/g, '') || false;
						/**
						 * IMPORTANT! local path has been set to only be two levels deep at maximum
						 * hence data to be set should either be at the root level or on the first
						 * nested level
						 * e.g
						 * LEVEL 1: language=value OR
						 * LEVEL 2: account-details>language=value
						 */
						if (localPath) {
							let localPathArray = localPath.split('=');
							let path = localPathArray[0];
							let valueKey = localPathArray[1];
							let pathParts = [];
							let value = this.user_data['global-request-details'][valueKey];
							if (path.includes('>')) {
								pathParts = path.split('>');
								pathParts = pathParts.filter((p) => {
									return p !== '';
								});
								//update the path with the new value
								dot.str(pathParts.join('.'), value, this.user_data);
							}
							else {
								this.user_data[path] = value;
							}
							this.user_data = await this.refresh(this.cache_id, this.user_data);
						}
						else {
						}
					}
					break;
			}

			//skip

			//normalConsole({nextData, data, input}) 
			if (nextData.type === 'skip') {
				this.inputIsValid = true;
				//console.log ( `<<<<< SKIP MENU >>>>>`)
				str = await this.skip(nextData)
				//console.log ( `<<<<< SELECT SKIP MENU END ${str}>>>>>`)
			} else {

				await this.fetchCharges(data.nextData)
				str = await this.getString(nextData, false, next);
			}


		}

		//Show Current Step Prompt on error: input not within the range of allowed options  
		else {
			await this.fetchCharges(data)
			str = await this.getString(data, data.error);
			normalConsole(`INVAILD INPUT`);
		}



		return str;
	}
	async fetchCharges(nextMenuData) {
		//check if the fetch charges flag is enabled
		let fetchCharges = nextMenuData.charges || false
		let confirmExists = nextMenuData.name || false
		let nextIsConfirm = false
		if (confirmExists && nextMenuData.name.includes('confirm')) {
			nextIsConfirm = true
		}

		//check if the next menu contains the word confirm
		if (fetchCharges && nextIsConfirm) {



			//route
			let route = `${nextMenuData["external-fetch"].route}-charges`

			//formulate our request
			let request_query = [
				{
					name: "walletAccount",
					value: this.user_data["msisdn"]
				},
				{
					name: "mwallet", value: this.user_data["mwallet"]
				},
				{
					name: "limit", value: this.user_data['global-request-details']["limit"]
				},
				{
					name: "lockSavingsAccount", value: this.user_data["lockSavingsAccount"]
				},
				{
					name: "id", value: this.user_data["account-details"]['identification-id']
				},
				{
					name: "email", value: this.user_data["email"]
				},
				{
					name: "name", value: this.user_data["account-details"]['fullname']
				},
				{
					name: "firstname", value: this.user_data["account-details"]['firstname']
				},
				{
					name: "access_token",
					value: this.user_data["access_token"]
				},
				{
					name: "imsi",
					value: this.imsi
				}
			]
			//let description = route.replace(/-/g, ' ').replace(/charges/g, '')


			let accDetails = this.user_data["account-details"];
			let requestDetails = this.user_data['global-request-details'];
			let query_data = { ...accDetails, ...requestDetails }
			let query_data_keys = Object.keys(query_data);


			for (let item of query_data_keys) {
				let obj = {
					name: item,
					value: query_data[item]
				};
				request_query.push(obj);
			}

			//fetch data from the API
			let Api = require('../api/api.js');
			let apiHandler = new Api(
				this.api, //api configuration settings : JSON
				this.code, // custom code : JSON
				this.app_config['api-environment'],
				this.app_config['api-name'],
				this.adapter
			)

			//run the api user profile call
			let apiResult = await apiHandler.run(route, request_query);
			//let api_response = 'success';

			normalConsole(`3072\n ${JSON.stringify(apiResult)}  ==========${new Date().toString()}`)

			//on-success, persist charges data
			/*

			*/
			if (apiResult.status === 'success' && apiResult.data.data && apiResult.data.data[0]) {
				let charges = apiResult.data[0] || {}
				this.user_data['global-request-details']['txcharge'] = charges.txcharge || "0"
				this.user_data['global-request-details']['txduty'] = charges.txduty || "0"

				normalConsole(`3091\n ${JSON.stringify(apiResult)} ========${new Date().toString()}`);

			} else if (apiResult.status === 'success' && apiResult.data.data.txcharge) {
				this.user_data['global-request-details']['txcharge'] = apiResult.data.data.txcharge || "0"
				this.user_data['global-request-details']['txduty'] = apiResult.data.data.txduty || "0"

				normalConsole(`3097\n ${JSON.stringify(apiResult)}  ===========${new Date().toString()}`);
			}
			//on fail - set charges to 0
			else {
				this.user_data['global-request-details']['txcharge'] = 0
				this.user_data['global-request-details']['txduty'] = 0

				normalConsole(`3104\n ${JSON.stringify(apiResult)} =============${new Date().toString()}`);
			}

		}
	}
	async previous(data) {
		let newData = await this.fetchCache(this.cache_id)
		this.user_data['global-constants'] = newData['global-constants']
		let previousData = data.previousData || data
		await this.fetchCharges(previousData)
		let str = await this.getString(previousData, false, previousData.name || data.name);
		return str;
	}
	async getString(data, promptOverride = false, nextStep = '') {
		nextStep = nextStep.trim() === '' ? this.current_step : nextStep;
		//get the prompt
		let menuPrompt = `${data.name}`;
		normalConsole(`GETSTRING =====menuPrompt======\n${menuPrompt}\n`);
		//overriding a prompt
		if (promptOverride) {
			menuPrompt = promptOverride;
		}
		let current_language = this.user_data["language"];
		//let current_language = this.user_data["account-details"]["language"];
		normalConsole(`current_language 3166 ${current_language}\n user_data =>\n${this.user_data["language"]}`)
		let menuString = this.language[current_language][menuPrompt];

		//if it includes fetching charges
		if (data.charges) {
			menuString += this.language[current_language]['tx-charge-narration']
		}

		menuString += "\n";

		//replace handlePlaceholders
		menuString = this.replace(menuString);

		if (menuString.includes('@')) {

			menuString = this.replace(menuString);
		} else {

		}

		//if its a select menu, add the options
		if (data.type === 'select') {
			//get the select prompt options
			let options = data.options;
			for (let index in options) {

				if (!isNaN(index)) {
					//the options will now be keys defined in the language file
					let optionPrompt = `${options[index].label}`;
					let optionString = this.language[current_language][optionPrompt];
					//check if it has an options template for dynamic options
					// normalConsole(`3198 ==========>  LABEL IS ${optionPrompt}\n STRING IS ${optionString}`);
					// if (optionString.includes('@')) {
					// 	optionString = optionTemplateString.replace(/@number-of-invites/g, optionPrompt);
					// }
					if (data['options-template']) {
						let optionsTemplate = data['options-template'];
						let optionTemplateString = this.language[current_language][optionsTemplate];
						optionString = optionTemplateString.replace(/@option/g, optionPrompt);
					}
					if (typeof (optionString) === 'undefined') {
						optionString = optionPrompt;
					}

					if (typeof (optionPrompt) === 'undefined') {
						optionString = "";
					}
					let optionNumber = parseInt(index) + 1;
					// if (optionNumber === 9) {
					// 	menuString += `${optionNumber+1}:${optionString}\n`;
					// }
					//else{
					menuString += `${optionNumber}:${optionString}\n`;
					//}
					// normalConsole(`menuString is \n\n ${menuString}\n`);``
				}
				else {
					//console.log (  { options } )
				}

			}

		}
		//add previous option on string if canGoBack is enabled                        
		let canGoBack = data.previous || false;
		if (canGoBack) {
			let previous_prompt = this.language[current_language]["previous"];
			menuString += `${this.PREVIOUS_CHARACTER}:${previous_prompt}\n`;
		}
		//if its an alert menu, ensure to tell the session to end
		if (data.type === 'alert') {
			menuString = `${menuString}`;
		}


		this.user_data['current_step'] = nextStep;
		//let response = await this.save(this.cache_id, this.user_data);
		await this.save(this.cache_id, this.user_data);

		//this fix is to remove the undefined menu bug from the output
		let parts = menuString.split("\n");


		//filter the undefined items
		parts = parts.filter((item) => {
			if (!item.toLowerCase().includes('undefined')) {
				return item
			}
		})

		menuString = parts.join("\n")

		//format the accounts properly
		menuString = menuString.replace(/~I/g, '').replace(/~J/g, '').replace(/~/g, ' ').trim()


		let charCount = menuString.length;
		if (charCount > 182) {

		}



		//Analytics goes here


		//return the menu string
		return menuString;
	}
	replace(menuString) {
		let str = menuString.split(' ')
		for (let word of str) {
			//handle with @ characters
			let replacementsCount = 0
			try {
				//get the number of @ characterss in the string
				replacementsCount = word.match(/@/g).length
			}
			catch (e) {

			}
			try {
				if (replacementsCount === 2) {

					let replacements =
						word
							.split('@')
							.filter((item) => {
								return item && item.trim() !== ''
							}).map((item) => {
								let lastChar = item[item.length - 1]

								if (lastChar === '-') {
									return item.slice(0, item.length - 1)
								}
								else {
									return item
								}
							})




					let lastReplacement = replacements[1]
					let firstReplacement = replacements[0]
					let lastValue = this.searchData(lastReplacement).trim()
					firstReplacement = firstReplacement + '-' + lastValue
					let fullValue = this.searchData(firstReplacement)
					if (lastValue && fullValue) {
						menuString = menuString.replace(word, fullValue)
					}

				}
				if (replacementsCount === 1) {


					let formatted = word.replace(/[^-a-zA-Z]/g, '')

					let value = this.searchData(formatted)

					if (value || value === 0 || value === '0') {
						menuString = menuString.replace(word, value.toString())
					}

				}
			}
			catch (e) {
				normalConsole(e)
			}

		}
		menuString = menuString.replace(/__walletAccount/g, this.user_data.msisdn)

		return menuString + '\n';
	}
	setStartMenu() {
		/**
		 * -----------------------------------------------------------------------
		 *  GETTING THE MODULE TO PARSE ON INITIAL ACCESS
		 *
		 *  Once the conditional logic is complete, it sets `this.current_menu`
		 *  to the appropriate menu globally
		 *
		 *  App config file has to be loaded
		 *
		 * -----------------------------------------------------------------------
		 */
		try {
			let initialStep = '';
			let page_switch_config = this.app_config["page-switch-check"];
			let switchParam = this.app_config["page-switch-check"].name;
			let initital_page_type = this.user_data["account-details"][switchParam];
			let initial_page = page_switch_config.options[initital_page_type].page;
			// let module_is_enabled  = page_switch_config.options[initital_page_type].enabled;//deprecated


			//let deviceChanged = this.user_data["deviceChanged"]//deprecated
			let otpExpired = this.user_data["otpExpired"]
			normalConsole(otpExpired);
			let isIMSI = this.user_data["is-imsi"]
			normalConsole(isIMSI);
			//DEVICE CHANGED CHECK

			//OTP EXPIRED CHECK


			//let initial step to load is the enabled module based on the users type from the user data
			initialStep = `${initial_page}`.replace(/_/g, '-');

			/**
			 * Hence The Logic is :
			 *
			 *  Registration enabled :
			 *       - If the user is registered:
			 *          If Authentication is enabled :
			 *          - check if the account is blocked: If blocked, show the account blocked prompt.
			 *          - check the number of pin trials ( if account is not blocked and pin trials is zero, reset the pin trials and show the
			 *            authentication prompt ) else show the authentication prompt with the number of pin trials remaining
			 *          If Authentication is disabled :
			 *          - load the initial module prompt
			 *      - If the user is not registered:
			 *          - Show the registration module prompt
			 *  Registration disabled :
			 *      - load the initial module prompt
			 */
			let registrationEnabled = this.app_config["register"];
			let registerParam = this.app_config["registration-check"];
			let isRegistered = this.user_data["account-details"][registerParam];
			let initialLoginCheck = this.app_config["first-login-check"];
			let isFirstLogin = this.user_data["account-details"][initialLoginCheck];
			let blockedAccessParam = this.app_config["blocked-account-check"];
			let dormantAccessParam = this.app_config["dormant-account-check"];
			let isBlocked = this.user_data["account-details"][blockedAccessParam];
			let isDormant = this.user_data["account-details"][dormantAccessParam];
			let maxPinTrials = this.app_config["pin-trials-max"];
			let pinTrialsRemaining = parseInt(this.user_data["pin-trials-remaining"], 10);
			let authenticationEnabled = this.app_config["authenticate"];

			normalConsole(`PINTRIALSREMAINING == ${pinTrialsRemaining} DATE == ${new Date().toString()}`);

			//registered account with authentication enabled
			if (registrationEnabled && isRegistered && authenticationEnabled || !registrationEnabled && isRegistered && authenticationEnabled) {
				//user is accessing the app for the first time
				if (isFirstLogin) {
					initialStep = `first-login-system`;
				}
				else {
					//user account is active

					if (pinTrialsRemaining <= 0) {
						this.user_data["pin-trials-remaining"] = maxPinTrials;
						initialStep = `account-blocked`;
					}
					//TODO: reset the pin trials to max if the user provides the correct password before using up all available pin trial attempts
					else if (pinTrialsRemaining > 0 && pinTrialsRemaining < maxPinTrials) {

						initialStep = `wrong-login`;
					}
					else if (pinTrialsRemaining === maxPinTrials) {
						initialStep = `login`;
					}
					else if (pinTrialsRemaining == 0 || pinTrialsRemaining === 0) {
						this.user_data["pin-trials-remaining"] = maxPinTrials;
						initialStep = `account-blocked`;
					}
				}
			}
			//registered account with authentication disabled
			if (registrationEnabled && isRegistered && !authenticationEnabled) {
				initialStep = initial_page;
			}
			//unregistered account
			if (registrationEnabled && !isRegistered) {
				initialStep = `registration-alert`;
			}
			//registratin disabled
			if (!registrationEnabled && !isRegistered) {

				initialStep = `registration-alert`;
			}
			//blocked accounts
			if (isBlocked && authenticationEnabled) {
				initialStep = `account-blocked`;
			}
			if (pinTrialsRemaining == 0 || pinTrialsRemaining === 0 || pinTrialsRemaining <= 0) {
				initialStep = `account-blocked`;
			}
			//dormant accounts
			if (isDormant && authenticationEnabled) {
				initialStep = `account-dormant`;
			}
			//set the current step
			this.current_step = initialStep;


		}
		catch (e) {
			//initial module could not be loaded
			normalConsole(`initial module could not be loaded ${new Date().toString()}`);
			this.current_step = `error`;
		}
	}
	loadData() {
		let data = {};
		if (this.current_step.includes('page')) {
			data = this.loadCurrentData(this.current_step, 'page');
			data['previousData'] = this.loadPreviousData(this.current_step, 'page');
			data['nextData'] = this.loadNextData(this.current_step, 'page');
		}
		else {
			data = this.loadCurrentData(this.current_step);
			data['previousData'] = this.loadPreviousData(this.current_step);
			data['nextData'] = this.loadNextData(this.current_step);

		}

		return data;
	}
	loadPage(page_name) {
		let data = false;
		try {
			//load the page data
			let page_data = this.pages[page_name] || false;
			if (page_data) {
				//add only the children that are enabled                
				let options = page_data.options; //TODO: add a check here for empty or malformed page options
				options = options.filter((option) => {
					return option.enabled !== false;
				});
				page_data.options = options;
				data = page_data;
			}
		}
		catch (e) {
			normalConsole(`failed to load page ${new Date().toString()}`);
		}
		return data;
	}
	loadPrompt(prompt_name) {
		let data = false;
		try {
			//get cache file and prompt key
			let prompts_lookup = this.prompts_cache;
			let prompt_groups = Object.keys(prompts_lookup);
			let prompt_group_name = '';

			//loop through the cache items
			for (let key of prompt_groups) {
				let prompts = prompts_lookup[key];
				for (let prompt of prompts) {
					if (prompt === prompt_name) {
						prompt_group_name = key;
						break;
					}
				}
			}
			//load the prompt data           
			let prompt_data = this.prompts[prompt_group_name];

			if (prompt_data instanceof Array) {
				for (let index in prompt_data) {
					if (prompt_data[index].name === prompt_name) {
						data = prompt_data[index];
					}
				}
			}
			else {
				data = prompt_data;
			}
			//replace with the actual child objects in case the options variable is a string reference
			let hasOptions = data.options || false;

			if (hasOptions && typeof hasOptions === 'string') {
				//account for combined options

				if (data.options.includes('+')) {
					let eachVal = data.options.split('+')
					let combinedOptions = []

					for (let val of eachVal) {
						let dataOpts = this.user_data['account-details'][val] || this.user_data['global-constants'][val] || false;
						if (dataOpts) {
							combinedOptions = [...combinedOptions, ...dataOpts]
						}

					}

					data.options = combinedOptions
				}
				else {
					//load data using a promise ( Got a bug where the name was being replaced with undefined if the data was not obtained on time )
					data.options =
						this.user_data['account-details'][data.options] ||
						this.user_data['global-constants'][data.options] ||
						this.user_data['global-request-details'][data.options] ||
						data.options;
				}

			}
		}
		catch (e) {
			normalConsole(` [ Error ] unable to load the prompt data for \`${prompt_name} - msg: ${e.message} time: ${new Date().toString()}`);
		}


		return data;
	}
	loadRootPrompt(prompt_group_name) {
		//get the components Data:
		let prompt_data = this.prompts[prompt_group_name];
		let data = [];
		if (prompt_data instanceof Array) {
			data = prompt_data[0];
		}
		else {
			data = prompt_data;
		}

		//replace with the actual child objects in case the options variable is a string reference
		if (typeof (data.options) === 'string' && data.type === 'select') {
			let children = this.user_data['account-details'][data.options] || this.user_data['global-constants'][data.options];

			if (data.options.includes('+')) {
				let eachVal = data.options.split('+')

				let combinedOptions = []

				for (let val of eachVal) {
					let dataOpts = this.user_data['account-details'][val] || this.user_data['global-constants'][val] || false;

					if (dataOpts) {
						// console.log ( { val, dataOpts } )
						for (let opt of dataOpts) {
							combinedOptions.push(opt)
						}
					}

				}

				data.options = combinedOptions
			}
			else {
				data.options = children
			}
		}
		return data;
	}
	loadCurrentData(current_step_name, currentType = '') {
		let data = false; //is either an object or false

		switch (currentType) {
			//The previous step of a module is either another module or disabled
			case 'page':
				try {
					data = this.loadPage(current_step_name);
				}
				catch (e) {
					normalConsole(`failed to load the page ${new Date().toString()}`);
				}
				break;
			//The previous step of a component may either be another component or a module or disabled
			default:
				try {
					data = this.loadPrompt(current_step_name);
				}
				catch (e) {
					normalConsole(`failed to load the prompt ( s ) ${new Date().toString()}`);
				}
				break;
		}
		return data;
	}
	loadPreviousData(current_step_name, currentType = '') {
		let data = false; //is either an object or false
		switch (currentType) {
			//The previous step of a page is either another page or disabled
			case 'page':
				try {
					//hence get current Module data and use it to determine the previous module data, then load that as the final data                  
					let currentData = this.loadPage(current_step_name);
					let canGoBack = currentData.previous || false;
					if (canGoBack) {
						let previous = currentData.previous;
						data = this.loadPage(previous);
					}
				}
				catch (e) {
					normalConsole(`failed to load the previous step of the page ${new Date().toString()}`);
				}
				break;
			//The previous step of a prompt may either be another prompt or a page or disabled
			default:
				try {
					let currentData = this.loadPrompt(current_step_name);
					let canGoBack = currentData.previous || false;
					if (canGoBack) {
						let previous = currentData.previous;
						//previous is a page
						if (previous.includes('page')) {
							data = this.loadPage(previous);
						}
						//previous step is a prompt
						else {
							data = this.loadPrompt(previous);
						}
					}
				}
				catch (e) {
					normalConsole(`failed to load previous step of the prompt ${new Date().toString()}`);
				}
				break;
		}

		return data;
	}
	loadNextData(current_step_name, type = '') {
		let data = false; //is either an array, an object or false
		//for a page, next step is an array of pages and/or prompt data
		if (type === 'page') {
			try {
				let currentData = this.loadPage(current_step_name);

				let options = currentData.options; //TODO: check to ensure children are iterable
				//filter the children to get only the enabled children
				options = options.filter((option) => {
					if (option.enabled) {
						return option;
					}
				});
				//get the next step array
				let nextArray = options.map((option) => {
					let name = option.name;
					let authenticate = option.authenticate || false;
					if (authenticate) {
						let auth = Object.assign({}, this.loadPrompt('inapp-login'));
						if (name.includes('page') && option.enabled) {
							let data = this.loadPage(option.name);
							auth.next = data.name;
							return auth;
						}
						//load prompt data
						if (!name.includes('page') && option.enabled) {
							//load the root element of the component
							let data = this.loadRootPrompt(option.name);
							auth.next = data.name;
							return auth;
						}
						return auth;
					}
					else {
						if (name.includes('page') && option.enabled) {
							return this.loadPage(option.name);
						}
						//load component element data
						if (!name.includes('page') && option.enabled) {
							//load the root element of the component
							return this.loadRootPrompt(option.name);
						}
					}
				});
				data = nextArray;
			}
			catch (e) {
				normalConsole(`failed to load the next page  ${new Date().toString()}` + current_step_name, e);
			}
		}
		//for a prompt, the next step is another prompt or a page or false
		else {
			try {
				let currentData = this.loadPrompt(current_step_name);
				let next = currentData.next || false;
				if (next) {
					if (next.includes('page')) {
						data = this.loadPage(next);
					}
					else {
						data = this.loadPrompt(next);
					}
				}
			}
			catch (e) {
				normalConsole(`failed to load the next prompt ( s ) ${new Date().toString()}`);
			}
		}
		return data;
	}
	searchData(needle) {
		let haystack = this.user_data//this.fetchCache ( this.cache_id );
		let searchObj = (object, key) => {
			let value;
			Object.keys(object).some((k) => {
				if (k === key) {
					value = object[k];
					return true;
				}
				if (object[k] && typeof object[k] === 'object') {
					value = searchObj(object[k], key);
					return value !== undefined;
				}
			});
			return value;
		};
		let result = searchObj(haystack, needle);
		return result;
	}
	async save(key, data) {
		let cache = require('../cache/cache');
		let store = new cache();
		let response = await store.put(key, data);
		return response;
	}
	async refresh(key, data) {
		let cache = require('../cache/cache');
		let store = new cache();
		//let response = await store.put(key, data);
		await store.put(key, data);
		let result = await store.get(key);
		return result;
	}
	async fetchCache(key) {
		let cache = require('../cache/cache');
		let store = new cache();
		let result = await store.get(key);
		return result;
	}
	validate(data, input) {
		const joi = require('joi');
		let inputIsValid = false;
		/**
			* --------------------------------------------------------------
			*  VALIDATE USER INPUT
			*
			*  NB: `For multiple validations e.g isAmount:min=50|isNumber, we should
			*  have a variable that stores whether all validations are passed and
			*  if any validation has not passed, then the appropriate errorn msg
			*  should be returned. This will enable us to have multiple custom error
			*  messages based on each failed validation e.g minimum amount not reached,
			*  invalid amount, ...etc
			*
			*
			* --------------------------------------------------------------
			*/
		//perform validations here using a for loop
		//Structure of the validation is ~ name, type, arguments
		let validations = data.validation || [];
		let currentValidation = '';
		if (validations.length === 0) { inputIsValid === true } //override for search

		//run the validations
		for (let validation of validations) {
			let validatorName = validation.name;
			let validationArguments = [];
			currentValidation = validatorName;
			let validationType = validation.type;

			//if the validation contains arguments, get the validation arguments
			if (typeof (validation.arguments) !== 'undefined') {
				let validationArgumentsArray = validation.arguments.split(",");
				validationArgumentsArray = validationArgumentsArray.filter((e) => {
					return e && e != null && e != 'null' && e.trim() != '' && typeof e != 'undefined';
				});
				for (let argument of validationArgumentsArray) {
					if (argument.includes("=")) {
						let argumentsParts = argument.split("=");
						validationArguments.push(argumentsParts[1]);
					}
				}
			}
			//get validator path
			let validationRules = false;
			let schema = {};

			// perform custom validations or joi validations or api calls here
			try {
				let validators = require('./validators');
				validationRules = validators[validatorName];
				if (validationType === 'joi') {
					//validate
					schema = joi.object().keys(
						validationRules(
							{
								prompt_data: data,
								user_data: this.user_data,
								app_config: this.app_config,
								app_code: this.code
							},
							joi,
							...validationArguments
						)
					).unknown();
					const validate = joi.validate({ [validatorName]: input }, schema);
					if (validate.error === null) {
						inputIsValid = true;
					}
					else {
						inputIsValid = false;
						break;
					}
				}
				else if (validationType === 'custom') {
					let validate = validationRules(
						input,
						{
							prompt_data: data,
							user_data: this.user_data,
							app_config: this.app_config,
							app_code: this.code
						},
						...validationArguments);
					if (validate) {
						inputIsValid = true;
					}
					else {
						inputIsValid = false;
						break;
					}
				}
				else if (validationType === 'api') {
				}
			}
			catch (e) {
				normalConsole(e);
			}
		}


		//get the current index of the failed validation
		let failedValidationIndex = false;
		if (inputIsValid === false) {
			for (let index in validations) {
				if (validations[index].name.includes(currentValidation)) {
					failedValidationIndex = index;
				}
			}
		}
		return {
			inputIsValid,
			failedValidationIndex
		};
	}
}
module.exports = MenuHandler;