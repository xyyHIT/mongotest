const setting = require("../setting");

var logger = require('log4js').getLogger(__filename);
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var async = require("async");

var ObjectID = mongodb.ObjectID;

function connect_replicaSet_db() {
    MongoClient.connect(setting.mongodb_host_replicaSet.mongodb_cloud_url, {poolSize: 50, autoReconnect: true}, function (err, db) {
        assert.equal(null, err);

        exports.get_all_tables = function (cb) {
            var collection = db.collection('Tables');
            collection.find({},{fields:{user_id:1, _id:1, rela_user:1}}).sort({user_id:1}).toArray(function (err, allCollection) {
                if (err) {
                    cb({tables: []});
                } else {
                    cb({tables: allCollection});
                }
            });
        };

        exports.collection_is_exsist = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            collection.find({}, {_id:1}).sort({_id:1}).toArray(function (err, docs) {
                if (docs && docs.length > 0) {
                    cb({isExsist: true});
                } else {
                    cb({isExsist: false})
                }
            });
        };

        exports.createTableIndex = function (collectionName, cb) {
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
                // 处理原有索引否有唯一索引
                function (cb) {
                    async.waterfall([
                        function (callback) {
                            exports.getTableUniqueIndex(collectionName, function (queryResult) {
                                //console.log(collectionName + " ===>" +queryResult.result);
                                callback(null, queryResult.result);
                            });
                        },
                        function (indexList, callback) {
                            if (indexList && indexList.length> 0) {
                                exports.createShardUniqueIndex(collectionName, indexList, function (createResult) {
                                    if (createResult.ok == 1) {
                                        callback(null, 'create success');
                                    } else {
                                        callback(null, 'create error');
                                    }
                                });
                            } else {
                                callback(null, 'no unique index');
                            }
                        }
                    ],function (err, result) {
                        if (err) {
                            console.log("createUniqueIndexFail err==>"+JSON.stringify(err));
                            cb(null, collectionName + ' createUniqueIndexFail');
                        } else {
                            console.log("createUniqueIndexOk result==>"+result);
                            cb(null, collectionName + ' createUniqueIndexOk result='+result);
                        }
                    })
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

        exports.getTableIndexes = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            collection.listIndexes().toArray(function(err, indexes) {
                if(err) {
                    return cb({success:false,msg:err.toString()});
                }
                if(!Array.isArray(indexes)) {
                    return cb({success:true,result:[]});
                }
                cb({success:true,result:indexes});
            });
        };

        exports.isDataCenterCollection = function(collectionName, cb) {
            var col_tables = db.collection("Tables");
            var nameLength = collectionName.length;
            var objId = collectionName.substr(nameLength-24, 24);
            logger.debug(collectionName + " objId ===>"+objId);
            var check = false;
            async.waterfall([
                // 查询表的用户
                function (cb) {
                    col_tables.findOne({_id:ObjectID(objId)}, {fields:{user_id:1}}, function (err, doc) {
                        cb(null, doc);
                    })
                },
                // 查询是否是数据中心表
                function (user_id, cb) {
                    logger.debug("user_id  ===>" + parseInt(user_id.user_id));
                    if (user_id) {
                        col_tables.find({user_id:parseInt(user_id.user_id)},{limit:1, fields:{_id:1}}).sort({tb_createTime:-1}).toArray(function (err, docs) {
                            logger.debug("docs ===>" + JSON.stringify(docs));
                            if (docs && docs[0] == objId) {
                                check = true;
                            }
                            cb(null, 'Find user_id');
                        })
                    } else {
                        cb(null, 'No user_id');
                    }
                }
            ], function (err, result) {
                cb({isCheck: check});
            })
        }

    });
}
connect_replicaSet_db();