var options = {
    useMongoClient: true,
    autoReconnect:true,
    poolSize: 5
};
//10.25.203.162:21000,10.26.42.198:21000,10.26.40.75:21000
var mongoose = require('mongoose');
mongoose.connect('mongodb://10.45.177.26:20000,10.45.177.27:20000,10.45.176.29:20000/TS_Cloud_DB', options);
module.exports = mymongoose;