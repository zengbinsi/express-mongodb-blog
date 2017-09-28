
var util = {
    checkLogin: function (req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录！');
            return res.redirect('/login');
        }
        next();
    },
    checkNotLogin: function (req, res, next) {
        console.log('sssssss',req.session.user);
        if (req.session.user) {
            req.flash('error', '已登录！');
            // 回到之前的页面
            return res.redirect('back');
        }
        next();
    }
};




module.exports = util;