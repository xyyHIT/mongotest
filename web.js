var express = require('express');
var app = express();
var setting = require('./setting');
var ejs = require('ejs');

var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');


app.set('port', setting.web_port || 80);
app.set('views', './');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.static('./', { maxAge: 1000 * 60 * 60 * 24 }));

app.use(bodyParser.json({ limit: 1024 * 1024 * 20 })); // for parsing application/json
//最大上传10M
app.use(bodyParser.raw({ limit: 1024 * 1024 * 10 })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(cookieParser());

//MongoDB控制器响应入口
//var MongDB = require('./routes/mongodb_routes.js');
var ShardRouter = require('./routes/shard_routers.js');

// app.get('/mongodb/getAllTables', MongDB.getAllTables);
// app.get('/mongodb/createUser', MongDB.createUser);
// app.get('/mongodb/getCollectionDocCount', MongDB.getCollectionDocCount);
// app.get('/test/async_waterfall', MongDB.async_waterfall);
// app.get('/test/async_map', MongDB.async_map);
// app.get('/test/changeRandomData', MongDB.changeRandomData);
// app.get('/test/updateSelfColumn', MongDB.updateSelfColumn);
// app.get('/test/check', MongDB.checkCollectionExsist);
// app.get('/test/getAllUserTables', MongDB.getAllUserTables);
// app.get('/test/transferTableData', MongDB.transferTableData);
// app.get('/test/createTableIndex', MongDB.createTableIndex);
// app.get('/test/ensureSharding', MongDB.ensureSharding);
// app.get('/test/getCollectionIndexes', MongDB.getCollectionIndexes);
// app.get('/test/shardCollections', MongDB.shardCollections);
// app.get('/test/adminRunCommand', MongDB.adminRunCommand);
// app.get('/test/testConnection', MongDB.testConnection);
// app.get('/test/createShardIndex', MongDB.createShardIndex);
// app.get('/test/findByObjectId', MongDB.findByObjectId);

app.get('/test/getColNames', ShardRouter.getColNames);
app.get('/test/checkCollection', ShardRouter.checkCollection);

//app.post(/^\/mongodb\/(\S+)/, MongDB.index);

var port = setting.web_port || 80;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('web app listening at http://%s:%s', host, port);
});
