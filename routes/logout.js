var express = require('express');
var router = express.Router();
var checkUtil = require('../modules/check-util');

/* GET login page. */

router.get('/', checkUtil.checkLogin, function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功！');
    res.redirect('/');
});

module.exports = router;