var mongoose = require('mongoose');
var TablesSchema = new mongoose.Schema({
    tb_name: String,
    tb_createTime: String,
    rela_user: Array,
    user_id: Number,
    tb_row_size: Number,
    tb_sign_del: Boolean
});
mongoose.Promise = global.Promise;
TablesSchema.methods = {

    MongoDB_Tables_Test_Connection_FindOne: function (cb) {//测试连接 查询一张表
        this.model('Tables').findOne({}).exec(function (err, result) {
            cb(err, result);
        });
    },
    MongoDB_Tables_Query_All_ByUserId: function (user_id, cb) { //查询当前用户所有数据表列表
        this.model('Tables').find({ user_id: user_id, tb_sign_del: { $ne: true } }).exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_Query_TBID: function (tb_id, cb) {//查询一张表
        this.model("Tables").findOne({ _id: mongoose.Types.ObjectId(tb_id) }, function (err, result) {
            if (err) return cb({ success: false, msg: err });
            cb({ success: true, result: result });
        });
    },
    MongoDB_Tables_Sign_Delete: function (tb_id, cb) {//标记当前表结构已经删除 
        this.model("Tables").update({ _id: mongoose.Types.ObjectId(tb_id) }, { $set: { tb_sign_del: true} }, function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_User_Rela_Delete: function (tb_id, user_id, cb) {//删除一张表的用户关联
        this.model('Tables').findOne({ _id: tb_id }).exec(function (err, result) {
            if (err) {
                cb({ success: false, msg: result });
                return;
            } else {
                if (result) {
                    var LINQ = require('node-linq').LINQ
                    var arr = new LINQ(result.rela_user)
                    var bb = arr.Where(function (obj) {
                        return obj.user_id == user_id;
                    }).ToArray();
                    var user_index = result.rela_user.indexOf(bb[0]);
                    if (user_index > -1) {
                        result.rela_user.splice(user_index, 1);
                        result.save();
                    }
                    cb({ success: true, result: "删除成功！" });
                }
            }
        });
    },
    MongoDB_User_Rela_Tables_Query_All: function (user_id, cb) {//查询当前用户关联的表
        this.model('Tables').find({ "rela_user.user_id": user_id }).exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_User_Rela_Tables_Query: function (user_id, cb) {//查询当前用户、当前库关联的表
        this.model('Tables').find({ "rela_user.user_id": parseInt(user_id) }).exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_Update: function (params, cb) {//修改一张表
        this.model('Tables').find({ _id: mongoose.Types.ObjectId(params._id) }).exec(function (err, result) {
            if (err)
                cb({ success: false, msg: err });
            else {
                if (result.length > 0) {
                    var LINQ = require('node-linq').LINQ
                    var arr = new LINQ(result[0].rela_user)
                    for (var i = 0; i < params.rela_user.length; i++) {
                        var bb = arr.Where(function (obj) {
                            return obj.user_id == params.rela_user[i].user_id;
                        }).ToArray();
                        if (bb.length == 0) {
                            result[0].rela_user.push(params.rela_user[i]);
                        }
                    }
                    result[0].tb_name = params.tb_name;
                    result[0].tb_row_size = params.tb_row_size;
                    result[0].save();
                }
                cb({ success: true });
            }
        });
    },
    MongoDB_Tables_Query_Public: function (id, user_id, cb) {//查询用户可以查查看的表
        this.model('Tables').find().$where("this.tb_func==0||(this.tb_func==1&&this.user_id=='" + user_id + "'&&this.db_id=='" + id + "')||(this.tb_func==2&&'" + user_id + "'!='')").exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_FindOne_Prive: function (id, user_id, cb) {//查询一张自己表信息
        return this.model('Tables').findOne({ _id: id, user_id: user_id }).exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_FindOne: function (id, user_id, cb) {//查询一张关联表信息
        return this.model('Tables').findOne({ _id: id, "rela_user.user_id": user_id }).exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_Delete_ByDBId: function (db_id, cb) { //删除一个数据库的所有表
        var _this = this;
        this.model('Tables').remove({ db_id: db_id }, function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_Delete: function (id, cb) { //删除一张表信息
        var _this = this;
        this.model('Tables').remove({ _id: id }, function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_Create: function (params, cb) {//添加一张表信息
        var _this = this;
        //        this.model('Tables').find({ tb_name: params.tb_name }).exec(function (err, result) {
        //            if (err)
        //                cb({ success: false, msg: err });
        //            else {
        //                if (result && result.length > 0)
        //                    cb({ success: false, msg: "表名重复！" });
        //                else {
        var parent = _this.model('Tables')(params);
        //存入数据库
        parent.save(function (err, result) {
            var json = {};
            if (err) {
                cb({ success: false, msg: err });
            } else {
                cb({ success: true, result: result });
            }
        })
        //                }
        //            }
        //        });


    },
    MongoDB_Tables_Query_ByDB_Id: function (user_id, cb) { //查询数据表列表
        this.model('Tables').find({ user_id: user_id, tb_sign_del: { $ne: true} }).exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    },
    MongoDB_Tables_QueryId_ByDB_Id: function (params, cb) {//查询一个数据库所有数据表编号
        this.model('Tables').find({}, { "_id": 1 }).exec(function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        });
    }
};


module.exports = mongoose.model('Tables', TablesSchema, 'Tables');