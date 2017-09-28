
var express = require('express');
var router = express.Router();
var Blog = require('../modules/blog');
var checkUtil = require('../modules/check-util');


/* GET home page. */

router.get('/', checkUtil.checkLogin, function(req, res) {
    Blog.getAchive(function (err, blogs) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('archive', { 
            title: '存档',
            blogs: blogs, 
            user: req.session.user, 
            success: req.flash('success').toString(), 
            error: req.flash('error').toString() 
        });
    });
});


module.exports = router;
