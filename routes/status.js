var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.send('status home page');
});

router.get('/about', function (req, res) {
    res.send('About status');
});

module.exports = router;