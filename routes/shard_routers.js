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
    replicaSet_db.get_all_tables(function (allTables) {
        console.log("allTables.tables.length==" + allTables.tables.length);
        async.each(allTables.tables, function (tableObj, callback) {
            if (tableObj.rela_user && tableObj.rela_user.length > 0) {
                async.each(tableObj.rela_user, function (obj, cb) {
                    var name = 'Table_'+obj.user_id+'_'+tableObj._id;
                    global.ALLTABLELENAMES.push(name);
                    cb(null);
                }, function (err) {
                    console.log('currlength=' + global.ALLTABLELENAMES.length);
                })
            }
            callback(null);
        }, function (err) {
            res.send(global.ALLTABLELENAMES);
        });
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
    var beginTime = Date.now();
    async.eachLimit(global.ALLTABLELENAMES, 200, function (tableObj, callback) {
        index++;
        async.waterfall([
            // 从replicaSet获取原有表中的索引信息
            function (cb) {
                replicaSet_db.getTableIndexes(tableObj, function (indexList) {
                    logger.debug(tableObj + " index ===>" + JSON.stringify(indexList));
                    cb(null, indexList.result);
                })
            },
            // 设置shard 分片表信息
            function (indexes, cb) {
                shard_db.createShardIndex(tableObj, indexes, function (result) {
                    cb(null, result.result);
                })
            },
            //如果有唯一索引，查看是否是数据中心表，如果不是，删除该唯一索引
            // function (uniqueIndexList, cb) {
            //     replicaSet_db.isDataCenterCollection(tableObj, function (result) {
            //         if (!result.isCheck) {
            //             shard_db.dropUniqueIndex(uniqueIndexList, tableObj, function (dropResult) {
            //                 logger.debug(tableObj + " drop Index result ===>" + dropResult);
            //                 cb(null, 'shardIndex OK');
            //             })
            //         } else {
            //             cb(null, 'shardIndex OK');
            //         }
            //     })
            // },
            // 对表应用分片
            function (uniqueIndexList, cb) {
                var command = { shardCollection : "TS_Cloud_DB."+tableObj};
                // 如果有唯一索引，用唯一索引分片
                if (uniqueIndexList && uniqueIndexList.length>0) {
                    command["key"] =  uniqueIndexList[0];
                } else {
                    command["key"] =  {_id:1};
                }
                shard_db.adminRunCommand(command, function (result) {
                    cb(null, result.result);
                });
            }
        ], function (err, result) {
                if (err) {
                    logger.info(index+'/'+total+" ensureSharding" + tableObj +" err==>"+JSON.stringify(err));
                    callback(null, 'ensureSharding Fail');
                } else {
                    logger.info(index+'/'+total+" ensureSharding" + tableObj + " Ok==>"+JSON.stringify(result));
                    callback(null, 'ensureSharding Ok');
                }
            });
    }, function (err) {
        var endTime = Date.now();
        var costTime = (endTime - beginTime)/1000;
        logger.info("共创建"+total+"个, 耗时:"+ costTime)
    });
    res.send({result:"开始运行，共需要创建"+total+"个"});
};

exports.shardCollections = function (req, res) {
    var collections = [
        {name: "Columns", shardKey:{tb_id:1,_id:1}},
        {name: "Tables", shardKey:{user_id:1,_id:1}},
        {name: "DataView", shardKey:{user_id:1,tb_id:1,_id:1}},
        {name: "DataRow", shardKey:{user_id:1,tb_id:1,_id:1}},
        {name: "SpaceSize", shardKey:{user_id:1}},
        {name: "Storage", shardKey:{user_id:1}},
        {name: "Interface", shardKey:{user_id:1,tb_id:1,_id:1}}
        ];
    async.each(collections, function (collectionInfo, callback) {
        async.waterfall([
            // 获取原来表的索引
            function (cb) {
                replicaSet_db.getTableIndexes(collectionInfo.name, function (indexList) {
                    logger.debug(collectionInfo.name + " index ===>" + JSON.stringify(indexList));
                    cb(null, indexList.result);
                })
            },
            function (indexes, cb) {
                shard_db.createShardIndex(collectionInfo.name, indexes, function (result) {
                    cb(null, result.result);
                })
            },
            function (indexCount, cb) {
                var command = {shardCollection: 'TS_Cloud_DB.'+collectionInfo.name, key:collectionInfo.shardKey};
                shard_db.adminRunCommand(command, function (result) {
                    cb(null, result.result);
                })
            }
        ], function (error, result) {
            if (error) {
                logger.error(collectionInfo.name + ' shardCollection Fail ===>'+JSON.stringify(error));
                callback(null, "shard faild");
            } else {
                logger.info(collectionInfo.name + ' shardCollection OK ===>'+JSON.stringify(result));
                callback(null, "shard ok");
            }
        });
    }, function (err) {
        if (err) {
            logger.error(JSON.stringify(err));
        } else {
            logger.info('All tables have been processed successfully');
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
