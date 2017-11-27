var mongoose = require('mongoose');
var ColumnsSchema = new mongoose.Schema({
    col_name: String,
    col_PrimaryKey: Boolean,
    tb_id: String,
    col_displayName: String,
    col_sort: Number,
    col_version: Number
});
ColumnsSchema.methods = {
    MongoDB_Columns_Query_PrimaryKey: function (tb_id, col_version, cb) {//查询表的主键
        this.model("Columns").findOne({ tb_id: tb_id, col_PrimaryKey: true, col_version: col_version }).exec(function (err, result) {
            if (err) return cb({ success: false, msg: err });
            else return cb({ success: true, result: result });
        });
    },
    MongoDB_Columns_Delete_ByTbId_List: function (tb_ids, cb) {//删除多张表的列
        this.model('Columns').remove({ tb_id: { $in: tb_ids} }, function (err, result) {
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
    MongoDB_Columns_Delete_ByTbId: function (tb_id, cb) {//删除一张表的列
        this.model('Columns').remove({ tb_id: tb_id }, function (err, result) {
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
    MongoDB_GetMaxVersion: function (tb_id, cb) {//查找当前表的最新版本 
        this.model('Columns').findOne({ tb_id: tb_id }).sort({ col_version: -1 }).exec(function (err, result) {
            if (err) {
                cb({ success: false, msg: err });
            } else {
                var version = 1;
                if (result && result.col_version) {
                    version = (result.col_version || 0) + 1;
                }
                cb({ success: true, result: version });
            }
        });
    },
    MongoDB_Columns_Create: function (columns, cb) {//添加列
        var parent = this.model('Columns')();
        parent.collection.insert(columns, function (err, result) {
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
    MongoDB_Columns_Delete: function (columns, cb) {//删除列
        this.model('Columns').remove({ _id: { $in: columns} }, function (err, result) {
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
    MongoDB_Columns_Update: function (iter, cb) { //更新列
        this.model('Columns').update({ _id: mongoose.Types.ObjectId(iter._id) }, { $set: { col_name: iter.col_name, col_displayName: iter.col_displayName, col_PrimaryKey: iter.col_PrimaryKey, col_sort: iter.col_sort} }, function (err, result) {
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
    findBy_TbId: function (id, col_version, cb) {//查找一个表所有列
        this.model('Columns').find({ tb_id: id, col_version: col_version }).sort({ col_sort: "1" }).exec(function (err, collection) {
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
};

module.exports = mongoose.model('Columns', ColumnsSchema, 'Columns');