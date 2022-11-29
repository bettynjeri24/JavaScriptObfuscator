//"use strict"

require('dotenv').config({
    path: require('path').resolve(__dirname, '..', '..', 'dev.env')
});

const { normalConsole } = require('../UssdLogs/logChalk')
const ussdEnv = process.env.CACHE_ENVIRONMENT
const CryptoJS          = require ( 'crypto-js' )

const secureUserData = (data) => {
    var sData = {}
    let dataKeys = Object.keys(data)
    for (let i of dataKeys) {
        if (typeof data[i] === 'boolean') {
            data[i] = data[i].toString()
        }
        if (typeof data[i] === 'number') {
            data[i] = data[i].toString()
        }
        sData[i] = aesEncrypt(data[i])
    }
    if(ussdEnv == 'development'){
        sData = data
    }
    return data
}

const retrieveUserData = (data) => {
    var sData = {}
    let dataKeys = Object.keys(data)
    for (let i of dataKeys) {
        sData[i] = aesDecrypt(data[i])
        if (sData[i] === 'true') {
            sData[i] = true
        }
        if (sData[i] === 'false') {
            sData[i] = false
        }
    }
    if(ussdEnv == 'development'){
        sData = data
    }
    return data
}
const aesEncrypt = (message) => {

    if (typeof message === 'object') {
        message = JSON.stringify(message)
    }
    let encrypted = message
    try {
        encrypted = CryptoJS.AES.encrypt(
            message,
            CryptoJS.enc.Hex.parse(process.env.AES_KEY),
            {
                iv: CryptoJS.enc.Hex.parse(process.env.AES_IV),
                mode: CryptoJS.mode.CBC,
                formatter: CryptoJS.enc.Utf8,
                padding: CryptoJS.pad.Pkcs7
            }
        ).toString()
    } catch (error) {
        normalConsole({ aesEncryptError: error.message, message })
    }

    return encrypted;

}
const aesDecrypt = (message) => {


    let decrypted = message
    try {
        decrypted = CryptoJS.AES.decrypt(
            message.toString(),
            CryptoJS.enc.Hex.parse(process.env.AES_KEY),
            {
                iv: CryptoJS.enc.Hex.parse(process.env.AES_IV),
                mode: CryptoJS.mode.CBC,
                formatter: CryptoJS.enc.Utf8,
                padding: CryptoJS.pad.Pkcs7
            }
        ).toString(CryptoJS.enc.Utf8);
    } catch (error) {
        normalConsole({ aesDecryptError: error.message, message })
    }

    try {
        decrypted = JSON.parse(decrypted);
    }
    catch (e) {
    }

    return decrypted
}


module.exports = {
    secureUserData,
    retrieveUserData
}