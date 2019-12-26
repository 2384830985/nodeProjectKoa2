# nodeProjectKoa2
node
## 前言
1.koa2 安装 node mysql 和 redis 安装方面就不介绍了，建议百度 主要讲 安装以及里面一些项目的文件呀，然后可以让小伙伴们基本了解koa2开发后台，希望大家可以学到后台开发到思想。建议观看前可以去`github`上先下载源码然后进行食用，效果更加（（QQ群技术讨论）838293023备注（github进来的 

$\color{red}{下期准备小程序云开发的一些个人见解各位对云开发有什么疑问对可以探讨一下}$

> 游泳健身了解一下：[`github`](https://github.com/2384830985) [`技术文档`](https://2384830985.github.io/zhantiefuzhi/public/) 技术文档会持续更新 [`本期项目地址`](https://github.com/2384830985/nodeProjectKoa2)

 ##  内容总结
 
 1.   客户端请求 -> nginx(反向代理) (mysql和redis的conf的配置在最下方)
 2.   -> router(我们的接口)
 3.   -> middleware(中间件，我们操作前的一些逻辑可以添加可以不添加)
 4.   -> cookie(前后端交互) -> session(后台的变量，重启服务后会清空)
      -> redis(内存的一个服务来解决session的问题 并可以解决多进程的时候每个进程可以进行数据交互的任务)
 5.   -> controller(我们写sql 以及一些业务逻辑的地方，主要是处理sql（router的时候也会处理我们的业务逻辑） 
 6.   -> model(暂时我们就写了一个responseModel 主要是用来我们返回前端数据的中间件)


![项目介绍](https://user-gold-cdn.xitu.io/2019/12/26/16f40e305ce8f0cc?w=297&h=420&f=png&s=19575)

##  操作前准备

// 安装 koa 保证node 版本 8以上

`npm install -g koa`

// 安装脚手架

`npm install -g koa-generator`

// project 项目名称

`koa2  project `

`cd project `
// 安装依赖

`npm install`

// 安装当前 环境变量

`npm install cross-env -D `

// 安装mysql 和 redis session (nodemon 内置了所以不需要安装)

`npm install koa-generic-session mysql redis --save`

// 修改package.json dev NODE_ENV=dev

  `"dev": "cross-env NODE_ENV=dev ./node_modules/.bin/nodemon bin/www",`
  
  
## 1.路由 router
koa的路由不是内置在里面的 我们需要添加 `koa-router` 插件 没有可以下载一下`npm i koa-router --save` 
我们先引入 `koa-router` 然后直接执行 我们主要介绍 `get` 和 `post` 回调值,这有一个`async`这个是es7的解决异步的方法（重点） `ctx`就是把我们的`request`和`response` 合起来 并加了自己的一些方法，`next`执行后就会继续执行 ，这边我们看到有一个ctx.body = xxx
的方式这个是回调我们前端数据方式 和 `express`的`res.json()` 是一样的。

![](https://user-gold-cdn.xitu.io/2019/12/26/16f4104c561b7d1f?w=706&h=447&f=png&s=75500)
1.`app.js` 里面 `koa-json` 和 `koa-bodyparser` 这个是我们用来接受前端数据然后进行处理的一个依赖

![](https://user-gold-cdn.xitu.io/2019/12/26/16f40fc65e2a9c12?w=864&h=459&f=png&s=72927)
2.注册好（`app.use()`）我们的依赖后我们就可以在我们的router 里面获取到前端传的数据了

```
// get 获取
const {author:author="",keyword:keyword=""} = context.query;
```
```
// post 获取
const {author:author="",keyword:keyword=""} = context.request.body;
```
获取到数据我们就可以进行下一步了

## 2.middleware 我的中间件厉害的小伙伴可以跳着看
这里我们添加了一个对用户没有登录的一个拦截 `loginCheck.js`

```
const {ErrorModel} = require('../model/resModel');

module.exports = async (context,next)=>{
    if (context.session.username) {
        await next()
        return
    }
    context.body = new ErrorModel('用户暂未登录')
}

```
使用方式
![](https://user-gold-cdn.xitu.io/2019/12/26/16f41072fa8fbbc4?w=650&h=431&f=png&s=75408)

## 4. cookie session 和 redis
```
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const {REDIS_CONF} = require('./conf/db')
// session 配置 要进行一个防止 csrf 的攻击
// 进行一个加密 “私密” 我们的cookie 或者 session 如果被别人拿到就会有风险 所以进行一个加密
// 相对于密码我们也会进行一个加密 就算是库被别人扒了别人也不会知道密码是什么
app.keys = ['Jin_jin#!'] 
app.use(session({
//    配置cookie
    cookie: {
        path: '/', // 路由都可以操作 默认是调用都哪个路由
        httpOnly: true, // 只有服务器可以操作
        maxAge: 24*60*60*1000 // 时间
    },
    store: redisStore({ // 进行一个 redis 的获取和赋值
        all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
    })
}))
```
配置好之后我们就可以直接使用 `context.session` 来获取和设置 `session` 和 `redis`
![](https://user-gold-cdn.xitu.io/2019/12/26/16f41107ce35218f?w=689&h=361&f=png&s=55295)

## 5.controller 我们写 sql 的地方
下面代码 escape 和 where 1=1 都是非常实用的小技巧 escape是为了别人通过输入的数据进行对数据库的一个特殊的操作的进行防御的功能 
比如别人输入userName = ' --  然后对数据库进行一些操作 所以我们在写这些sql 的时候都要考虑更多一点
```
## blog controller
const {exec} = require('../db/mysql')
const getList = async (author,keyword)=>{
    // 先返回假数据（格式正确） where 1=1 是一个小技巧
    let sql = `select * from blog where 1=1`;
    if (author) {
        sql += ` and author='${author}'`
    }
    if (keyword) {
        sql += ` and title like '%${keyword}%'`
    }
    sql += ` order by createtime desc`;

    // 返回一个promise
    return await exec(sql)
}
```
```
## user controller
const {exec,escape} = require('../db/mysql')
const {genPassword} = require('../utils/cryp')
const login = async (userName,password)=>{
    userName = escape(userName);
    password = genPassword(password)
    password = escape(password);
    let sql = `select user_name,realname from users where user_name=${userName} and password=${password}`;
    const userData = await exec(sql);
    return userData[0]||{}
}

module.exports = {
    login
}

```
使用


![](https://user-gold-cdn.xitu.io/2019/12/26/16f411e09ff0978e?w=723&h=381&f=png&s=52949)

## 6.model
我们对返回前端时候对数据进行一次处理 返回前端的就是一个实例，
```
class BaseModel {
    constructor(data,message){
        if(typeof data === 'string'){
            this.message = data;
            data         = null;
            message      = null;
        }
        if(data){
            this.data = data;
        }
        if(message){
            this.message = message;
        }
    }
}

class SuccessModel extends BaseModel{
    constructor(data,message){
        super(data,message);
        this.errno = 0
    }
}

class ErrorModel extends BaseModel{
    constructor(data,message){
        super(data,message);
        this.errno = -1
    }
}

module.exports = {
    SuccessModel,
    ErrorModel
}
```

// 添加conf 文件夹 里面添加 db.js 管理当前 当前mysql 的配置 以及 redis 的配置
## mysql redis conf

```
const env = process.env.NODE_ENV;
let MYSQL_CONF;
let REDIS_CONF;

if (env === 'dev') {
    MYSQL_CONF = {
        host: 'xx.xx.xx.xx',
        user: 'xx',
        password: 'xx',
        port: '3306',
        database: 'newTable'
    }
    REDIS_CONF = {
        host: '127.0.0.1',
        port: '6379'
    }
}

if (env === 'production') {
    MYSQL_CONF = {
        host: 'xx.xx.xx.xx',
        user: 'xx',
        password: 'xx',
        port: '3306',
        database: 'newTable'
    }
    REDIS_CONF = {
        host: '127.0.0.1',
        port: '6379'
    } 
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF
}

```

// 添加db文件夹，我们添加一个mysql模块的一个文件，来管理我们的连接数据库
## mysql 模块
```
const mysql = require('mysql');
const {MYSQL_CONF} = require('../conf/db');

// 创建 链接对象
const con = mysql.createConnection({
    ...MYSQL_CONF
});

// 开始链接
con.connect();

// 添加执行 sql 函数
function exec(sql) {
    return new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=>{
            if (err) {
                reject(err);
                return
            }
            resolve(result)
        })
    })
}

module.exports = {
    exec,
    escape: mysql.escape
}

```

## 最后
能看到最后🙏谢谢大家了，多多点赞在github 上面对❤️是对我最好对鼓励，我会尽量分享一些自己使用得心得以及正确对食用方式


 可能现在小伙伴还是不懂。。俗话说;师傅领进门,修行在个人。代码上的备注写的也够多了。还是不懂的可以加群问问小伙伴们，
 
 求靠谱内推（北京地区）可以留言我 +。=
