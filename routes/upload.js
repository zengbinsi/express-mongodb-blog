var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var checkUtil = require('../modules/check-util');

/* GET login page. */

router.get('/', checkUtil.checkLogin, function(req, res) {
	res.render('upload', { title: '文件上传', user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString() });
});

/* POST login info */
router.post('/', checkUtil.checkLogin, multipartyMiddleware, function(req, res) {
    
	for (var i in req.files) {
        if (req.files[i].size === 0) {
            // 使用同步方式删除一个文件
            fs.unlinkSync(req.files[i].path);
            console.log('Successfully remoed an empty file!');
        } else {
            var targetPath = './public/images/' + req.files[i].name;
            // 使用同步方式重命名一个文件
            try {
                var oldPath = req.files[i].path.toString();
                fs.renameSync(oldPath, targetPath);
            } catch (error) {
                console.log(req.files[i]);
                console.log(error);
            }
            
            console.log('Successfully renamed a file!');
        }
    }
    req.flash('success', '文件上传成功！');
    res.redirect('/upload');
});

module.exports = router;

