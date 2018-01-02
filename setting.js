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
        //url : "mongodb://127.0.0.1:27001,127.0.0.1:27002,127.0.0.1:27003"
        url : "mongodb://10.81.136.69:20000,10.25.101.41:20000,10.27.167.148:20000"
    },
};