var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../modules/user');
var checkUtil = require('../modules/check-util');

/* GET register page. */
router.get('/', checkUtil.checkNotLogin, function(req, res) {
	res.render('reg', { title: '注册', user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString() });
});

/* POST register info */
router.post('/', checkUtil.checkNotLogin, function(req, res) {
	var name = req.body.name,
		password = req.body.password,
		password_re = req.body['password-repeat'];

	if (password !== password_re) {
		req.flash('error', '两次输入的密码不一致！');
		return res.redirect('/reg');
	}

	// 生成密码的md5值
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name: name,
		password: password,
		email: req.body.email
	});

	// chack user name is exist.
	User.get(newUser.name, function (err, user) {
		if (user) {
			req.flash('error', '用户名已存在！');
			return res.redirect('/reg');
		}

		newUser.save(function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			// save user info to session
			req.session.user = user;
			req.flash('success', '注册成功！');
			res.redirect('/');
		});
	});
});

module.exports = router;