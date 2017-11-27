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

    mongodb_user: {
        //url: "mongodb://127.0.0.1:27003/user"
        url: "mongodb://mongodb_test_1:27000/user"
    },
    mongodb_cloud_db: {
        //url: "mongodb://127.0.0.1:27001/TS_Cloud_DB"
        url: "mongodb://mongodb_test_1:27000/TS_Cloud_DB"
    }
};