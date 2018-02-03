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
                level: 'info'
            }
        }
    },
    debug: true,

    mongodb_host_shard : {
        //url : "mongodb://127.0.0.1:27001,127.0.0.1:27002,127.0.0.1:27003"
        mongodb_cloud_url: "mongodb://10.170.10.238:20000,10.24.146.46:20000,10.24.146.46:20000/TS_Cloud_DB",
        mongodb_admin_url: "mongodb://10.170.10.238:20000,10.24.146.46:20000,10.24.146.46:20000/admin",
    },
    mongodb_host_replicaSet : {
        mongodb_cloud_url: "mongodb://cloud_db_new:l6SlTuU7hkDOAlziXkBAs8l9Sbf83UHi@dds-wz91fa17dcdb74441.mongodb.rds.aliyuncs.com:3717,dds-wz91fa17dcdb74442.mongodb.rds.aliyuncs.com:3717/TS_Cloud_DB?replicaSet=mgset-3248735"
    }
};