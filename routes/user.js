var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var Blog = require('../modules/blog');
var Comment = require('../modules/comment');
var User = require('../modules/user');
var checkUtil = require('../modules/check-util');


/* GET users listing. */
router.get('/', checkUtil.checkLogin, function(req, res) {
  res.send('respond with a resource');
});

// 个人主页
router.get('/:name', checkUtil.checkLogin, function (req, res) {
  User.get(req.params.name, function (err, user) {
      if (!user) {
          req.flash('error', '用户不存在');
          return res.redirect('/');
      }

      Blog.getAll(user.name, function (err, blogs) {
          if (err) {
              req.flash('error', err);
              return res.redirect('/');
          }

          res.render('user', {
              title: user.name,
              blogs: blogs,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
          });
      });
  });
});

// 查看某一篇文章
router.get('/:name/:day/:title', function (req, res) {
    Blog.getOne(req.params.name, req.params.day, req.params.title, function (err, blog) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        res.render('article', {
            title: req.params.title,
            blog: blog,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

// 留言
router.post('/:name/:day/:title', function (req, res) {
    var date = new Date(),
        time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5'),
        emailMD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
        head = 'http://www.gravatar.com/avatar/' + emailMD5 + '?s=48';
    var comment = {
        name: req.body.name,
        head: head,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };

    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }

        req.flash('success', '留言成功！');
        res.redirect('back');
    });
  });



// 编辑文章
router.get('/edit/:name/:day/:title', checkUtil.checkLogin, function (req, res) {
    var currentUser = req.session.user;
    Blog.edit(currentUser.name, req.params.day, req.params.title, function (err, blog) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }

        res.render('edit', {title: '编辑博客', blog: blog, user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString()});
    });
});

// 提交编辑文章
router.post('/edit/:name/:day/:title', checkUtil.checkLogin, function (req, res) {
    if (!req.body.blog || req.body.blog === '') {
        req.flash('error', '博客内容不能为空！');
        return res.redirect('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
    }

    var currentUser = req.session.user;
    Blog.update(currentUser.name, req.params.day, req.params.title, req.body.blog, function (err) {
        var url = '/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title;

        if (err) {
            req.flash('error', err);
            return res.redirect(url);
        }

        req.flash('success', '博客修改成功！');
        res.redirect(url);
    });
});

// 删除文章
router.get('/remove/:name/:day/:title', checkUtil.checkLogin, function (req, res) {
    var currentUser = req.session.user;
    Blog.remove(currentUser.name, req.params.day, req.params.title, function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }

        req.flash('success', '博客删除成功！');
        res.redirect('/');
    });
});

module.exports = router;

