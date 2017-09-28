
var express = require('express');
var router = express.Router();
var Blog = require('../modules/blog');


/* GET home page. */

router.get('/', function(req, res) {
    Blog.getAll(null, function (err, blogs) {
        if (err) {
            blogs = [];
        }
        res.render('index', { 
            title: '主页',
            blogs: blogs, 
            user: req.session.user, 
            success: req.flash('success').toString(), 
            error: req.flash('error').toString() 
        });
    });
});


module.exports = router;
