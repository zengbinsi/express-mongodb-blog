var FileStreamRotator = require('file-stream-rotator');
var logger = require('morgan');
var fs = require('fs');
var path = require('path');

function BlogLogger (app) {
    // 自定义日志token
    logger.token('from', function (req, res) {
        return req.query.from || '-';
    });
    // 自定义日志格式
    logger.format('blog-log', '[blog-log] :method :url :status :from');
    // 日志目录
    var logDir = path.join(__dirname, '/../logs');
    // 如果文件夹不存在就创建
    fs.existsSync(logDir) || fs.mkdirSync(logDir);

    // 创建一个日志流
    var accessLogStream = FileStreamRotator.getStream({
        date_format: 'YYYYMMDD',
        filename: path.join(logDir, 'access-%DATE%.log'),
        frequency: 'daily',
        verbose: false
    });

    // 启用日志
    app.use(logger('blog-log', {stream: accessLogStream}));

    // 错误日志中间件
    // app.use(function (err, req, res, next) {
    //     var meta = '[' + new Date() + ']' + req.url + '\n';
    //     accessLogStream.write(meta + err.stack + '\n');
    //     next();
    // });
}


module.exports = BlogLogger;