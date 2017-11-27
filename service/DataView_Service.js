var mongoose = require('mongoose');
var DataViewSchema = new mongoose.Schema({
    dv_name: String,
    dv_func: Number,
    col_page: Boolean,
    pageSize: Number,
    columns: {},
    user_id: Number,
    tb_id: String
});
DataViewSchema.methods = {
    MongoDB_DataView_Delete_User_ID: function (tb_id, user_id, cb) {//删除一个用户一张表所有试图
        this.model('DataView').remove({ tb_id: tb_id, user_id: user_id }, function (err, result) {
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
    MongoDB_DataView_Delete_DataBase: function (db_id, cb) {//删除一个库的所有视图
        this.model('DataView').remove({ db_id: db_id }, function (err, result) {
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
    MongoDB_DataView_Create: function (data, cb) {//添加视图
        this.model('DataView').create({ tb_id: data.tb_id, dv_name: data.dv_name, dv_func: data.dv_func, col_page: data.col_page, pageSize: data.pageSize, columns: data.columns, user_id: data.user_id }, function (err, result) {
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
    MongoDB_DataView_Delete: function (dv_id, cb) {//删除视图
        this.model('DataView').remove({ _id: dv_id }, function (err, result) {
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
    MongoDB_DataView_Update: function (iter, cb) { //更新视图
        this.model('DataView').update({ _id: mongoose.Types.ObjectId(iter._id) }, { $set: { dv_name: iter.dv_name, dv_func: iter.dv_func, col_page: iter.col_page, pageSize: iter.pageSize, columns: iter.columns} }, function (err, result) {
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
    MongoDB_DataView_FindOne_Prive: function (dv_id, user_id, cb) {//查询一个视图详细信息（自己的视图）
        this.model('DataView').findOne({ _id: dv_id, user_id: user_id }).exec(function (err, collection) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = collection;
            }
            cb(json);
        });
    },
    MongoDB_DataView_FindOne: function (dv_id, user_id, cb) {//查询一个视图详细信息
        this.model('DataView').findOne({ _id: dv_id, $or: [{ dv_func: 0 }, { dv_func: 1, user_id: user_id}] }).exec(function (err, collection) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = collection;
            }
            cb(json);
        });
    },
    MongoDB_DataView_Query_ByAccessKeyDBId: function (tb_id, user_id, cb) {//查找一个库的所有视图
        this.model('DataView').find({ tb_id: tb_id, $or: [{ dv_func: 0 }, { dv_func: 1, user_id: user_id}] }).exec(function (err, collection) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = collection;
            }
            cb(json);
        });
    },
    MongoDB_DataView_FindData: function (where, sort, col_sort_direction, PageSize, PageIndex, cb) {//查询视图数据
        if (sort) {
            var sort_json = {};
            if (sort == "out_createtime")
                sort_json["createtime"] = parseInt(col_sort_direction);
            else
                sort_json["row." + sort] = parseInt(col_sort_direction);
            if (PageSize)
                this.model('DataRow').find(where).skip(parseInt(PageIndex)).limit(parseInt(PageSize)).sort(sort_json).exec(function (err, collection) {
                    var json = {};
                    if (err) {
                        json.success = false;
                        json.msg = err;
                    } else {
                        json.success = true;
                        json.result = collection;
                    }
                    cb(json);
                });
            else
                this.model('DataRow').find(where).sort(sort_json).exec(function (err, collection) {
                    var json = {};
                    if (err) {
                        json.success = false;
                        json.msg = err;
                    } else {
                        json.success = true;
                        json.result = collection;
                    }
                    cb(json);
                });
        }

        else {
            if (PageSize)
                this.model('DataRow').find(where).skip(parseInt(PageIndex)).limit(parseInt(PageSize)).exec(function (err, collection) {
                    var json = {};
                    if (err) {
                        json.success = false;
                        json.msg = err;
                    } else {
                        json.success = true;
                        json.result = collection;
                    }
                    cb(json);
                });
            else
                this.model('DataRow').find(where).exec(function (err, collection) {
                    var json = {};
                    if (err) {
                        json.success = false;
                        json.msg = err;
                    } else {
                        json.success = true;
                        json.result = collection;
                    }
                    cb(json);
                });
        }
    },
    MongoDB_DataView_FindDataCount: function (where, sort, col_sort_direction, cb) { //查询视图数据总数
        if (sort) {
            var sort_json = {};
            sort_json[sort] = parseInt(col_sort_direction);
            this.model('DataRow').find(where).sort(sort_json).count(function (err, result) {
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
        else
            this.model('DataRow').find(where).count(function (err, result) {
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

module.exports = mongoose.model('DataView', DataViewSchema, 'DataView');