const { normalConsole } = require('../UssdLogs/logChalk')
class FormatData {
    constructor(user_data) {
        this.user_data = user_data;
    }
    formatDataAs = (id, value, extra) => {
        let transformed = value;
        let CryptoJS = require("crypto-js");
        let moment = require("moment");
        let commaNumber = require("comma-number");
        let config = require('../../config/config.json')
        let change_language=require('../../language')
        let accept_language=this.user_data['account-details']['accept_language']
        //const pinHashSecret = require("../../env.json").PIN_HASH_SECRET;

        switch (id) {

            case 'digitalLoanBal':
                let dittalLoanBal = value.split('|')
                dittalLoanBal = dittalLoanBal.filter((entry) => {
                    return entry && entry.trim() !== ''
                })

                //"LN1000000152|7001|Digital Loan|1000.00",

                this.user_data['global-request-details']['totalLimit'] = dittalLoanBal[3]
                this.user_data['global-request-details']['balanceLoan'] = dittalLoanBal[3]
                this.user_data['global-request-details']['availableLimit'] = dittalLoanBal[1]
                this.user_data['global-request-details']['utilisedLimit'] = dittalLoanBal[0]
                this.user_data['global-request-details']['dueDate'] = dittalLoanBal[1]

                break;
            case 'pesaChapLoanBal':
                let chapchapLoanBal = value.split('|')
                chapchapLoanBal = chapchapLoanBal.filter((entry) => {
                    return entry && entry.trim() !== ''
                })

                this.user_data['global-request-details']['loanAccount'] = chapchapLoanBal[0]
                this.user_data['global-request-details']['lonCode'] = chapchapLoanBal[1]
                this.user_data['global-request-details']['identifier'] = chapchapLoanBal[0]
                this.user_data['global-request-details']['balanceAmount'] = chapchapLoanBal[3]

                break;

            case "loanScoringParamsFormat":
                try {

                    if (value.includes('~') && value.includes('|')) {
                        let entries = value.split('~');
                        entries = entries.filter((entry) => {
                            return entry && entry.trim() !== ''
                        })
                        transformed = entries.map((entry) => {
                            entry = entry.split('|');
                            return {
                                'label': entry[1],
                                'value': entry[0]
                            }
                        })
                    }
                } catch (error) {
                    normalConsole(error);
                }
                break;
            case "loanScoringP001": {

                let loanParams = value

                transformed = []
                try {
                    if (loanParams.length > 0) {
                        loanParams = loanParams.filter(p => p.ScoringParam === 'P001' && p)
                        transformed = loanParams.map(p => {
                            return {
                                label: p.RangeDescription,
                                value: p.ParamRangeCode
                            }
                        })
                    }
                } catch (error) {

                }

            } break;
            case "loanScoringP002": {

                let loanParams = value

                transformed = []
                try {
                    if (loanParams.length > 0) {
                        loanParams = loanParams.filter(p => p.ScoringParam === 'P002' && p)
                        transformed = loanParams.map(p => {
                            return {
                                label: p.RangeDescription,
                                value: p.ParamRangeCode
                            }
                        })
                    }
                } catch (error) {

                }

            } break;
            case "loanScoringP003": {

                let loanParams = value

                transformed = []
                try {
                    if (loanParams.length > 0) {
                        loanParams = loanParams.filter(p => p.ScoringParam === 'P003' && p)
                        transformed = loanParams.map(p => {
                            return {
                                label: p.RangeDescription,
                                value: p.ParamRangeCode
                            }
                        })
                    }
                } catch (error) {

                }

            } break;
            case "loanScoringP004": {

                let loanParams = value

                transformed = []
                try {
                    if (loanParams.length > 0) {
                        loanParams = loanParams.filter(p => p.ScoringParam === 'P004' && p)
                        transformed = loanParams.map(p => {
                            return {
                                label: p.RangeDescription,
                                value: p.ParamRangeCode
                            }
                        })
                    }
                } catch (error) {

                }

            } break;
            case "loanScoringP005": {

                let loanParams = value

                transformed = []
                try {
                    if (loanParams.length > 0) {
                        loanParams = loanParams.filter(p => p.ScoringParam === 'P005' && p)
                        transformed = loanParams.map(p => {
                            return {
                                label: p.RangeDescription,
                                value: p.ParamRangeCode
                            }
                        })
                    }
                } catch (error) {

                }

            } break;
            case "loanScoringP006": {

                let loanParams = value

                transformed = []
                try {
                    if (loanParams.length > 0) {
                        loanParams = loanParams.filter(p => p.ScoringParam === 'P006' && p)
                        transformed = loanParams.map(p => {
                            return {
                                label: p.RangeDescription,
                                value: p.ParamRangeCode
                            }
                        })
                    }
                } catch (error) {

                }

            } break;
            case "digital-loan-statement": {

                let loanParams = value

                transformed = " "
                try {
                    if (loanParams.length > 0) {
                        loanParams.map(item => {


                            transformed += `Date: ${item.transDate} Amount: ${item.amount} Description: ${item.narration}\n`
                        })
                    }
                } catch (error) {

                }

            } break;
            case "agentCodeCharges": {
                this.user_data['global-request-details']['charge'] = "0.00"
                this.user_data['global-request-details']['tax'] = "0.00"

                try {

                    let itemParts = value.split('|')

                    if (itemParts[4] && itemParts[5]) {

                        this.user_data['global-request-details']['charge'] = itemParts[1]
                        this.user_data['global-request-details']['tax'] = itemParts[5]
                    }

                } catch (error) {

                }
            } break;
            case "bank-codes": {

                let banks = value

                transformed = []
                try {
                    if (banks.length > 0) {
                        transformed = banks.map(bank => {
                            return {
                                label: bank.BANK_NAME,
                                value: bank.SORT_CODE
                            }
                        })
                    }
                } catch (error) {

                }


            } break
            case "faulu-schools": {

                let schools = value

                transformed = []
                try {
                    if (schools.length > 0) {
                        transformed = schools.map(item => {
                            return {
                                label: item.INSTITUTION_NAME,
                                value: item.INSTITUTION_NAME,
                                meta: [
                                    {
                                        "save-as": "institutionAccount",
                                        "cache-path": "global-request-details",
                                        "value": item.ACCOUNT_NO
                                    },
                                    {
                                        "save-as": "institutionPhoneNo",
                                        "cache-path": "global-request-details",
                                        "value": item.PHONE_NUMBER
                                    },
                                    {
                                        "save-as": "institutionCode",
                                        "cache-path": "global-request-details",
                                        "value": item.INSTITUTION_CODE
                                    }
                                ]
                            }
                        })
                    }
                } catch (error) {

                }


            } break

            case "interswitch-cards": {

                let accounts = value

                transformed = []
                try {
                    if (accounts.responseMessage === "Success" && accounts.cards.length > 0) {
                        transformed = accounts.cards.map(item => {
                            return {
                                label: item.embossingName,
                                value: item.serno
                            }
                        })
                    }
                } catch (error) {

                }

            } break
            case "unlinked-accounts": {

                let accounts = value
                transformed = []
                try {
                    accounts = accounts.split('|').filter(e => e && e)
                    if (accounts && accounts.length > 0) {
                        transformed = accounts.map(item => {
                            let itemParts = item.split('~')
                            return {
                                label: `${itemParts[2]} - ${itemParts[0]}`,
                                value: itemParts[0],
                                "meta": [
                                    {
                                        "save-as": "accountClass",
                                        "cache-path": "global-request-details",
                                        "value": itemParts[1]
                                    }
                                ]
                            }
                        })
                    }
                } catch (error) {

                }

            } break
            case "get-linked-accounts": {

                let accounts = value

                transformed = []
                try {
                    if (accounts.length > 0) {
                        accounts = accounts.map(item => {
                            if (item.ALLOWDR === "Y") {
                                return {
                                    label: `${item.ProductName} - ${item.LINKEDACCOUNT}`,
                                    value: item.LINKEDACCOUNT
                                }
                            }
                        })
                        transformed = accounts.filter(e => e && e)
                    }
                } catch (error) {

                }

            } break
            case "get-deposit-accounts": {

                let accounts = value

                transformed = []
                try {
                    if (accounts.length > 0) {
                        transformed = accounts.map(item => {
                            return {
                                label: `${item.ProductName} - ${item.LINKEDACCOUNT}`,
                                value: item.LINKEDACCOUNT
                            }
                        })
                    }
                } catch (error) {

                }

            } break
            case "swift-codes": {

                let banks = value

                transformed = []
                try {
                    if (banks.length > 0) {
                        transformed = banks.map(bank => {
                            return {
                                label: bank.BANK_NAME,
                                value: `${bank.SWIFT_CODE}|${bank.BANK_CODE}`
                            }
                        })
                    }
                } catch (error) {

                }

            }
                break
            case "rtgs-swift-codes": {
                if (value !== '1' && value !== 1) {
                    let backCode = value
                    let itemParts = backCode.split('|')
                    this.user_data['global-request-details']['swiftCode'] = itemParts[0]
                    this.user_data['global-request-details']['rtgsBankCode'] = itemParts[1]
                }
            } break
            case "branch-codes": {

                let branches = value

                transformed = []
                if (branches.length > 0) {
                    transformed = branches.map(branch => {
                        return {
                            label: branch.BRANCH_NAME,
                            value: branch.BRANCH_CODE
                        }
                    })
                }


            } break;
            case "agent-outlets": {

                let outlets = value

                transformed = []
                if (outlets.length > 0) {
                    transformed = outlets.map(outlet => {
                        return {
                            label: outlet.outlet_name,
                            value: outlet.outlet_id,
                            "meta": [
                                {
                                    "save-as": "operatorOutletId",
                                    "cache-path": "global-request-details",
                                    "value": outlet.outlet_id
                                },
                                {
                                    "save-as": "operatorBussName",
                                    "cache-path": "global-request-details",
                                    "value": outlet.businessname
                                },
                                {
                                    "save-as": "operatorOutletName",
                                    "cache-path": "global-request-details",
                                    "value": outlet.outlet_name
                                },
                                {
                                    "save-as": "operatorLocation",
                                    "cache-path": "global-request-details",
                                    "value": outlet.location
                                }
                            ]
                        }
                    })
                }


            } break;
            case "agent-operators": {

                let operators = value

                transformed = []
                if (operators.length > 0) {

                    operators = operators.filter(e => e.operator_id !== this.user_data['operatorId'] && e)
                    transformed = operators.map(operator => {
                        return {
                            label: operator.operator_name,
                            value: operator.operator_id,
                            "meta": [
                                {
                                    "save-as": "operatorName",
                                    "cache-path": "global-request-details",
                                    "value": operator.operator_name
                                },
                                {
                                    "save-as": "operatorPhone",
                                    "cache-path": "global-request-details",
                                    "value": operator.phone_number
                                }
                            ]
                        }
                    })
                }


            } break;
            case "loan-tenure": {

                let operators = value

                transformed = ""
                if (operators.length > 0) {

                    operators = operators.find(e => e.REPAYMENT_PERIOD === this.user_data['global-request-details']['applicationRepaymentPeriod'] && e)
                    if (operators) {
                        transformed = operators['INTEREST_RATE']
                    }
                }


            } break;
            case "chap-chap-loan-tenure": {

                let operators = value

                transformed = ""
                if (operators.length > 0) {

                    operators = operators[0]
                    if (operators) {
                        this.user_data['global-request-details']['salaryTenureFrequency'] = operators['REPAYMENT_FREQUENCY'].replace(/M/, 'Months').replace(/D/, 'Days')
                        this.user_data['global-request-details']['salaryLoanRate'] = operators['INTEREST_RATE']
                        transformed = operators['REPAYMENT_PERIOD']
                    }
                }


            } break;

            case "cardDetails":
                try {
                    transformed = value.map((item) => {
                        let value = item.serno //+ '|' + item.name
                        let label = item.maskedPan
                        return {
                            label,
                            value
                        }

                    })
                } catch {
                    transformed = JSON.parse(value).map((item) => {
                        let value = item.serno //+ '|' + item.name
                        let label = item.maskedPan
                        return {
                            label,
                            value
                        }

                    })
                }
                break;
            case "mobileloanName":
                let loanInfo = this.user_data['global-request-details']['loanproductcode'] ? this.user_data['global-request-details']['loanproductcode'].split('|') : value.split('|')



                //cbsIdentifier|repaymentPeriod|minAmount|interestRate|digitalLoan|frequescy|productCode|maxAmount
                this.user_data['global-request-details']['cbsIdentifier'] = loanInfo[0]
                this.user_data['global-request-details']['repaymentPeriod'] = loanInfo[1]
                this.user_data['global-request-details']['minAmount'] = loanInfo[2]
                this.user_data['global-request-details']['interestRate'] = loanInfo[3]
                this.user_data['global-request-details']['digitalLoan'] = loanInfo[4]
                this.user_data['global-request-details']['frequency'] = loanInfo[5]
                this.user_data['global-request-details']['productCode'] = loanInfo[6]
                this.user_data['global-request-details']['maxAmount'] = loanInfo[7]
                this.user_data['global-request-details']['loanProdname'] = loanInfo[8]
                break;
            case "faulu-loan-products": {

                let products = value

                transformed = []
                try {
                    if (products.length > 0) {
                        transformed = products.map(item => {
                            if (item.DIGITAL_LOAN === 0 && item.SALARY_LOAN === 0) {

                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    'jump-to': "chap-chap-balance",
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            } else if (item.SALARY_LOAN === 1 && item.OVERDRAFT_LOAN === 0) {
                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    'jump-to': "salary-advance-balance",
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            } else if (item.SALARY_LOAN === 1 && item.OVERDRAFT_LOAN === 1) {
                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    'jump-to': "chap-chap-balance",
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            } else {
                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            }
                        })
                    }
                } catch (error) {

                }

            } break;
            case "faulu-loan-statement-products": {

                let products = value

                transformed = []
                try {
                    if (products.length > 0) {
                        products = products.filter(e => e.OVERDRAFT_LOAN !== 1 && e)
                        transformed = products.map(item => {
                            if (item.DIGITAL_LOAN === 1) {

                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    'jump-to': "digital-loan-statement-balance",
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            } else {
                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            }

                        })
                    }
                } catch (error) {

                }

            } break
            case "faulu-loan-balance-products": {

                let products = value

                transformed = []
                try {
                    if (products.length > 0) {
                        transformed = products.map(item => {

                            if (item.DIGITAL_LOAN === 1) {

                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    'jump-to': "loan-digital-balance",
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            } else {
                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    "meta": [
                                        {
                                            "save-as": "cbsIdentifier",
                                            "cache-path": "global-request-details",
                                            "value": item.CBS_PRODUCT_IDENTIFIER
                                        },
                                        {
                                            "save-as": "repaymentPeriod",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_PERIOD
                                        },
                                        {
                                            "save-as": "minAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MINIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "interestRate",
                                            "cache-path": "global-request-details",
                                            "value": item.INTEREST_RATE
                                        },
                                        {
                                            "save-as": "digitalLoan",
                                            "cache-path": "global-request-details",
                                            "value": item.DIGITAL_LOAN
                                        },
                                        {
                                            "save-as": "frequency",
                                            "cache-path": "global-request-details",
                                            "value": item.REPAYMENT_FREQUENCY
                                        },
                                        {
                                            "save-as": "productCode",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_CODE
                                        },
                                        {
                                            "save-as": "maxAmount",
                                            "cache-path": "global-request-details",
                                            "value": item.MAXIMUM_AMOUNT
                                        },
                                        {
                                            "save-as": "loanProdname",
                                            "cache-path": "global-request-details",
                                            "value": item.PRODUCT_NAME
                                        }
                                    ]
                                }
                            }
                        })
                    }
                } catch (error) {

                }

            } break
            case "faulu-loan-repayment-products": {

                let products = value

                transformed = []
                try {
                    if (products.length > 0) {
                        transformed = products.map(item => {

                            //if(item.SALARY_LOAN !== 1){

                            if (item.DIGITAL_LOAN === 1) {

                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    'jump-to': "digital-loan-repayment-amount"
                                }
                            } else if (item.DIGITAL_LOAN === 0 && item.SALARY_LOAN === 0) {

                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                    'jump-to': "chap-chap-loan-repayment-amount"
                                }
                            }
                            else {
                                return {
                                    label: item.PRODUCT_NAME,
                                    value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`
                                }
                            }
                            //}
                        })
                    }
                } catch (error) {

                }

            } break
            case "loan-payoff-products": {

                let products = value

                transformed = []
                try {
                    if (products.length > 0) {
                        transformed = products.map(item => {
                            return {
                                label: item.PRODUCT_NAME,
                                value: `${item.CBS_PRODUCT_IDENTIFIER}|${item.REPAYMENT_PERIOD}|${item.MINIMUM_AMOUNT}|${item.INTEREST_RATE}|${item.DIGITAL_LOAN}|${item.REPAYMENT_FREQUENCY}|${item.PRODUCT_CODE}|${item.MAXIMUM_AMOUNT}|${item.PRODUCT_NAME}`,
                                "meta": [
                                    {
                                        "save-as": "cbsIdentifier",
                                        "cache-path": "global-request-details",
                                        "value": item.CBS_PRODUCT_IDENTIFIER
                                    },
                                    {
                                        "save-as": "repaymentPeriod",
                                        "cache-path": "global-request-details",
                                        "value": item.REPAYMENT_PERIOD
                                    },
                                    {
                                        "save-as": "minAmount",
                                        "cache-path": "global-request-details",
                                        "value": item.MINIMUM_AMOUNT
                                    },
                                    {
                                        "save-as": "interestRate",
                                        "cache-path": "global-request-details",
                                        "value": item.INTEREST_RATE
                                    },
                                    {
                                        "save-as": "digitalLoan",
                                        "cache-path": "global-request-details",
                                        "value": item.DIGITAL_LOAN
                                    },
                                    {
                                        "save-as": "frequency",
                                        "cache-path": "global-request-details",
                                        "value": item.REPAYMENT_FREQUENCY
                                    },
                                    {
                                        "save-as": "productCode",
                                        "cache-path": "global-request-details",
                                        "value": item.PRODUCT_CODE
                                    },
                                    {
                                        "save-as": "maxAmount",
                                        "cache-path": "global-request-details",
                                        "value": item.MAXIMUM_AMOUNT
                                    },
                                    {
                                        "save-as": "loanProdname",
                                        "cache-path": "global-request-details",
                                        "value": item.PRODUCT_NAME
                                    }
                                ]
                            }
                        })
                    }
                } catch (error) {

                }

            } break
            case "payoff-amount": {
                let amount = 0
                if (value && value.length > 0) {
                    amount = value[0].TOTAL_BALANCE
                }
                transformed = amount
            } break
            case "call-deposit-accounts": {

                let products = value

                transformed = ""
                try {
                    if (products.length > 0) {
                        products.map(item => {


                            transformed += `Reference: ${item.EXTERNAL_REFERENCE}, Amount: ${item.AMOUNT}, Maturity date: ${item.MATURITY_DATE}\n`
                        })
                    }
                } catch (error) {

                }

            } break
            case "fixed-deposit-accounts": {

                let products = value

                transformed = ""
                try {
                    if (products.length > 0) {
                        products.map(item => {
                            transformed += `Account: ${item.LINKEDACCOUNT}, Balance: ${item.MinBalToEarnInterest}, Interest rate: ${item.InterestRate}\n`
                        })
                    }
                } catch (error) {

                }

            } break
            case "balance-timestamp":
                let BI_timestamp = require('moment')().format('DD-MM-YYYY');
                this.user_data['global-request-details']['balanceTime'] = BI_timestamp
                break;
            case "currency-code":
                transformed = value.replace(/[^A-Za-z]/g, '')
                break;

            case "internal-transfer-customer":
                //split the items
                let parts = value.split('|')
                //filter the items
                parts = parts.filter((item) => {
                    return item && item.trim() !== "" && typeof (item) !== 'undefined'
                })

                transformed = parts[1]
                break;

            case 'beneficiaries':

                let beneficiaryList = value.split('|')


                beneficiaryList = beneficiaryList.map((item) => {

                    let itemParts = item.split('-')
                    let obj = {
                        "label": itemParts[0].replace(/null/g, ' '),
                        "value": itemParts[1]
                    }
                    return obj
                })

                transformed = beneficiaryList
                break;
            case "dormant-accounts-activation": {

                transformed = []
                try {
                    let items = value.split('|').filter(item => item && item);

                    transformed = items.map(item => {
                        let itemPart = item.split('~')
                        return {
                            label: itemPart[0],
                            value: itemPart[0]
                        }
                    })
                } catch (error) {

                }
            } break;

            case 'loanPrd':
                transformed = ''

                if (value.includes('~') && value.includes('|')) {
                    let items = value.split('~')
                    items = items.filter((item) => {
                        return item && item.trim !== ''
                    })

                    for (let item of items) {
                        let itemParts = item.split('|')
                        let PRODUCT_CODE = itemParts[1]
                        let PRODUCT_NAME = itemParts[2]
                        let MAXIMUM_AMOUNT = itemParts[3]
                        let MINIMUM_AMOUNT = itemParts[4]
                        let REPAYMENT_FREQUENCY = itemParts[5]
                        let REPAYMENT_PERIOD = itemParts[6]
                        let INTEREST_RATE = itemParts[7]
                        // let net = itemParts [3]

                        if (REPAYMENT_FREQUENCY === 'D' && REPAYMENT_FREQUENCY !== '') {
                            REPAYMENT_FREQUENCY = 'Daily'
                        } else {
                            REPAYMENT_FREQUENCY = 'Monthly'
                        }
                        let obj = {
                            label: `PRODUCT NAME:${PRODUCT_NAME},INTEREST RATE:${INTEREST_RATE},REPAYMENT FREQUENCY${REPAYMENT_FREQUENCY}`,
                            value: `${PRODUCT_CODE}'|'${PRODUCT_NAME}'|'${MAXIMUM_AMOUNT}'|'${MINIMUM_AMOUNT}'|'${REPAYMENT_FREQUENCY}'|'${REPAYMENT_PERIOD}'|'${INTEREST_RATE}\n`
                        }

                        return obj
                    }
                    transformed = obj;
                }
            case "standing-orders":

                let sos = []

                try {
                    if (value.trim !== "") {

                        //split the items
                        let items = value.split('|')

                        //filter the items
                        items = items.filter((item) => {
                            return item && item.trim() !== "" && typeof (item) !== 'undefined'
                        })

                        //get the standing order ID
                        for (let item of items) {
                            let itemParts = item.split('~')
                            let soId = item.split('~')[4]
                            let soAmount = item.split('~')[1]
                            let soType = itemParts[10]
                            let soEndDate = itemParts[5]

                            sos.push({
                                "label": `${itemParts[0]} - KES ${commaNumber(itemParts[1])} - End Date ${itemParts[2]}`,
                                "value": soId,
                                "meta": [
                                    {
                                        "save-as": "so-current-amount",
                                        "cache-path": "global-request-details",
                                        "value": soAmount
                                    },
                                    {
                                        "save-as": "so-current-end-date",
                                        "cache-path": "global-request-details",
                                        "value": itemParts[2]
                                    },
                                    {
                                        "save-as": "so-current-frequency",
                                        "cache-path": "global-request-details",
                                        "value": itemParts[3]
                                    },
                                    {
                                        "save-as": "so-type",
                                        "cache-path": "global-request-details",
                                        "value": soType === 'AC' ? 'INTERNAL' : 'EXTERNAL'
                                    },
                                    {
                                        "save-as": "so-start-day",
                                        "cache-path": "global-request-details",
                                        "value": moment(soEndDate, 'DD MMM YYYY').format('DD-MM-YYYY')
                                    },
                                    {
                                        "save-as": "so-beneficiary-account",
                                        "cache-path": "global-request-details",
                                        "value": itemParts[6]
                                    },
                                    {
                                        "save-as": "so-beneficiary-name",
                                        "cache-path": "global-request-details",
                                        "value": itemParts[9]
                                    }
                                ]
                            })
                        }
                    }

                } catch (error) {
                    normalConsole(error)
                }

                transformed = sos
                break;

            case "credit-bank-wallet":
                transformed = '255' + value.slice(1)
                break;
            case "universalWallet-account":
                if (value.length < 11 && value.startsWith('0')) {
                    let phone = '255' + value.slice(1)
                    transformed = phone + '001'
                } else if (value.startsWith('255')) {
                    transformed = value + '001'
                } else {
                    transformed = value
                }

                break;

            case "branch-lookup":

                var branchStrArr = []
                let branches = []
                var dJSON = require('dirty-json')

                try {

                    value = dJSON.parse(value)

                    for (let branch of value) {
                        // normalConsole( { branch } )
                        let branchStr = JSON.stringify(branch)

                        if (!branchStrArr.includes(branchStr)) {
                            branchStrArr.push(branchStr)

                            //process branches
                            branches.push({
                                label: branch.BranchName,
                                value: branch.BranchCode
                            })
                        }
                    }
                }
                catch (e) {
                    normalConsole({ e })
                }

                // console.log ( { branches } )

                transformed = branches

                break;
            case 'faulu-balance':

                transformed = ''

                if (value.includes('|')) {
                    let items = value.split('|')
                    items = items.filter((item) => {
                        return item && item.trim !== ''
                    })

                    let fortmin = items[0]
                    let fortmax = items[1]

                    fortmin = `${parseFloat(fortmin).toFixed(2)}`;
                    fortmax = `${parseFloat(fortmax).toFixed(2)}`;
                    fortmax = commaNumber(fortmax)
                    fortmin = commaNumber(fortmin)

                    this.user_data['global-request-details']['actual-balance'] = fortmin
                    this.user_data['global-request-details']['available-balance'] = fortmax

                }
                else {

                }

                break;
            case "pesalink-phone-lookup": {
                let bankList = value
                bankList = bankList.split('|').filter(e => e && e)

                transformed = []
                if (bankList.length > 0) {

                    for (let bank of bankList) {
                        let details = bank.split('~')
                        transformed.push({
                            "label": details[1],
                            "value": details[0]
                        })
                    }
                }
            }
                break;
            case 'bankCode':
                transformed = `${value.toString()}000`;
                break;
            case 'intToString':
                transformed = value.toString()
                break;
            case 'jsonToString':
                transformed = JSON.stringify(value)
                break;
            case 'remove991':
                normalConsole("_____________uyuy here__ \n\n\n", value);
                if (value.startsWith('991')) {
                    transformed = value.replace('991', '')
                    normalConsole("_____________uyuy here__ \n\n\n", transformed);
                }
                //transformed = value
                break;
            case 'money':
                transformed = `${parseFloat(value).toFixed(2)}`;
                transformed = commaNumber(transformed)
                break;
            case 'date':
                try {
                    transformed = moment(value).format('DD MMM YYYY')
                } catch (error) {
                    transformed = value
                }
                break;
            case 'so-date':
                try {
                    transformed = moment(value).format('DD-MM-YYYY')
                } catch (error) {
                    transformed = value
                }
                break;
            case 'international-mobile-number':
                if (value.length === 10) {
                    transformed = `255${value.slice(1)}`;
                } else {
                    transformed = value;
                }

                break;
            case "tanzania-mobile-number":
                transformed = value;
                var regExp = /^0[0-9].*$/
                if (regExp.test(value)) {
                    transformed = `255${value.replace(/^0+/, '')}`;
                }
                break;
            case "mobile-number":
                transformed = value;
                var regExp = /^0[0-9].*$/
                if (regExp.test(value)) {
                    transformed = `255${value.replace(/^0+/, '')}`;
                }

                break;
            case "createSpaces":
                transformed = value.replace(/[.]/g, ' ')
                break;
            case 'capitalize':
                try {
                    transformed = value.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
                } catch (e) {
                    transformed = ' '
                }
                break;

            case "pin-hash":
                transformed = CryptoJS.HmacSHA256(Buffer.from(value + this.user_data.msisdn).toString(config.security.base64), config.security.secret).toString(CryptoJS.enc.Hex);
                break;

            case "agency-pin-hash":
                transformed = CryptoJS.HmacSHA512(Buffer.from(this.user_data['account-details'].loginId + value).toString(config.security.base64), config.security.hashed).toString(CryptoJS.enc.Hex);
                break;

            case "jisort-pin-hash":
                try {
                    transformed = require('bcrypt').hashSync(value, 10)
                }
                catch (e) {
                    normalConsole(e)
                }
                break;
            case "fortune-pin-hash":
                transformed = CryptoJS.HmacSHA256(Buffer.from(value).toString(), config.security.secret).toString(CryptoJS.enc.Hex);
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
            case "core-mini-cbplc":

                transformed = ''

                if (value.includes('~') && value.includes('|')) {
                    let items = value.split('~')
                    items = items.filter((item) => {
                        return item && item.trim !== ''
                    })

                    for (let item of items) {
                        let itemParts = item.split('|')
                        let coredate = itemParts[0]
                        let coreDescription = itemParts[1]
                        let amount = itemParts[2]

                        transformed += `${coredate}: ${coreDescription}-${amount}\n`
                    }
                }
                else {
                    transformed = value
                }


                break;
            case "merchant-details":
                let merchantLookup = value
                merchantLookup = JSON.parse(merchantLookup);

                this.user_data['global-request-details']['merchantName'] = merchantLookup.OUTLET_NAME;
                this.user_data['global-request-details']['merchantAccountNumber'] = merchantLookup.ACCOUNT_NUMBER;

                //transformed = value.replace ( /[.]/g, ' ' )
                break;
            case 'mobilemin':

                let itemParts = value.split('-')
                let code = itemParts[0]
                let mobDescription = itemParts[1]
                let balance = itemParts[2]

                //balance = balance.toFixed(2);
                balance = Math.round(balance * 100) / 100
                //balance = (Math.round(balance + "e+2") );

                this.user_data['global-request-details']['mobilecodeloan'] = code
                this.user_data['global-request-details']['mobileloan'] = mobDescription
                this.user_data['global-request-details']['mobilebalance'] = balance

                break;
            case 'faulu-agency-airtime': {

                let itemParts = value.split('-')
                this.user_data['global-request-details']['airtimeMNO'] = itemParts[0]
                this.user_data['global-request-details']['airtimeProvider'] = itemParts[1]

            } break;
            case 'prescoredAmount':
                if (value.includes('^')) {

                } else {
                    let prescore = this.user_data['account-details']['prescoredAmount']
                    this.user_data['global-request-details']['prescoredAmount'] = prescore
                }
                break;

            case 'fortune-loans':

                let fortloanparts = value.split('-')

                this.user_data['global-request-details']['loandescription'] = fortloanparts[0]
                this.user_data['global-request-details']['loancode'] = fortloanparts[1]
                this.user_data['global-request-details']['loanlimit'] = fortloanparts[2]
                this.user_data['global-request-details']['loanminimum'] = fortloanparts[3]
                this.user_data['global-request-details']['loanmaximum'] = fortloanparts[4]

                break;
            case 'fortune-schools':

                let fortschools = value.split('-')

                this.user_data['global-request-details']['schoolName'] = fortschools[0]
                this.user_data['global-request-details']['schoolAccount'] = fortschools[1]

                break;
            case 'remainderbal':

                let remainderbal = value
                let oldbalance = this.user_data['global-request-details']['mobilebalance']

                let remainderamt = (oldbalance - remainderbal)
                this.user_data['global-request-details']['remainingamt'] = remainderamt

                break;
            case 'fortcoreloan':

                let fortunecoreloan = value.split('-')
                let fortcoreloans = fortunecoreloan[0]


                const maskPhoneOptions = {
                    // Character to mask the data
                    // default value is '*'
                    maskWith: "*",
                    // If the starting 'n' digits needs to be unmasked
                    // Default value is 4
                    unmaskedStartDigits: 3, //Should be positive Integer
                    //If the ending 'n' digits needs to be unmasked
                    // Default value is 1
                    unmaskedEndDigits: 5 // Should be positive Integer
                };


                const maskedfortcoreloans = MaskData.maskPhone(fortcoreloans, maskPhoneOptions);

                this.user_data['global-request-details']['coreaccountnumber'] = maskedfortcoreloans
                this.user_data['global-request-details']['coreacountname'] = fortunecoreloan[1]

                break;
            case 'balance':

                transformed = ''

                if (value.includes('~') && value.includes('|')) {
                    let items = value.split('~')
                    items = items.filter((item) => {
                        return item && item.trim !== ''
                    })

                    for (let item of items) {
                        let itemParts = item.split('|')

                        let amounts = itemParts[5]
                        let minis = itemParts[1]
                        let maxBal = itemParts[2]
                        // let net = itemParts [3]

                        this.user_data['global-request-details']['amounts'] = amounts
                        this.user_data['global-request-details']['min'] = minis
                        this.user_data['global-request-details']['max'] = maxBal
                    }
                }
                else {

                }
                break;
            case 'fortunebalance':

                transformed = ''

                if (value.includes('|')) {
                    let items = value.split('|')
                    items = items.filter((item) => {
                        return item && item.trim !== ''
                    })

                    for (let item of items) {
                        let itemParts = item
                        normalConsole(itemParts);

                        let fortmin = items[0]
                        let fortmax = items[1]

                        this.user_data['global-request-details']['actual-balance'] = fortmin
                        this.user_data['global-request-details']['available-balance'] = fortmax
                    }
                }
                else {

                }

                break;
            case 'smepbalance':

                transformed = ''

                if (value.includes('|')) {
                    let items = value.split('|')
                    items = items.filter((item) => {
                        return item && item.trim !== ''
                    })

                    for (let item of items) {
                        let itemParts = item
                        normalConsole(itemParts);

                        let fortmin = items[0]
                        let fortmax = items[1]

                        this.user_data['global-request-details']['actual-balance'] = fortmin
                        this.user_data['global-request-details']['available-balance'] = fortmax
                    }
                }
                else {

                }

                break;
            case 'universalBalance':
                transformed = ''

                if (value.includes('|')) {
                    let items = value.split('|')
                    items = items.filter((item) => {
                        return item && item.trim !== ''
                    })



                    let actBal = items[1]
                    let availBal = items[2]

                    this.user_data['global-request-details']['actual-balance'] = actBal
                    this.user_data['global-request-details']['available-balance'] = availBal

                }
                else {

                }

                break;
            case 'forex':

                let forexData = []
                forexData = JSON.parse(value)
                forexData = forexData.filter((item) => {
                    return item && item.trim !== ''
                })

                if (forexData.length > 1) {
                    transformed = ''
                    for (let forex of forexData) {
                        let forexName = forex.CURRENCY_NAME
                        let forexSell = forex.SELL
                        let forexBuy = forex.BUY

                        transformed += `${forexName}: SELL: ${forexSell} BUY: ${forexBuy}\n`
                    }

                } else {
                    transformed = []
                }



                break;
            case 'universal-beneficary':

                let uniBeneficiary = []
                uniBeneficiary = JSON.parse(value)
                uniBeneficiary = uniBeneficiary.filter((item) => {
                    return item && item.trim !== ''
                })

                if (uniBeneficiary.length > 1) {
                    transformed = uniBeneficiary.map((item) => {

                        let obj = {
                            "label": item.BENEFICIARY_NAME + ' Account: ' + item.ACCOUNT_NUMBER,
                            "value": item.BENEFICIARY_NAME + '-' + item.ACCOUNT_NUMBER + '-' + item.ID
                        }
                        return obj
                    })

                } else {
                    transformed = []
                }



                break;
            case 'universalBenIDName':

                let univerBenIdName = value.split('-')

                this.user_data['global-request-details']['beneficaryName'] = univerBenIdName[0]
                this.user_data['global-request-details']['beneficaryAccount'] = univerBenIdName[1]
                this.user_data['global-request-details']['beneficaryID'] = univerBenIdName[2]

                break;
            case 'regIdTypes': {
                transformed = []
                if (value && value.length > 0) {

                    transformed = value.map(id => {
                        return {
                            label: id.ID_DESCRIPTION,
                            value: id.ID_TYPE
                        }
                    })
                }
            }
                break;
            case 'county-governments': {
                transformed = []
                try {
                    let counties = value.split('|').filter(e => e && e)

                    transformed = counties.map(entry => {
                        let parts = entry.split('~')
                        return {
                            label: parts[1],
                            value: parts[1].replace(/County/, ''),
                            meta: [
                                {
                                    "save-as": "countyId",
                                    "cache-path": "global-request-details",
                                    "value": parts[0]
                                }
                            ]
                        }
                    })
                } catch (error) {
                    normalConsole(error)
                }
            }
                break;

            ///Cargill formats
            case "cashoutChannelFormat": {
                /**
             THIS FORMATS 
           "cash-out-channel": [
           {
               "channelName": "Orange Money",
               "abreviation": "orange",
               "channelIndex": "1"
           },
           {
               "channelName": "MTN Money",
               "abreviation": "mtn",
               "channelIndex": "2"
           }]
           
            */
                let cashoutChannels = value
                transformed = []
                try {
                    if (cashoutChannels.length > 0) {
                        transformed = cashoutChannels.map(cashoutChannel => {
                            return {
                                label: `${cashoutChannel.channelName}`,
                                value: cashoutChannel.channelIndex
                            }
                        })
                    }
                } catch (error) {
                    normalConsole(`+++++++++++++++++++++++++++ ${error}+++++++++++++++++++++++++++++`);
                }
            } break;

            case "cashoutAccountFormat": {
                /**
             THIS FORMATS  "verified-account" and  "unverified-account"
         "verified-account": [
               {
                   "channelName": "MTN Money",
                   "channelAbbreviation": "mtn",
                   "accountNumber": "2550594851580",
                   "accountName": "Evans"
               }
           ]            
            */
                let verifiedAccounts = value
                transformed = []
                try {
                    if (verifiedAccounts.length > 0) {
                        transformed = verifiedAccounts.map(p => {
                            return {
                                label: `${p.channelName}-${p.accountNumber}-${p.accountName}`,
                                value: p.accountNumber,
                                abreviation: p.channelAbbreviation
                            }
                        })
                    }
                } catch (error) {
                    normalConsole(`+++++++++++++++++++++++++++ ${error}+++++++++++++++++++++++++++++`);
                }
            } break;

            case "verifiedAccountFormat": {
                /**
          THIS FORMATS 
          "data": [
{
        "id": 71,
        "beneficiaryName": "Oscar",
        "accountholderphonenumber": "255798997948",
        "channelId": 1,
        "channelType": "Telco",
        "channelName": "Orange Money",
        "channelAbbreviation": "orange",
        "channelNumber": "2550703035850",
        "bankName": null,
        "cardNumber": null,
        "expiryDate": null,
        "cvc": null,
        "dateCreated": "2022-04-08T12:34:24.56",
        "twofactorenabled": false,
        "status": true,
        "pin": "5404"
    }
] 
         * 
         */
                let verifiedAccounts = value

                transformed = []
                try {
                    normalConsole(`%%%%%%%%%%%%%%%%%%%%%%%%% estgsuj ${JSON.stringify(verifiedAccounts)}`);
                    if (verifiedAccounts.length > 0) {
                        verifiedAccounts = verifiedAccounts.filter(p => p.twofactorenabled === false)
                        normalConsole(`%%%%%%%%%%%%%%%%%%%%%%%%% ${JSON.stringify(verifiedAccounts)}`);
                        transformed = verifiedAccounts.map(p => {
                            return {
                                label: `${p.channelName}-${p.channelNumber}-${p.beneficiaryName}`,
                                value: p.channelNumber,
                                abreviation: p.channelAbbreviation
                            }
                        })
                    }
                } catch (error) {
                    normalConsole(`+++++++++++++++++++++++++++ ${error}+++++++++++++++++++++++++++++`);
                }

            } break;

            case "unVerifiedAccountFormat": {
                /**
      THIS FORMATS 
      "data": [
{
         "id": 71,
         "beneficiaryName": "Oscar",
         "accountholderphonenumber": "255798997948",
         "channelId": 1,
         "channelType": "Telco",
         "channelName": "Orange Money",
         "channelAbbreviation": "orange",
         "channelNumber": "2550703035850",
         "bankName": null,
         "cardNumber": null,
         "expiryDate": null,
         "cvc": null,
         "dateCreated": "2022-04-08T12:34:24.56",
         "twofactorenabled": false,
         "status": true,
         "pin": "5404"
     }
] 
     * 
     */
                let unVerifiedAccounts = value
                transformed = []
                try {
                    if (unVerifiedAccounts.length > 0) {
                        unVerifiedAccounts = unVerifiedAccounts.filter(p => p.twofactorenabled === true)
                        normalConsole(`%%%%%%%%%%%%%%%%%%%%%%%%% ${JSON.stringify(unVerifiedAccounts)}`);
                        transformed = unVerifiedAccounts.map(p => {
                            return {
                                label: `${p.channelName}-${p.channelNumber}-${p.beneficiaryName}`,
                                value: p.channelNumber,
                                abreviation: p.channelAbbreviation
                            }
                        })
                    }
                } catch (error) {

                }

            } break;

            case "allFarmerAccountFormat": {
                /**
             THIS FORMATS 
                    "data":
                     [
              {
           "id": 71,
           "beneficiaryName": "Oscar",
           "accountholderphonenumber": "255798997948",
           "channelId": 1,
           "channelType": "Telco",
           "channelName": "Orange Money",
           "channelAbbreviation": "orange",
           "channelNumber": "2550703035850",
           "bankName": null,
           "cardNumber": null,
           "expiryDate": null,
           "cvc": null,
           "dateCreated": "2022-04-08T12:34:24.56",
           "twofactorenabled": false,
           "status": true,
           "pin": "5404"
       }
           ] 
                   * 
                   */
                let allFarmerAccounts = value
                transformed = []
                try {
                    if (allFarmerAccounts.length > 0) {
                        //allFarmerAccounts = allFarmerAccounts.filter(p => p.twofactorenabled === true)
                        normalConsole(`%%%%%%%%%%%%%%%%%%%%%%%%% ${JSON.stringify(allFarmerAccounts)}`);
                        transformed = allFarmerAccounts.map(p => {
                            return {
                                label: `${p.channelName}-${p.channelNumber}-${p.beneficiaryName}`,
                                value: p.channelNumber,
                                abreviation: p.channelAbbreviation
                            }
                        })
                    }
                } catch (error) {

                }

            } break;

            //Vicoba formats
            case "groups-format":
                var myGroupsStrArr = [];
                let myGroups = [];
                let lang = change_language.changeLanguage(`${accept_language}`,`{{contribution_label}}`)
                
                normalConsole(`\n\n accept_language ==== ${accept_language}\n\n`);
                normalConsole(`\n\n accept_language ==== ${lang}\n\n`);
                try {
                    for (let myGroup of value) {
                        let myGroupStr = JSON.stringify(myGroup);
                        normalConsole("=======wallet======", { myGroupStr })
                        if (!myGroupsStrArr.includes(myGroupStr)) {
                            myGroupsStrArr.push(myGroupStr);

                            //process myGroups
                            myGroups.push({
                                label: myGroup.groupname,
                                value: myGroup.groupid,
                                title: myGroup.title,
                                groupsize: myGroup.groupsize,
                                activemembership: myGroup.activemembership,
                                approve: myGroup.approve
                                // defaultCurrency: wallet.defaultCurrency,
                                // accountId: wallet.accountId,
                            });
                        }
                    }
                } catch (e) {
                    normalConsole({ e });
                }

                transformed = myGroups;

                break;

            case "formatMyGroupInvites":
                var myInvitesStrArr = [];
                let myInvites = [];

                try {
                    for (let myInvite of value) {
                        let myInviteStr = JSON.stringify(myInvite);
                        normalConsole("=======wallet======", { myInviteStr })
                        if (!myInvitesStrArr.includes(myInviteStr)) {
                            myInvitesStrArr.push(myInviteStr);

                            //process myInvites
                            myInvites.push({
                                label: myInvite.groupName,
                                value: myInvite.id,
                                groupId: myInvite.groupId,
                                status: myInvite.status
                            });
                        }
                    }
                } catch (e) {
                    normalConsole({ e });
                }

                transformed = myInvites;

                break;

            case "invites-count-format":
                let numberOfCounts = null;

                if (value.length < 0 || value.length == 'undefined' || value.length === undefined) {
                    numberOfCounts = 0
                    transformed = numberOfCounts.toString();
                    normalConsole(`\n\n=======my-invites-count-format\n ${value.length}\n=============\n\n`)
                }

                //this.user_data["account-details"]["myInvitesCount"] = value.length.toString();

                // this.user_data["global-constants"]["myInvitesCount"] = myInvitesStrArr.length.toString();
                numberOfCounts = value.length;

                transformed = numberOfCounts;

                normalConsole(`\n\n=======my-invites-count-format======value====${transformed}  \n ${numberOfCounts} \n ${value.length}\n ${value} =============\n\n`)

                break;

            //groupMemberOfficials
            case 'formatgroupMemberOptions':
                /**
               {
            "id": 0,
            "firstname": "David",
            "lastname": "MandukuTEsting ",
            "dateofbirth": null,
            "phonenumber": "255747349929",
            "countrycode": null,
            "identification": "A2604097",
            "nationality": "TANZANIA",
            "gender": "F",
            "userDeviceId": null,
            "active": true,
            "isregisteredmember": true,
            "email": "",
            "ussdplatform": false,
            "imsi": null,
            "androidplatform": false,
            "iosplatform": false,
            "lastlogin": "2022-07-01T10:10:02.048+00:00",
            "esbwalletaccount": "255747349929",
            "walletexists": true,
            "createdOn": null,
            "lastUpdatedOn": null,
            "softDelete": false,
            "language": null,
            "groupTitle": "Treasurer",
            "linkedAccounts": null,
            "firstTimeLogin": false
        }

              **/
                let formatgroupMemberOptions = value
                transformed = formatgroupMemberOptions.map((item) => {
                    let obj = {
                        "label": `${item.firstname}-${item.groupTitle}`,
                        "value": item.id + '|' +
                            item.firstname + '|' +
                            item.lastname + '|' +
                            item.phonenumber + '|' +
                            item.groupTitle
                    }
                    return obj
                })
                break;
            //getGroupMemberOfficialsData
            case "getGroupMemberOfficialsData":
                let getGroupMemberOfficialsData = value.split('|')
                this.user_data['global-request-details']['memberid'] = getGroupMemberOfficialsData[0]
                this.user_data['global-request-details']['memberfirstname'] = getGroupMemberOfficialsData[1]
                this.user_data['global-request-details']['memberlastname'] = getGroupMemberOfficialsData[2]
                this.user_data['global-request-details']['memberphonenumber'] = getGroupMemberOfficialsData[3]
                this.user_data['global-request-details']['membergroupTitle'] = getGroupMemberOfficialsData[4]

                break;



            case 'vicobaloanProducts':
                let chLoanPr = value
                // chLoanPr.filter((item) => {
                //     return item && item.trim !== ''
                // })
                transformed = chLoanPr.map((item) => {
                    // "productid": 1,
                    // "productname": "Mavuno Loan",
                    // "description": "End Year Loan",
                    // "max_principal": 300000,
                    // "min_principal": 1000,
                    // "interesttype": "simple",
                    // "interestvalue": 5,
                    // "paymentperiod": 12,
                    // "paymentperiodtype": "month",
                    // "contributionid": 1,
                    // "contributionname": "Mweza Yote",
                    // "contributionbalance": 0,
                    // "groupname": "Mweza Yote",
                    // "groupid": 15,
                    // "isguarantor": false,
                    // "hasPenalty": true,
                    // "penaltyvalue": 30,
                    // "ispenaltypercentage": true,
                    // "usersavingvalue": 100,
                    // "userLoanLimit": 0,
                    // "debitAccountId": 1,
                    // "isActive": true,
                    // "penaltyPeriod": null
                    let obj = {
                        "label": item.productname,
                        "value": item.productid + '|' +
                            item.max_principal + '|' +
                            item.min_principal + '|' +
                            item.paymentperiod + '|' +
                            item.paymentperiodtype + '|' +
                            item.interesttype + '|' +
                            item.interestvalue + '|' +
                            item.contributionid
                    }
                    normalConsole(` item.contributionid ${item.contributionid}`);
                    return obj
                })
                break;
            case "getVicobaLoanData":
                let getVicobaLoanData = value.split('|')
                this.user_data['global-request-details']['productId'] = getVicobaLoanData[0]
                this.user_data['global-request-details']['loanMaximum'] = getVicobaLoanData[1]
                this.user_data['global-request-details']['loanMinimum'] = getVicobaLoanData[2]
                this.user_data['global-request-details']['paymentPeriod'] = getVicobaLoanData[3]
                this.user_data['global-request-details']['paymentPType'] = getVicobaLoanData[4]
                this.user_data['global-request-details']['interestType'] = getVicobaLoanData[5]
                this.user_data['global-request-details']['interestValue'] = getVicobaLoanData[6]
                this.user_data['global-request-details']['contributionid'] = getVicobaLoanData[7]

                break;

            case 'vicobaGroupContribution':
                let contributionList = value

                if (contributionList.length > 0) {
                    transformed = contributionList.map((item) => {

                        //     {
                        //         "id": 12,
                        //         "groupId": 39,
                        //         "name": "Vic group",
                        //         "startDate": "2022-06-02",
                        //         "memberGroupId": 39,
                        //         "active": false,
                        //         "reminder": 0,
                        //         "penalty": null,
                        //         "contributionAmount": 0,
                        //         "ispercentage": false,
                        //         "dueDate": null,
                        //         "amountType": "any amount",
                        //         "contributionTypeName": "recurring contribution",
                        //         "scheduleTypeName": "monthly"
                        //     }
                       let contribution_label= change_language.changeLanguage(`${accept_language}`,`{{contribution_label}}`)

                        let obj = {
                            "label": `${item.name} -${item.scheduleTypeName} ${contribution_label}`,
                            "value": item.id + '|' +
                                item.scheduleTypeName + '|' +
                                item.memberGroupId + '|' +
                                item.startDate + '|' +
                                item.paymentperiodtype + '|' +
                                item.penalty + '|' +
                                item.name + '|' +
                                item.amountType
                        }
                        return obj
                    })
                } else {

                }


                break;
            case "getGroupContributionData":
                let groupContributionId = value.split('|')
                this.user_data['global-request-details']['contributionId'] = groupContributionId[0]
                this.user_data['global-request-details']['scheduleTypeName'] = groupContributionId[1]
                this.user_data['global-request-details']['memberGroupId'] = groupContributionId[2]
                this.user_data['global-request-details']['startDate'] = groupContributionId[3]
                this.user_data['global-request-details']['paymentperiodtype'] = groupContributionId[4]
                this.user_data['global-request-details']['penalty'] = groupContributionId[5]
                this.user_data['global-request-details']['contributionName'] = groupContributionId[6]
                this.user_data['global-request-details']['amountType'] = groupContributionId[7]

                break;

            case 'vicobaUpComingContribution':
                let upComingContributionList = value
                transformed = upComingContributionList.map((item) => {

                    /**
                     * 
                     {
                "contributionName": "Wazimbitingi Chama",
                "schedulePaymentId": "CHAW54202236",
                "amount": 1000,
                "groupId": 28,
                "hasPenalty": null,
                "penaltyId": null,
                "penaltyAmount": null,
                "remaining": 1000,
                "expectedPaymentDate": "29/08/2022"

            }
                     */

                    let obj = {
                        "label": `${item.contributionName}`,
                        "value": item.schedulePaymentId + '|' +
                            item.contributionName + '|' +
                            item.remaining + '|' +
                            item.amount
                    }
                    return obj
                })
                break;

            case "getUpComingContributionData":
                let upComingContribution = value.split('|')
                this.user_data['global-request-details']['schedulePaymentId'] = upComingContribution[0]
                this.user_data['global-request-details']['contributionName'] = upComingContribution[1]
                this.user_data['global-request-details']['contributionRemaining'] = upComingContribution[2]
                this.user_data['global-request-details']['contributionAmount'] = upComingContribution[3]

                break;

            case 'vicobaGroupPendingWithdrawal':
                let groupPendingWithdrawal = value
                transformed = groupPendingWithdrawal.map((item) => {

                    /**
                     * 
                     {
                 "debitaccountname": "Wezesha Account",
            "debitaccountid": 1,
            "debitaccounttype": "Bank Account",
            "creditaccount": "255747349929",
            "amount": 100,
            "contributionid": 1,
            "capturedby": null,
            "withdrawal_narration": "David Manduku requesting to withdraw 100.00 from contribution Mweza Yote",
            "withdrawalreason": "withdraw Make",
            "status": "Awaiting approval from Chairperson and Treasurer",
            "requestid": 8,
            "appliedon": "09-06-2022 12:11:47"

            }
                     */

                    let obj = {
                        "label": item.withdrawal_narration,
                        "value": item.requestid + '|' +
                            item.amount + '|' +
                            item.creditaccount
                    }
                    return obj
                })
                break;
            case "getGroupPendingWithdrawalData":
                let getGroupPendingWithdrawalData = value.split('|')
                this.user_data['global-request-details']['requestid'] = getGroupPendingWithdrawalData[0]
                this.user_data['global-request-details']['amountToApprove'] = getGroupPendingWithdrawalData[1]
                this.user_data['global-request-details']['creditaccount'] = getGroupPendingWithdrawalData[2]

                break;

            case 'vicobaViewGroupContribution':
                let vicobaViewGroupContribution = value
                transformed = vicobaViewGroupContribution.map((item) => {

                    /**
            "id": 3,
            "createdBy": "MICROSERVICE",
            "createdOn": "2022-05-10T06:21:28.033+00:00",
            "lastModifiedBy": "MICROSERVICE",
            "lastModifiedDate": "2022-05-10T06:21:28.033+00:00",
            "softDelete": false,
            "contributionId": 1,
            "transactionId": null,
            "paymentStatus": "PAYMENT_SUCCESS",
            "amount": 1000,
            "phoneNumber": "255716356516",
            "mpesaPaymentId": null,
            "paymentFailureReason": null,
            "mpesaCheckoutId": null,
            "groupAccountId": 15,
            "paymentType": null,
            "isPenalty": false,
            "receiptImageUrl": null,
            "penaltyId": null,
            "schedulePaymentId": "1",
            "isCombinedPayment": false
                     **/
            let gave_label= change_language.changeLanguage(`${accept_language}`,`{{gave_label}}`)
            let status_is_label= change_language.changeLanguage(`${accept_language}`,`{{status_is_label}}`)

                    let obj = `${item.phoneNumber} ${gave_label} ${item.amount} ${status_is_label} ${item.PAYMENT_SUCCESS}`

                    return obj
                })
                break;
            case 'formatGroupLoansPendingApproval':
                let vicobaGroupLoansPendingApproval = value
                transformed = vicobaGroupLoansPendingApproval.map((item) => {

                    /**
//Response
            "loanproductid": 7,
            "loanapplicationid": 9,
            "amount": 1000,
            "loanproductname": "Deis",
            "appliedon": "13-06-2022 02:56:31",
            "membername": "David Manduku",
            "memberphonenumber": "255747349929",
            "unpaidloans": 0,
            "reminder": {},
            "guarantor": false
//REQUEST
            "accountid": 0,
            "approve": true,
            "groupid": 0,
            "loanapplicationid": 0
                     **/
                    let obj = {
                        "label": `${item.membername} - TZS ${item.amount}-${item.loanproductname}`,
                        "value": item.loanproductid + '|' +
                            item.loanapplicationid + '|' +
                            item.amount + '|' +
                            item.membername
                    }
                    return obj
                })
                break;

            case "getGroupLoansPendingApprovalData":
                let getGroupLoansPendingApprovalData = value.split('|')
                this.user_data['global-request-details']['loanproductid'] = getGroupLoansPendingApprovalData[0]
                this.user_data['global-request-details']['loanapplicationid'] = getGroupLoansPendingApprovalData[1]
                this.user_data['global-request-details']['amountToApprove'] = getGroupLoansPendingApprovalData[2]
                this.user_data['global-request-details']['membername'] = getGroupLoansPendingApprovalData[3]

                break;
            //FORMAT MINISTATEMENTS FOR USER
            case 'formatLoanPaymentsByUser':
                let formatLoanPaymentsByUser = value
                transformed = formatLoanPaymentsByUser.map((item) => {

                    /**
                        //Response
                                    "amount": 150,
                                    "oldamount": 2150,
                                    "newamount": 2000,
                                    "receiptnumber": "LPN9D7P7O3",
                                    "loandisbursedid": 4,
                                    "loanproductname": "Mavuno Loan",
                                    "membername": "David Manduku",
                                    "memberphonenumber": "255747349929",
                                    "appliedon": "10/55/2022 06:55:56"

                        //REQUEST
                                    "accountid": 0,
                                    "approve": true,
                                    "groupid": 0,
                                    "loanapplicationid": 0
                     **/
                    let obj = {
                        "label": `${item.loanproductname}-BR TZS ${item.newamount}-${item.receiptnumber}`,
                        "value": item.loandisbursedid + '|' +
                            item.receiptnumber + '|' +
                            item.amount + '|' +
                            item.oldamount + '|' +
                            item.newamount + '|' +
                            item.memberphonenumber + '|' +
                            item.loanproductname + '|' +
                            item.membername
                    }
                    return obj
                })
                break;
            //GET MINISTATEMENTS FOR USER
            case "getLoanPaymentsByUserData":
                let getLoanPaymentsByUserData = value.split('|')
                this.user_data['global-request-details']['loandisbursedid'] = getLoanPaymentsByUserData[0]
                this.user_data['global-request-details']['receiptnumber'] = getLoanPaymentsByUserData[1]
                this.user_data['global-request-details']['amount'] = getLoanPaymentsByUserData[2]
                this.user_data['global-request-details']['oldamount'] = getLoanPaymentsByUserData[3]
                this.user_data['global-request-details']['newamount'] = getLoanPaymentsByUserData[4]
                this.user_data['global-request-details']['memberphonenumber'] = getLoanPaymentsByUserData[5]
                this.user_data['global-request-details']['loanproductname'] = getLoanPaymentsByUserData[6]
                this.user_data['global-request-details']['membername'] = getLoanPaymentsByUserData[7]

                break;
            case "formatLinkedAccounts":
                let getlinkedAccounts = value
                normalConsole("=======getlinkedAccounts==========", value);
                transformed = getlinkedAccounts.split(',').filter(e => e && e).map((item) => {
                    let obj = {
                        label: item,
                        value: item
                    }
                    normalConsole("=======getlinkedAccounts==========", obj);
                    return obj
                })

                break;


            //disbursed
            //This are loans given out expected to be paid by use
            //filtered bu filer(user,group)
            case 'formatLoanDisbursed':
                /**
                        {
                            "loanid": 5,
                            "principal": 3000.0,
                            "interest": 150.0,
                            "dueamount": 0.0,
                            "duedate": "02/06/2023 04:03:00",
                            "daysoverdue": 0,
                            "recipient": "David Manduku",
                            "recipientsnumber": "255747349929",
                            "groupid": 15,
                            "groupname": "Mweza Yote",
                            "contributionid": 1,
                            "contributionname": "Mweza Yote",
                            "loanproductname": "Dameit",
                            "debitAccount": {
                                "accountname": "Wezesha Account",
                                "accounttypeid": 2,
                                "groupid": 0,
                                "accountbalance": 348194.0,
                                "accountdetails": null,
                                "accountid": 0
                            },
                            "accountTypeId": 2,
                            "loanPenaltyWrapperList": [],
                            "appliedon": "02/06/2022 04:03:00",
                            "guarantor": false
                        },
              **/
                let formatLoanDisbursed = value
                transformed = formatLoanDisbursed.map((item) => {
                    let obj = {
                        "label": `${item.loanproductname}-BR TZS ${item.dueamount}`,
                        "value": item.loanid + '|' +
                            item.recipientsnumber + '|' +
                            item.loanproductname + '|' +
                            item.recipient + '|' +
                            item.dueamount
                    }
                    return obj
                })
                break;
            case "getLoanDisbursedData":
                let getLoanDisbursedData = value.split('|')
                this.user_data['global-request-details']['loanid'] = getLoanDisbursedData[0]
                this.user_data['global-request-details']['recipientsnumber'] = getLoanDisbursedData[1]
                this.user_data['global-request-details']['loanproductname'] = getLoanDisbursedData[2]
                this.user_data['global-request-details']['recipient'] = getLoanDisbursedData[3]
                this.user_data['global-request-details']['dueamount'] = getLoanDisbursedData[4]

                break;
            //GROUP POLLS
            case 'formatGroupPollsOptions':
                /**
                 "id": 15,
            "groupId": 10,
            "groupName": "Milele Group",
            "description": "Replacement of Secretary",
            "startdate": "01-07-2022 12:00:00",
            "enddate": "02-07-2022 12:00:00"
              **/
                let formatGroupPollsOptions = value
                transformed = formatGroupPollsOptions.map((item) => {
                    let obj = {
                        "label": `${item.description}`,
                        "value": item.id + '|' +
                            item.startdate + '|' +
                            item.enddate + '|' +
                            item.description
                    }
                    return obj
                })
                break;
            case "getVicobaGroupPollsData":
                let getVicobaGroupPollsData = value.split('|')
                normalConsole(`+++++++++++++++++POLLIS ID IS ${this.user_data['global-request-details']['pollId']}++++++++++++++++++++++++++`);
                this.user_data['global-request-details']['pollId'] = getVicobaGroupPollsData[0]
                this.user_data['global-request-details']['pollStartDate'] = getVicobaGroupPollsData[1]
                this.user_data['global-request-details']['pollsEndDate'] = getVicobaGroupPollsData[2]
                this.user_data['global-request-details']['pollDescription'] = getVicobaGroupPollsData[3]

                break;
            //formatPollPositionsOptions
            case 'formatPollPositionsOptions':
                /**
 {
            "positionId": 17,
            "positionName": "chairperson",
            "noOfCandidates": 2,
            "totalVotesCasted": 0,
            "pollCandidatesResultRespList": []
        }
              **/
                let formatPollPositionsOptions = value
                transformed = formatPollPositionsOptions.map((item) => {
                    let obj = {
                        "label": `${item.positionName}`,
                        "value": item.positionId + '|' +
                            item.noOfCandidates + '|' +
                            item.totalVotesCasted + '|' +
                            item.positionName
                    }
                    return obj
                })
                break;
            //formatPollCandidatesResultRespListOptions
            case 'formatPollCandidatesResultRespListOptions':
                /**
                {
                {
                    "candidateId": 13,
                    "firstName": "David",
                    "lastName": "MandukuTEsting ",
                    "totalVotes": 0
                },
                {
                    "candidateId": 14,
                    "firstName": "James",
                    "lastName": "NgangaTEsting ",
                    "totalVotes": 0
                }
                }
              **/
                let formatPollCandidatesResultRespListOptions = value
                transformed = formatPollCandidatesResultRespListOptions.map((item) => {
                    let obj = {
                        "label": `${item.firstName} ${item.lastName}`,
                        "value": item.candidateId + '|' +
                            item.firstName + '|' +
                            item.lastName + '|' +
                            item.totalVotes
                    }
                    return obj
                })
                break;
            case 'formatPollCandidatesSummaryOptions':
                /**
                {
                {
                    "candidateId": 13,
                    "firstName": "David",
                    "lastName": "MandukuTEsting ",
                    "totalVotes": 0
                },
                {
                    "candidateId": 14,
                    "firstName": "James",
                    "lastName": "NgangaTEsting ",
                    "totalVotes": 0
                }
                }
              **/
                let name_label= change_language.changeLanguage(`${accept_language}`,`{{name_label}}`)

                let total_votes_label= change_language.changeLanguage(`${accept_language}`,`{{total_votes_label}}`)

                let formatPollCandidatesSummaryOptions = value
                transformed = formatPollCandidatesSummaryOptions.map((item) => {
                    let obj = {
                        "label": `${name_label}:${item.firstName} ${item.lastName},${total_votes_label} :${item.totalVotes}`,
                        "value": item.candidateId + '|' +
                            item.firstName + '|' +
                            item.lastName + '|' +
                            item.totalVotes
                    }
                    return obj
                })
                break;
            //getPollPositionsData
            case "getPollPositionsData":
                let getPollPositionsData = value.split('|')
                this.user_data['global-request-details']['positionId'] = getPollPositionsData[0]

                this.user_data['global-request-details']['noOfCandidates'] = getPollPositionsData[1]

                this.user_data['global-request-details']['totalVotesCasted'] = getPollPositionsData[2]

                this.user_data['global-request-details']['positionName'] = getPollPositionsData[3]
                break;
            //getPollCandidatesResultRespListData
            case "getPollCandidatesResultRespListData":
                let getPollCandidatesResultRespListData = value.split('|')
                this.user_data['global-request-details']['candidateId'] = getPollCandidatesResultRespListData[0]

                this.user_data['global-request-details']['candidatefirstName'] = getPollCandidatesResultRespListData[1]

                this.user_data['global-request-details']['candidatelastName'] = getPollCandidatesResultRespListData[2]

                this.user_data['global-request-details']['candidatetotalVotes'] = getPollCandidatesResultRespListData[3]
                break;

            //formatMemberRequestedToLeaveGroup
            case 'formatMemberRequestedToLeaveGroup':
                /**
                {
               "id": 0,
        "firstname": "James",
        "lastname": "NgangaTEsting ",
        "dateofbirth": null,
        "phonenumber": "255763895341",
        "countrycode": null,
        "identification": "1992090314",
        "nationality": "TANZANIA",
        "gender": "M",
        "userDeviceId": null,
        "active": true,
        "isregisteredmember": true,
        "email": "jacksonkatangaxxxz@yahoo.com",
        "ussdplatform": false,
        "imsi": null,
        "androidplatform": false,
        "iosplatform": false,
        "lastlogin": "2022-07-22T08:43:58.091+00:00",
        "esbwalletaccount": "255763895341",
        "walletexists": true,
        "createdOn": null,
        "lastUpdatedOn": null,
        "softDelete": false,
        "language": null,
        "groupTitle": "Treasurer",
        "linkedAccounts": null,
        "firstTimeLogin": false

                }
              **/
                let formatMemberRequestedToLeaveGroup = value
                transformed = formatMemberRequestedToLeaveGroup.map((item) => {
                    let obj = {
                        "label": `${item.firstname} ${item.lastname},Phone Number :${item.phonenumber}`,
                        "value": item.id + '|' +
                            item.firstname + '|' +
                            item.lastname + '|' +
                            item.phonenumber
                    }
                    return obj
                })
                break;
            //getMemberRequestedToLeaveGroupData
            case "getMemberRequestedToLeaveGroupData":
                let getMemberRequestedToLeaveGroupData = value.split('|')
                this.user_data['global-request-details']['memberId'] = getMemberRequestedToLeaveGroupData[0]

                this.user_data['global-request-details']['firstname'] = getMemberRequestedToLeaveGroupData[1]

                this.user_data['global-request-details']['lastname'] = getMemberRequestedToLeaveGroupData[2]

                this.user_data['global-request-details']['memberphonenumber'] = getMemberRequestedToLeaveGroupData[3]
                break;

            case 'formatWhenNoValueFound':
                // transformed = ''
                normalConsole(`formatWhenNoValueFound => ${value}`);
                if (value == undefined || value === undefined || value === null) {
                    transformed = "0"
                }
                transformed = value

                break;


        }

        return transformed;
    }
}


module.exports = FormatData;





