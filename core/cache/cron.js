"use strict";
/**
 * Runs a given Cron job based on set rules
 *
 * @class Cron
 */
 const { normalConsole } = require('../UssdLogs/logChalk')
class Cron {
    /**
        *     *    *    *    *    *
        ┬    ┬    ┬    ┬    ┬    ┬
        │    │    │    │    │    │
        │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
        │    │    │    │    └───── month (1 - 12)
        │    │    │    └────────── day of month (1 - 31)
        │    │    └─────────────── hour (0 - 23)
        │    └──────────────────── minute (0 - 59)
        └───────────────────────── second (0 - 59, OPTIONAL)
     *
     * @memberof Cron
     */
    runSchedule() {
        var schedule = require('node-schedule');
        //var j = 
        schedule.scheduleJob('*/5 * * * * *', function () {
            normalConsole('The answer to life, the universe, and everything!');
        });
    }
}
let cron = new Cron();
cron.runSchedule();
