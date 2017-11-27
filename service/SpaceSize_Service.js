var mongoose = require('mongoose');
var SpaceSizeSchema = new mongoose.Schema({
    user_id: Number,
    size: Number,
    end_time: Date
});
SpaceSizeSchema.methods = {
    SpaceSize_Query_User: function (user_id, cb) { //查询当前用户的空间
        this.model("SpaceSize").findOne({ user_id: user_id }).exec(function (err, result) {
            if (err) return cb({ success: false, msg: err });
            if (!result) return cb({ success: true, result: 1024 * 10 });
            if (new Date(result.end_time).getTime() - new Date().getTime() > 0) return cb({ success: true, result: result.size })
            else return cb({ success: true, result: 1024 * 10 });
        });
    },
    SpaceSize_Set_User: function (user_id, size, cb) { //给用户增加时间
        this.model("SpaceSize").findOne({ user_id: user_id }).exec(function (err, result) {
            if (err) return cb({ success: false, msg: err });
            if (!result) return cb({ success: true, result: 1024 * 10 });
            if (new Date(result.end_time).getTime() - new Date().getTime() > 0) return cb({ success: true, result: result.size })
            else return cb({ success: true, result: 1024 * 10 });
        });
    }
};

module.exports = mongoose.model('SpaceSize', SpaceSizeSchema, 'SpaceSize');