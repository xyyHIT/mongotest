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

    mongodb_host_shard : {
        //url : "mongodb://127.0.0.1:27001,127.0.0.1:27002,127.0.0.1:27003"
        mongodb_cloud_url: "mongodb://10.66.92.53:20000,10.30.252.215:20000,10.66.92.86:20000/TS_Cloud_DB",
        mongodb_admin_url: "mongodb://10.66.92.53:20000,10.30.252.215:20000,10.66.92.86:20000/admin",
    },
    mongodb_host_replicaSet : {
        mongodb_cloud_url: "mongodb://10.30.252.215:27002/TS_Cloud_DB"
    }
};