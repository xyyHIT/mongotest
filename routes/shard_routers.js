var logger = require('log4js').getLogger(__filename);

var replicaSet_db = require("../service/replicaSet_db.js");
var shard_db = require('../service/shard_db');
var async = require("async");
global.ALLTABLELENAMES = [];

exports.index = function (req, res) {
    res.json("this is shard index");
};

// 从主从服务器获取所有表
exports.getColNames = function (req, res) {
    logger.debug("request  getColNames");
    replicaSet_db.get_all_table_names(function (allTables) {
        logger.debug("replicaSet_db.get_all_table_names  callback");
        if (allTables) {
            global.ALLTABLELENAMES = allTables.tables;
            res.send(global.ALLTABLELENAMES);
        } else {
            res.send('Table not found!');
        }
    });
};

exports.checkCollection = function (req, res) {
    var collectionName = req.query.table;
    replicaSet_db.collection_is_exsist(collectionName, function (result) {
        res.send(result);
    });
}

exports.ensureSharding = function (req, res) {
    var index = 0;
    var total = global.ALLTABLELENAMES.length;
    async.eachLimit(global.ALLTABLELENAMES, 50, function (tableObj, callback) {
        index++;
        async.waterfall([
            // 从replicaSet获取原有表中的索引信息
            function (callback) {
                replicaSet_db.getTableIndexes(tableObj, function (indexList) {
                    callback(null, indexList.result);
                })
            },
            // 设置shard 分片表信息
            function (indexList, callback) {
                shard_db.createShardIndex(tableObj, indexList, function () {

                })
            },
            // 对表应用分片
        ],
            function (err, result) {

            });
        var command = { shardCollection : "TS_Cloud_DB."+tableObj,key : {_id:1}};
        cloud_db.adminRunCommand(command, function (result) {
            console.log(index+'/'+total+" shardcollection ===>"+JSON.stringify(result.result));
            callback(null);
        }, function (err) {
            console.log('共处理分片集合'+index);
        });
    });
    res.send({result:"开始运行，共需要创建"+total+"个"});
};

exports.shardCollections = function (req, res) {
    var collections = [
        {name: "Columns", shardKey:{tb_id:1}},
        {name: "Tables", shardKey:{user_id:1}},
        {name: "DataView", shardKey:{user_id:1,tb_id:1}},
        {name: "DataRow", shardKey:{user_id:1,tb_id:1}},
        {name: "SpaceSize", shardKey:{user_id:1}},
        {name: "Storage", shardKey:{user_id:1}},
        {name: "Interface", shardKey:{user_id:1,tb_id:1}}
        ];
    async.eachSeries(collections, function (collectionInfo, callback) {
        async.series([
            function (cb) {
                if (collectionInfo.shardKey["user_id"] && collectionInfo.shardKey["tb_id"]) {
                    cloud_db.createShardIndex(collectionInfo, function (indexResult) {
                        if (indexResult.result == 1) {
                            cb(null, indexResult.result);
                        } else {
                            cb('createShardIndex Fail', indexResult.result);
                        }
                    })
                } else {
                    cb(null, 'shardIndexOK');
                }
            },
            function (cb) {
                var command = {shardCollection: 'TS_Cloud_DB.'+collectionInfo.name, key:collectionInfo.shardKey};
                cloud_db.adminRunCommand(command, function (result) {
                    cb(null, collectionInfo.name + "shard result ===>" + JSON.stringify(result.result));
                })
            }
        ], function (error, result) {
            if (error) {
                console.log('shardCollectionFail ===>'+JSON.stringify(error));
                callback(collectionInfo.name + " shard OK");
            } else {
                console.log('shardCollectionOK ===>'+JSON.stringify(result));
                callback();
            }
        });
    }, function (err) {
        if (err) {
            console.log(JSON.stringify(err));
        } else {
            console.log('All tables have been processed successfully');
        }
    });
    res.send("finish");
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
