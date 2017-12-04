var util = require('util');
var logger = require('log4js').getLogger("MongoDB");

var cloud_db = require("../service/cloud_db.js");
var async = require("async");
global.TABLES = [];
global.COLLECTIONS = [];

exports.index = function (req, res) {
    res.json("this is index");
};


exports.getAllTables = function (req, res) {
    cloud_db.get_all_table_names(function (allTables) {
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

exports.checkCollectionExsist = function (req, res) {
    cloud_db.collection_is_exsist('Table_6140_59c547da237cf172f9dc3a2a', function (result) {
        res.send(result);
    })
};

exports.getAllUserTables = function (req, res) {
    cloud_db.get_all_tables(function (allTables) {
        console.log("allTables.tables.length==" + allTables.tables.length);
        async.each(allTables.tables, function (tableObj, callback) {
            var name = 'Table_'+tableObj.user_id+'_'+tableObj._id;
            global.TABLES.push(name);
            if (tableObj.rela_user && tableObj.rela_user.length > 0) {
                async.each(tableObj.rela_user, function (obj, cb) {
                    var name = 'Table_'+obj.user_id+'_'+tableObj._id;
                    global.TABLES.push(name);
                    cb(null);
                }, function (err) {
                    console.log('currlength=' + global.TABLES.length);
                })
            }
            callback(null);
        }, function (err) {
            res.send(global.TABLES);
        });
    });
};

exports.transferTableData = function (req, res) {
    var index = 0;
    async.eachLimit(global.TABLES, 10, function (tableObj, callback) {
        index++;
        cloud_db.transferTableData(tableObj, function (result) {
            console.log('update ===>' + result.num);
            callback(null);
        });
    }, function (err) {
        console.log(index);
    });
    res.send(index);
};

exports.createTableIndex = function (req, res) {
    var index = 0;
    async.eachLimit(global.TABLES, 10, function (tableObj, callback) {
        index++;
        cloud_db.createTableIndex(tableObj, function (result) {
            console.log('current:'+index+" createIndex ===>" + result.num);
            callback(null);
        }, function (err) {
            console.log('共创建索引'+index);
        });
    });
    res.send(index);
};

exports.ensureSharding = function (req, res) {
    var index = 0;
    async.eachLimit(global.TABLES, 10, function (tableObj, callback) {
        index++;
        cloud_db.runCommand(tableObj, function (result) {
            console.log('current:'+index+" shardcollection ===>"+result.result);
            callback(null);
        }, function (err) {
            console.log('共处理分片集合'+index);
        });
    });
    res.send(index);
};

exports.adminRunCommand = function (req, res) {
    var command = { enablesharding :"TS_Cloud_DB"};
    cloud_db.adminRunCommand(command, function (result) {
        console.log(result.result);
        res.send('success');
    });
};

exports.changeRandomData = function (req, res) {
    async.series([
        function (callback) {
            if (global.COLLECTIONS.length == 0) {
                cloud_db.get_collection_doc_id('Table_6140_59c547da237cf172f9dc3a2a', function (ids) {
                    if (ids) {
                        global.COLLECTIONS = ids.result;
                    }
                    callback(null,global.COLLECTIONS.length);
                });
            } else {
                callback(null,global.COLLECTIONS.length);
            }
        },
        function (callback) {
            var index = parseInt(Math.random()*global.COLLECTIONS.length);
            var doc_id = global.COLLECTIONS[index]._id.toString();
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

exports.updateSelfColumn = function (req, res) {
    cloud_db.update_self_column('Table_6140_59c547da237cf172f9dc3a2a', function (result) {
        if (result) {
            console.log(result.record.value._id);
            res.send(result);
        } else {
            console.log('result is null');
        }
    })
};

exports.getCollectionDocCount = function (req, res) {
    var collectionName = req.query.name;
    cloud_db.get_collection_doc_count(collectionName, function (result) {
        res.send(collectionName + '共有文档' + result.result +'个。');
    });
};

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