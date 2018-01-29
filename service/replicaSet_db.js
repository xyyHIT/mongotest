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

        exports.get_all_table_names = function (cb) {
            var tableNames = [];
            var collection = db.collection('Tables');
            collection.find({},{user_id:1, _id:1}).sort({user_id:1}).toArray(function (err, allCollection) {
                for(var i=0;i<allCollection.length;i++) {
                    var tableName = 'Table_'+allCollection[i].user_id+"_"+allCollection[i]._id;
                    tableNames[i] = tableName;
                }
                var json = {};
                if (err) {
                    json.success = false;
                    json.msg = err;
                } else {
                    json = tableNames;
                }
                cb(json);
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

    });
}
connect_replicaSet_db();