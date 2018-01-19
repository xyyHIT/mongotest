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
        mongodb_cloud_url: "mongodb://cloud_db_new:l6SlTuU7hkDOAlziXkBAs8l9Sbf83UHi@10.66.92.53:20000,10.30.252.215:20000,10.66.92.86:20000/TS_Cloud_DB",
        mongodb_admin_url: "mongodb://admin:103814717@10.66.92.53:20000,10.30.252.215:20000,10.66.92.86:20000/admin",
    },
};