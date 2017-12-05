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

    mongodb_host_rs: {
        url : "mongodb://10.24.213.120:27000"
    },
    mongodb_host_sh : {
        //url : "mongodb://10.170.10.238:27000"
        url : "mongodb://10.44.68.92:20000,10.170.10.238:20000,10.24.146.46:20000"
    },
};