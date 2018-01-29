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
            console.log("command == "+ JSON.stringify(command));
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

        exports.createShardIndex = function (collectionName, indexList, cb) {
            var collection = db.collection(collectionName);
            async.series([
                // 创建分片索引
                function (cb) {
                    collection.createIndex({_id: 1}, {}, function (err, indexName) {
                        if (!err) {
                            cb(null, collectionName+' createShardIndexOk  indexName='+indexName);
                        } else {
                            console.log("createShardIndexFail err==> "+JSON.stringify(err));
                            cb(null, collectionName+' createShardIndexFail');
                        }
                    })
                },
                // 创建原有数据库索引
                function (cb) {
                    async.each(indexList, function (indexInfo, callback) {
                        logger.info(JSON.stringify(indexInfo));
                    }, function (err) {
                        
                    });
                }

            ], function (err, result) {
                if (!err) {
                    cb({num: 1});
                } else {
                    console.log("err==> "+JSON.stringify(err));
                    cb({num: 0});
                }
            });
        };

        //创建唯一索引
        exports.create_only_index = function (index_only, coll, cb) {
            var index_list = {_id: 1};
            for (var i = 0; i < index_only.length; i++) {
                index_list[index_only[i]] = 1;
            }
            coll.createIndex(index_list, { unique: true }, function () {
                cb();
            });
        }

        //创建查询索引
        exports.create_combo_index = function (index_combo, coll, cb) {
            async.map(index_combo, function (index_name, cb) {
                coll.createIndex(index_name, function (msg) {
                    cb(index_name, msg);
                });
            }, cb);
        }


        exports.findByObjectId = function (collectionName, objectId, cb) {
            console.log("collectionName ===>"+ collectionName);
            console.log("objectId ===>"+objectId);
            var collection = db.collection(collectionName);
            collection.findOne({_id: ObjectID(objectId)}, {}, function (err, doc) {
                if (err) {
                    cb({result:err});
                } else {
                    cb({result:doc});
                }
            })
        };

        function getNowFormatDate() {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                + " " + date.getHours() + seperator2 + date.getMinutes()
                + seperator2 + date.getSeconds();
            return currentdate;
        }
    });
}
//connect_shard_db();
//connect_shard_admin();