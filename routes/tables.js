var express = require('express');
var router = express.Router();

var MongoDB = require('../service/mongodb');

// 查询集合中文档数量
router.use('/getAllTables', function (req, res, next) {

    MongoDB.find('Tables',{},'_id, user_id', function (err, res) {
        if (res) {
            var dataCount = 0;
            var table_name = null;
            var data = null;
            for(var i=0;i<res.length;i++) {
                data = res[i];
                var curr_table_name = "Tables_"+data['user_id']+"_"+data['_id'];
                MongoDB.find(curr_table_name,{}, '_id', function (error, datas) {
                    if (datas) {
                        console.log(datas.length);
                        console.log(table_name + "共有数据" + datas.length + "条");
                    }
                });
            }
        }
    });
});

module.exports = router;