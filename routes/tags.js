var express = require('express');
var router = express.Router();
var Blog = require('../modules/blog');
var checkUtil = require('../modules/check-util');


router.get('/', checkUtil.checkLogin, function(req, res) {
    Blog.getTags(function (err, blogs) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        res.render('tags', {title: '标签管理', blogs: blogs, user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString()});
    });
});

router.get('/:tag', function(req, res) {
    Blog.getBlogsByTag(req.params.tag, function (err, blogs) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        res.render('tag-blogs', {title: 'TAG:' + req.params.tag, blogs: blogs, user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString()});
    });
});

module.exports = router;