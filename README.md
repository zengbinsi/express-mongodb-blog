# express-mongodb-blog
基于express v4.x 和mongoDB的博客Demo



## MongoDB
安装完mongodb后，cd到项目的data/db目录下，修改mongodb.cnf文件的内容，让路径指向该目录，然后终端运行：

```sh
mongod -f mongodb.cnf &
```

启动数据库服务，如果要关闭数据库服务，运行：

```sh
pkill mongod
```


## Express

**【部署项目，不能直接通过node执行app.js，应该执行bin/www文件。】**