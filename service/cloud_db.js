const setting = require("../setting");
//const logger = require('log4js').getLogger(__filename);
var async = require("async");

var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;
var assert = require('assert');

var ObjectID = mongodb.ObjectID;


function connect_user_db() {
    MongoClient.connect('mongodb://127.0.0.1:27001/user', { server: { poolSize: 5, auto_reconnect: true, autoReconnect: true } }, function (err, db) {
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

function connect_cloud_db() {
    MongoClient.connect('mongodb://127.0.0.1:27001/TS_Cloud_DB', { server: { poolSize: 5, auto_reconnect: true, autoReconnect: true } }, function (err, db) {
        assert.equal(null, err);

        exports.get_all_tables = function (cb) {
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