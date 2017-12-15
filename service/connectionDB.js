var options = {
    useMongoClient: true,
    autoReconnect:true,
    poolSize: 5
};
//10.25.203.162:21000,10.26.42.198:21000,10.26.40.75:21000
var mongoose = require('mongoose');
mongoose.connect('mongodb://10.25.203.162:20000,10.26.42.198:20000,10.26.40.75:20000/TS_Cloud_DB', options);
module.exports = mymongoose;