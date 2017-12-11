const setting = require("../setting");

var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;
var assert = require('assert');

var ObjectID = mongodb.ObjectID;


function connect_user_db() {
    MongoClient.connect(setting.mongodb_host_sh.url+"/user?w=1", { server: { poolSize: 5, auto_reconnect: true, autoReconnect: true } }, function (err, db) {
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
    MongoClient.connect(setting.mongodb_host_sh.url+"/admin?w=1", { server: { poolSize: 5, auto_reconnect: true, autoReconnect: true } }, function (err, db) {
        assert.equal(null, err);

        exports.runCommand = function (collectionName, cb) {
            var command = { shardCollection : "TS_Cloud_DB."+collectionName,key : {ts_user_id:1, ts_table_id:1}};
            console.log("command == "+ command);
            db.command(command, function (err, info) {
                if (!err) {
                    cb({result: info});
                } else {
                    cb({result: 0});
                }
            });
        };

        exports.adminRunCommand = function (command, cb) {
            db.command(command, function (err, info) {
                if (!err) {
                    cb({result: info});
                } else {
                    cb({result: 0});
                }
            });
        };
    });
}

function connect_cloud_db() {
    MongoClient.connect(setting.mongodb_host_sh.url+"/TS_Cloud_DB?w=1", { server: { poolSize: 5, auto_reconnect: true, autoReconnect: true } }, function (err, db) {
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
            var ts_user_id = tmp[1];
            var ts_table_id = tmp[2];
            collection.update({}, {$set:{ts_user_id:ts_user_id, ts_table_id:ts_table_id}}, {w:1, multi:true}, function (err, number) {
                if (!err) {
                    cb({num: number});
                } else {
                    cb({num: 0});
                }
            });

        };

        exports.createTableIndex = function (collectionName, cb) {
            var collection = db.collection(collectionName);
            var options = {background:true,w:1};
            collection.createIndex({ts_user_id:1, ts_table_id: 1}, options, function (err, indexName) {
                if (!err) {
                    cb({num: indexName});
                } else {
                    cb({num: 0});
                }
            });
        }

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
connect_user_db();
connect_cloud_db();
connect_admin_db();