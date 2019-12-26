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
