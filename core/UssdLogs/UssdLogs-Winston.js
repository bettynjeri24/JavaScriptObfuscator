const winston = require('winston');
const moment = require('moment');

const createUssdLogs = (logData) => {

    require('winston-daily-rotate-file');

    let filenameExt = `USSD-${logData.type}`

    logData.timestamp = moment().format()
    const transport = new (winston.transports.DailyRotateFile)({
        filename: filenameExt,
        datePattern: 'YYYY-MM-DD',
        extension: '.log',
        zippedArchive: false,
        maxSize: '5m',
        dirname: `../vicobalogs/USSD/${moment().format('YYYY-MM-DD')}`,
        maxFiles: '65d',
        auditFile: `../vicobalogs/audit/USSD/${moment().format('YYYY-MM-DD')}/${logData.type}-audit.json`
    });

    const logger = winston.createLogger({
        transports: [
            transport
        ]
    });

    logger.info(logData);
}

module.exports ={
    createUssdLogs
}