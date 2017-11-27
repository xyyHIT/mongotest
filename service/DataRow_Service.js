var mongoose = require('mongoose');
var DataRowSchema = new mongoose.Schema({
    tb_id: String,
    row: Object,
    createtime: String,
    user_id: Number
});
DataRowSchema.methods = {
    MongoDB_DataRow_Clear: function (user_id, tb_id, cb) {//清空数据
        this.model("DataRow").remove({ user_id: user_id, tb_id: tb_id }, function (err, result) {
            if (err) return cb({ success: false, msg: err });
            return cb({ success: true, result: result });
        });
    },
    MongoDB_DataRow_Query_Count: function (user_id, tb_id, cb) {//查询一个用户一张表的总条数
        this.model("DataRow").where({ user_id: user_id, tb_id: tb_id }).count(function (err, result) {
            if (err) return cb({ success: false, msg: err });
            return cb({ success: true, result: result });
        });
    },
    MongoDB_DataRow_Query_Field_Row: function (user_id, tb_id, col_name, col_value, cb) {//查询一张表一个字段符合的行
        var where = { tb_id: tb_id, user_id: user_id };
        where["row." + col_name] = col_value;
        this.model("DataRow").findOne(where).exec(function (err, result) {
            if (err) return cb({ success: false, msg: err });
            return cb({ success: true, result: result });
        });
    },
    MongoDB_DataRow_Delete_ByTbId_List: function (tb_ids, cb) {//删除多张表的数据
        this.model('DataRow').remove({ tb_id: { $in: tb_ids } }, function (err, result) {
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
    MongoDB_DataRow_Delete_ByTbId: function (user_id, tb_id, cb) {//删除一张表的数据
        this.model('DataRow').remove({ tb_id: tb_id, user_id: user_id }, function (err, result) {
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
    MongoDB_DataRow_Update: function (id, DataRow, cb) {//批量修改数据
        var parent = this.model('DataRow')();
        parent.collection.update({ _id: mongoose.Types.ObjectId(id) }, { $set: { row: DataRow.row } }, { multi: false }, function (err, result) {
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
    MongoDB_DataRow_Delete: function (DataRows, cb) {//批量删除数据
        this.model('DataRow').remove({ _id: { $in: DataRows } }, function (err, result) {
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
    MongoDB_DataRow_Create: function (DataRows, cb) {//批量插入数据
        var parent = this.model('DataRow')();
        parent.collection.insert(DataRows, function (err, result) {
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
    MongoDB_DataRow_FindTbId: function (tbid, user_id, PageSize, PageIndex, Sort_Directions, Sort_Field, Like_Where, cb) {//查询一个表的数据
        var select_json = Like_Where;
        select_json.tb_id = tbid;
        select_json.user_id = user_id;
        var sort_json = {};
        sort_json[Sort_Field] = Sort_Directions;
        this.model('DataRow').find(select_json).sort(sort_json).skip(parseInt(PageIndex)).limit(parseInt(PageSize)).exec(function (err, result) {
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
    MongoDB_DataRow_FindTbId_NoPage: function (tbid, user_id, Sort_Directions, Sort_Field, Like_Where, cb) {//查询一个表的数据 不分页
        var select_json = Like_Where;
        select_json.tb_id = tbid;
        select_json.user_id = user_id;
        var sort_json = {};
        sort_json[Sort_Field] = Sort_Directions;
        this.model('DataRow').find(select_json).sort(sort_json).exec(function (err, result) {
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
    MongoDB_DataRow_Count: function (tbid, user_id, Like_Where, cb) {//查询一个表的数据总数
        var select_json = Like_Where;
        select_json.tb_id = tbid;
        select_json.user_id = user_id;
        this.model('DataRow').where(select_json).count(function (err, result) {
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
    MongoDB_DataRow_QueryPrimary_Distinct: function (tbid, field, field_txt, cb) {//查询当前表主键列是否有重复
        var select_json = {};
        select_json.tb_id = tbid;
        select_json[field] = field_txt;
        this.model('DataRow').find(select_json).exec(function (err, result) {
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
    MongoDB_DataRow_Interface_Update: function (where, DataRow, cb) {//接口调用修改数据
        var parent = this.model('DataRow')();
        parent.collection.update(where, { $set: DataRow }, { multi: true }, function (err, result) {
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
    MongoDB_DataRow_Interface_Delete: function (DataRows, cb) {//接口调用删除数据
        this.model('DataRow').remove(DataRows, function (err, result) {
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

module.exports = mongoose.model('DataRow', DataRowSchema, 'DataRow');