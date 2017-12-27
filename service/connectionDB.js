const setting = require("../setting");

var options = {
    useMongoClient: true,
    autoReconnect:true,
    poolSize: 5
};
var mongoose = require('mongoose');
mongoose.connect(setting.mongodb_host.url+"/TS_Cloud_DB", options);