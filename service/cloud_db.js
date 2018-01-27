const setting = require("../setting");

var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var async = require("async");

var ObjectID = mongodb.ObjectID;


function connect_user_db() {
    MongoClient.connect(setting.mongodb_host.url+"/user", { poolSize: 5, autoReconnect: true}, function (err, db) {
        assert.equal(null, err);

        exports.create_user = function (json, cb) {
            var collection = db.collection('user');
            collection.save(json, function (err, result) {
                if (err) {
                    cb({success: false, msg: err});
                } else {
                    cb({success: true, msg: result});
                }
            });
        };
    });
}

function connect_admin_db() {
    MongoClient.connect(setting.mongodb_host.mongodb_admin_url, {poolSize: 50, autoReconnect: true}, function (err, db) {
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

function connect_cloud_db() {
    MongoClient.connect(setting.mongodb_host.mongodb_cloud_url, {poolSize: 50, autoReconnect: true}, function (err, db) {
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

        exports.get_collection_doc_count = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            collection.find({}).sort({_id:1}).toArray(function (err, collection) {
                if (collection) {
                    cb({result:collection.length});
                } else {
                    cb({result:0});
                }

            })
        };

        exports.get_collection_doc_id = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            collection.find({},{_id:1}).sort({_id:1}).toArray(function (err, allDocs) {
                if (allDocs) {
                    cb({result:allDocs});
                } else {
                    cb({result:[]});
                }
            })
        };

        exports.change_random_data = function (collectionName, doc_id, cb) {
            var collection = db.collection(collectionName);
            var now = getNowFormatDate();
            collection.findAndModify({_id: ObjectID(doc_id)}, [], {$set:{createtime:now}},{new:true}, function (err, result) {
                if (!err)
                    cb({ record: result});
                else
                    cb({});
            });
        };

        exports.update_self_column = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            collection.findOneAndUpdate({check: 1}, {$set:{check:0}}, {sort:{_id: 1}, upsert:true, returnNewDocument : true}, function (err, result) {
                if (!err) {
                    cb({record: result});
                } else {
                    cb({});
                }
            })
        };

        exports.transferTableData = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            var tmp = collectionName.split("_");
            var ts_user_id = parseInt(tmp[1]);
            var ts_table_id = tmp[2];
            collection.update({}, {$set:{ts_user_id:ts_user_id, ts_table_id:ts_table_id}}, {multi:true}, function (err, number) {
                if (!err) {
                    cb({num: number});
                } else {
                    console.log("err==> " + JSON.stringify(err));
                    cb({num: 0});
                }
            });

        };

        exports.createShardIndex = function (collectionInfo, cb) {
            var collection = db.collection(collectionInfo.name);
            collection.createIndex(collectionInfo.shardKey, {}, function (err, indexName) {
                if (!err) {
                    console.log(collectionInfo.name+' createShardIndexOk  indexName='+indexName);
                    cb({result: 1});
                } else {
                    console.log(collectionInfo.name+' createShardIndexFail ==>'+JSON.stringify(err));
                    cb({result: 0});
                }
            });
        };

        exports.createTableIndex = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            async.series([
                // 创建分片索引
                function (cb) {
                    collection.createIndex({_id: "hash"}, {unique:true}, function (err, indexName) {
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
                                })
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

        exports.createShardUniqueIndex = function (collectionName, indexList, cb) {
            var collection = db.collection(collectionName);
            async.each(indexList, function (un_index, callback) {
                var indexName = un_index.name;
                collection.dropIndex(indexName, {}, function (error, del_result) {
                    if (!error) {
                        console.log(collectionName + "dropIndexOK");
                        // 删除成功，开始新建索引
                        var unKey = {_id:"hash"};
                        for( var keyObj in un_index.key) {
                            unKey[keyObj] = 1;
                        }
                        collection.createIndex(unKey, {unique: true}, function (er, indexName) {
                            if (!er) {
                                console.log(collectionName + "createIndexOK");
                                callback();
                            } else {
                                callback(collectionName + "createIndexFail");
                            }
                        });
                    } else {
                        callback(collectionName + "dropIndexFail");
                    }
                });
            }, function (err) {
                if (err) {
                    cb({ok: 0});
                } else {
                    cb({ok: 1});
                }
            });
        };

        exports.getTableUniqueIndex = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            collection.listIndexes().toArray(function(err, indexes) {
                if(err) return cb({success:false,msg:err.toString()});
                if(!Array.isArray(indexes)) return cb({success:true,result:[]});
                var result = [];
                for (var i = 0; i < indexes.length; i++) {
                    var item = indexes[i];
                    if (item.unique) {
                        var item_key = item.key;
                        var key_name = item.name;
                        if (item_key.ts_user_id == null && item_key.ts_table_id == null) {
                            result.push({key: item_key, name: key_name});
                        }
                    }
                }
                cb({success:true,result:result});
            });
        };

        exports.shardCollection = function (collectionInfo, cb) {
            var collection = db.collection(collectionInfo.name);

            exports.adminRunCommand()
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
//connect_user_db();
connect_cloud_db();
connect_admin_db();