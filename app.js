
var log4js = require('log4js');
var setting = require('./setting');
log4js.configure(setting.log4js);

var logInfo = log4js.getLogger('logInfo');

logInfo.info("启动tcp server");

logInfo.info("启动tcp server 成功");

//启动web服务
require('./web.js');
