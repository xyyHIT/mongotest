var mongoose = require('../config/config');
var UserSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    age: Number
});

UserSchema.methods = {
    create_user: function (user, cb) {
        var parent = this.model('UserModel')();
        parent.collection.insert(user, function (err, result) {
            var json = {};
            if (err) {
                json.success = false;
                json.msg = err;
            } else {
                json.success = true;
                json.result = result;
            }
            cb(json);
        })
    }
};

module.exports = mongoose.model('UserModel', UserSchema, 'user');