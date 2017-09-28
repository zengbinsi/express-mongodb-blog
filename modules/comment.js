var mongodb = require('./db');

function Comment (name, day, title, comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function (cb) {
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;

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
            }, {$push: {"comments": comment}}, function (err) {
                mongodb.close();
                if (err) {return cb(err);}

                cb(null);
            });
        });
    });

};