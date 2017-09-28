var express = require('express');
var router = express.Router();
var Blog = require('../modules/blog');
var checkUtil = require('../modules/check-util');

/* GET users listing. */
router.get('/', checkUtil.checkLogin, function(req, res) {
    res.render('release', { title: '发布博客', user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString() });
});

router.post('/', checkUtil.checkLogin, function(req, res) {
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
        blog = new Blog(currentUser.name, currentUser.head, req.body.title, tags, req.body.blog);
    blog.save(function(err){
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发布成功！');
        res.redirect('/');
    });
});

module.exports = router;
