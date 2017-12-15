var mongoose = require('mymongoose');
var TablesSchema = new mongoose.Schema({
    tb_name: String,
    tb_createTime: String,
    rela_user: Array,
    user_id: Number,
    tb_row_size: Number,
    tb_sign_del: Boolean
});

TablesSchema.methods = {
    MongoDB_Tables_Test_Connection_FindOne: function (cb) {//测试连接 查询一张表
        this.model('Tables').findOne({}).exec(function (err, result) {
            cb(err, result);
        });
    }
};

module.exports = mongoose.model('Tables', TablesSchema, 'Tables');
