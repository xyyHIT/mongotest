const setting = require("../setting");

var logger = require('log4js').getLogger(__filename);
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var async = require("async");

var ObjectID = mongodb.ObjectID;


function connect_shard_admin() {
    MongoClient.connect(setting.mongodb_host_shard.mongodb_admin_url, {poolSize: 50, autoReconnect: true}, function (err, db) {
        assert.equal(null, err);

        // exports.runCommand = function (collectionName, cb) {
        //     var command = { shardCollection : "TS_Cloud_DB."+collectionName,key : {ts_user_id:1, ts_table_id:1}};
        //     console.log("command == "+ JSON.stringify(command));
        //     db.command(command, function (err, info) {
        //         if (!err) {
        //             cb({result: info});
        //         } else {
        //             console.log("err==> "+JSON.stringify(err));
        //             cb({result: 0});
        //         }
        //     });
        // };

        exports.adminRunCommand = function (command, cb) {
            logger.debug("command == "+ JSON.stringify(command));
            db.command(command, function (err, info) {
                if (!err) {
                    cb({result: err});
                } else {
                    cb({result: info});
                }
            });
        };
    });
}

function connect_shard_db() {
    MongoClient.connect(setting.mongodb_host_shard.mongodb_cloud_url, {poolSize: 50, autoReconnect: true}, function (err, db) {
        assert.equal(null, err);

        // 创建分片索引，返回唯一索引的名称列表
        exports.createShardIndex = function (collectionName, indexList, cb) {
            var collection = db.collection(collectionName);
            var uniqueIndex = [];
            async.each(indexList, function (indexInfo, callback) {
                if (!(indexInfo.name == "_id_")) {
                    logger.debug(collectionName + " need create index " + JSON.stringify(indexInfo));
                    var index_list = indexInfo.key;
                    var options = {};
                    if (indexInfo.unique) {
                        // 判断是否是数据中心
                        var index_unique = {_id: 1};
                        index_list = JSON.parse((JSON.stringify(index_unique)+JSON.stringify(index_list)).replace(/}{/,','));
                        options = {unique: true};
                        uniqueIndex.push(index_list);
                    }
                    logger.debug(collectionName + " create index key ===>" + JSON.stringify(index_list));
                    collection.createIndex(index_list, options, function (msg) {
                        logger.debug(collectionName + " create index ===>" + JSON.stringify(msg));
                        callback();
                    });
                } else {
                    logger.debug(collectionName + " ignore index " + JSON.stringify(indexInfo));
                    callback();
                }
            }, function (err) {
                if (err) {
                    logger.error(collectionName + " createShardIndex error : "+err);
                }
                cb({result:uniqueIndex});
            })
        };

        //删除唯一索引
        exports.dropUniqueIndex = function (indexList, collectionName, cb) {
            var collection = db.collection(collectionName);
            async.each(indexList, function (indexInfo, callback) {
                collection.dropIndex(indexInfo, function (err, result) {
                    callback(null, 'dropIndex OK');
                })
            }, function (err) {
                if (err) {
                    logger.error(collectionName + " dropUniqueIndex error ===>" + JSON.stringify(err));
                } else {
                    logger.error(collectionName + " dropUniqueIndex OK ===>");
                }
                cb({result: true});
            })

        };
    });
}
connect_shard_db();
connect_shard_admin();