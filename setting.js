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
        url : "mongodb://10.45.176.29:20000,10.45.177.26:20000,10.45.177.27:20000"
    },
};