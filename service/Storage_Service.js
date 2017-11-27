var mongoose = require('mongoose');
var StorageSchema = new mongoose.Schema({
    user_id: Number,
    key: String,
    value: Object
});

StorageSchema.methods = {
    Common_Set: function (user_id, key, value, cb) {//通用写入
        var _this = this;
        this.model("Storage").findOne({ user_id: user_id, key: key }, function (err, result) {
            if (!err) {
                if (result) {
                    result.value = value;
                    result.save();
                    cb({ success: true });
                } else {
                    _this.model("Storage").create({ user_id: user_id, key: key, value: value }, function (err, result) {
                        if (!err) {
                            cb({ success: true });
                        } else
                            cb({ success: false, msg: err });
                    });
                }
            } else {
                cb({ success: false, msg: err });

            }
        });
    },
    Common_Get: function (user_id, key, cb) {//通用获取
        var _this = this;
        this.model("Storage").findOne({ user_id: user_id, key: key }, { value: 1 }, function (err, result) {
            if (!err) {
                cb({ success: true, result: result });
            } else
                cb({ success: false, msg: err });
        });
    },
    Remove: function (user_id, key, key2, value, cb) {//删除一条表列更新数据
        var where = {};
        where["key"] = key;
        where[key2] = value;
        where.user_id = user_id;
        this.model("Storage").remove(where, function (err, result) {
            if (!err) {
                cb({ success: true, result: result });
            } else
                cb({ success: false, msg: err });
        });
    },
    Set: function (user_id, key, key2, value, version, cb) {//用户更新记录
        var where = {};
        where["key"] = key;
        where[key2] = value;
        where.user_id = user_id;
        var _this = this;
        this.model("Storage").findOne(where, function (err, result) {
            if (!err) {
                if (result) {
                    result.value = version;
                    result.save();
                    cb({ success: true });
                } else {
                    _this.model("Storage").create({ user_id: user_id, key: key, value: version }, function (err, result) {
                        if (!err) {
                            cb({ success: true });
                        } else
                            cb({ success: false, msg: err });
                    });
                }
            } else {
                cb({ success: false, msg: err });

            }
        });
    },
    Get: function (user_id, key, key2, value, cb) {//读取
        var where = {};
        where["key"] = key;
        where[key2] = value;
        where.user_id = user_id;
        this.model("Storage").find(where, function (err, result) {
            if (!err) {
                cb({ success: true, result: result });
            } else
                cb({ success: false, msg: err });
        });
    }
}

StorageSchema.statics = {

};


module.exports = mongoose.model('Storage', StorageSchema, 'Storage');