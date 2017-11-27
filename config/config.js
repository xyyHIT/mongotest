const setting = require("../setting");
var mongoose = require('mongoose');
var options = {
    server: {
        poolSize: 5,
        auto_reconnect: true,
        autoReconnect: true
    }
}
var db = mongoose.connect(setting.mongodb_cloud_db.url, options);
//mongoose.connect('mongodb://cloud_db_new:l6SlTuU7hkDOAlziXkBAs8l9Sbf83UHi@dds-wz91fa17dcdb74441.mongodb.rds.aliyuncs.com:3717/TS_Cloud_DB');
module.exports = mongoose;