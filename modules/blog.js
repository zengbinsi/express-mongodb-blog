var mongodb = require('./db');
var markdown = require('markdown');

function Blog (name, head, title, tags, blog) {
    this.name = name;
    this.head = head;
    this.title = title;
    this.tags = tags;
    this.blog = blog;
}

module.exports = Blog;

/**
 * 存储用户信息
 * @param {function} cb 回调函数
 */
Blog.prototype.save = function (cb) {
    var date = new Date();
    var year = date.getFullYear();
    var month = year + '-' + (date.getMonth() + 1);
    var day = month + '-' + date.getDate();
    var minute = day + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' +  date.getMinutes() :  date.getMinutes());

    var time = {
        date: date,
        year: year,
        month: month,
        day: day,
        minute: minute,
    };

    var blog = {
        name: this.name,
        head: this.head,
        time: time,
        title: this.title,
        tags: this.tags,
        blog: this.blog,
        comments: [],
        pv: 0
    };

    mongodb.open(function (err, db) {
        if (err) {
            return cb(err);
        }

        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            // save blog to blogs
            collection.insert(blog, {safe: true}, function (err) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }
                cb(null);
            });
        });
    });
};

/**
 * 读取用户信息
 * @param {string} name 用户名
 * @param {function} cb 回调函数
 */
Blog.getAll = function (name, cb) {
    mongodb.open(function (err, db) {
        if (err) {
            return cb(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            // find blog by query
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }

                // convert markdown to html
                docs.forEach(function(doc) {
                    doc.blog = markdown.parse(doc.blog);
                });

                cb(null, docs);
            });
        });
    });
};


Blog.getOne = function (name, day, title, cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}

        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            collection.findOne({
                'name': name, 
                'time.day': day,
                'title': title
            }, function (err, row) {
                if (err) {return cb(err);}

                // 每次访问，pv加1
                if (row) {
                    collection.update({"name": name, "time.day": day, "title": title}, {$inc: {'pv': 1}}, function (err) {
                        mongodb.close();
                        if (err) {return cb(err);}
                    });

                    row.blog = markdown.parse(row.blog);
                    // 留言也支持markdown
                    row.comments.forEach(function (comment) {
                        comment.content = markdown.parse(comment.content);
                    });
                    cb(null, row);
                }

                // ...
            });
        });
    });
};


Blog.edit = function (name, day, title, cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}

        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, row) {
                mongodb.close();
                if (err) {return cb(err);}
                // 返回原始内容
                cb(null, row);
            });
        });
    });
};


Blog.update = function (name, day, title, blog, cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}

        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {$set: {blog: blog}}, function (err) {
                mongodb.close();
                if (err) {return cb(err);}
                cb(null);
            });
        });
    });
};


Blog.remove = function (name, day, title, cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}

        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            collection.remove({
                "name": name,
                "time.day": day,
                "title": title
            }, {w:1}, function (err) {
                mongodb.close();
                if (err) {return cb(err);}
                cb(null);
            });
        });
    });
};

// 获取存档
Blog.getAchive = function (cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            collection.find({}, {"name": 1, "time": 1, "title": 1}).sort({time: -1}).toArray(function (err, rows) {
                mongodb.close();
                if (err) {return cb(err);}

                cb(null, rows);
            });
        });
    });
};

// 获取所有标签
Blog.getTags = function (cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}

        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            collection.distinct('tags', function (err, docs) {
                mongodb.close();
                if (err) {return cb(err);}
                cb(null, docs);
            });
        });
    });
};

// 获取特定标签的所有文章
Blog.getBlogsByTag = function (tag, cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            collection.find({"tags": tag}, {"name": 1, "time": 1, "title": 1}).sort({time: -1}).toArray(function (err, rows) {
                mongodb.close();
                if (err) {return cb(err);}

                cb(null, rows);
            });
        });
    });
};


// 搜索
Blog.search = function (keyword, cb) {
    mongodb.open(function (err, db) {
        if (err) {return cb(err);}

        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }

            var pattern = new RegExp('^.' + keyword + '.*$', 'i');

            collection.find({'title': pattern}, {'name': 1, 'time':1, 'title': 1}).sort({time: -1}).toArray(function (err, docs) {
                mongodb.close();
                if (err) {return cb(err);}
                cb(null, docs);
            });
        });
    });
};

