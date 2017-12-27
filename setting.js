module.exports = {
    web_port: 3000,
    log4js: {
        appenders: {
            console:{
                type: 'console',
                filename: 'logs/access.log',
                maxLogSize: 1024 * 1024,
                backups: 3
            }
        },
        categories:{
            default: {
                appenders: ['console'],
                level: 'error'
            }
        }
    },
    debug: true,

    mongodb_host : {
        //url : "mongodb://10.170.10.238:27000"
        url : "mongodb://10.45.177.26:20000,10.45.177.27:20000,10.45.176.29:20000"
    },
};