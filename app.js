

var express = require('express');
var path = require('path');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var BlogLogger = require('./modules/blog-logger');


var routes = require('./routes/index');
var users = require('./routes/user');
var login = require('./routes/login');
var reg = require('./routes/reg');
var logout = require('./routes/logout');
var release = require('./routes/release');
var upload = require('./routes/upload');
var tags = require('./routes/tags');
var archive = require('./routes/archive');
var search = require('./routes/search');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
// app.use(logger('dev'));
var blogLogger = new BlogLogger(app);

app.use(bodyParser({keepExtensions: true, uploadDir: './public/images'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: settings.cookieSecret,
    // session cookie名称
    key: settings.db,
    // 有效期
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},
    store: new MongoStore({
        // db: settings.db
        url: 'mongodb://' + settings.host + '/' + settings.db
    })
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/u', users);
app.use('/login', login);
app.use('/reg', reg);
app.use('/logout', logout);
app.use('/release', release);
app.use('/upload', upload);
app.use('/tags', tags);
app.use('/archive', archive);
app.use('/search', search);

/// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

app.use(function(req, res) {
    res.render('404');
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
