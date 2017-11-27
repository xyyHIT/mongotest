var util = require('util');
var logger = require('log4js').getLogger("MongoDB");

var Columns_Service = require('../service/Columns_Service.js');
var Tables_Service = require('../service/Tables_Service.js');
var DataRow_Service = require('../service/DataRow_Service.js');
var DataView_Service = require('../service/DataView_Service.js');
var Storage_Service = require('../service/Storage_Service.js');
var SpaceSize_Service = require('../service/SpaceSize_Service.js');
var User_Service = require('../service/User_Service');
var cloud_db = require("../service/cloud_db.js");
var async = require("async");
global.TABLES = [];

exports.index = function (req, res) {
    res.json("this is index");
};

exports.getAllTables = function (req, res) {
    cloud_db.get_all_tables(function (allTables) {
        if (allTables) {
            var maxCount = 0;
            var maxTableName = '';
            async.eachSeries(allTables, function (tableName, callback) {
                cloud_db.get_collection_doc_count(tableName, function (docCount) {
                    console.log(tableName + "====>" + docCount.result);
                    if (docCount.result > maxCount) {
                        maxCount = docCount.result;
                        maxTableName = tableName;
                    }
                    callback(null);
                })
            }, function (err) {
                console.log("maxCount==="+maxCount + "maxTableName==>"+maxTableName);
            });
        }
    });
};

exports.changeRandomData = function (req, res) {
    async.series([
        function (callback) {
            if (global.TABLES.length == 0) {
                cloud_db.get_collection_doc_id('Table_6140_59c547da237cf172f9dc3a2a', function (ids) {
                    if (ids) {
                        global.TABLES = ids.result;
                    }
                    callback(null,global.TABLES.length);
                });
            } else {
                callback(null,global.TABLES.length);
            }
        },
        function (callback) {
            var index = parseInt(Math.random()*global.TABLES.length);
            var doc_id = global.TABLES[index]._id.toString();
            cloud_db.change_random_data('Table_6140_59c547da237cf172f9dc3a2a',doc_id, function (result) {
                if (result) {
                    callback(null, result.record);
                } else {
                    callback(null, null);
                }
            })

        }
    ], function (err, result) {
        console.log('done ==>'+ result);
        res.send(result);
    });

};

exports.getCollectionDocCount = function (req, res) {
    var collectionName = req.query.name;
    cloud_db.get_collection_doc_count(collectionName, function (result) {
        res.send(collectionName + '共有文档' + result.result +'个。');
    });
}

exports.createUser = function (req, res) {
    var mobile = req.query.mobile;
    var name = req.query.name;
    var json = {
        name: name,
        mobile: mobile,
        sex: 1
    };
    cloud_db.create_user(json, function (result) {
        res.send(result);
    })
};

exports.createUserService = function (req, res) {
    var name = req.query.name;
    var mobile = req.query.mobile;
    var user = {
        name: name, mobile: mobile, age: 12
    };
    new User_Service().create_user(user, function (result) {
        res.json(result);
    });
};

/**
 * 同时处理集合中的数据，然后集中返回结果，最终处理函数保存了所有运行信息
 * @param req
 * @param res
 */
exports.async_map = function (req, res) {
    var Arr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
    async.map(Arr,function(item,callback){
        console.log("item ===>" + item);
        var _setValue = parseInt(item)+1;
        callback(null,_setValue);
    },function(err,results){
        console.log("map:"+results);
    });
};

exports.async_waterfall = function (req, res) {
    async.waterfall([
        function(callback){
            callback(null, 1, 2);
        },
        function(arg1, arg2, callback){
            callback(null, arg1+arg2+3);
        },
        function(arg1, callback){
            callback(null,arg1+4);
        }
    ], function (err, result) {
        console.log("waterfall:"+result);
    });
};