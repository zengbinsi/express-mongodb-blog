var mongodb = require('./db');
var crypto = require('crypto');

function User (user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

/**
 * 存储用户信息
 * @param {function} cb 回调函数
 */
User.prototype.save = function (cb) {
    var md5 = crypto.createHash('md5'),
        emailMD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = 'http://www.gravatar.com/avatar/' + emailMD5 + '?s=48';

    // 要存入数据库的用户文档
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };
    // open database
    mongodb.open(function (err, db) {
        if (err) {
            // 返回错误信息
            return cb(err);
        }
        // read users
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }
            // insert user to users
            collection.insert(user, {safe: true}, function (err, user) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }
                // successed! err is null, and return saved user.
                cb(null, user[0]);
            });
        });
    });
};

/**
 * 读取用户信息
 * @param {string} name 用户名
 * @param {function} cb 回调函数
 */
User.get = function (name, cb) {
    mongodb.open(function (err, db) {
        if (err) {
            return cb(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }
            collection.findOne({name: name}, function (err, user) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }
                cb(null, user);
            });
        });
    });
};