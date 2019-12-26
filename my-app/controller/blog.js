const {exec} = require('../db/mysql')
const getList = async (author,keyword)=>{
    // 先返回假数据（格式正确）
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

const getDetail = async (id)=>{
    let sql = `select * from blog where id = ${id}`;
    const rows = await exec(sql);
    return rows[0]
}

const saveBlog = async (blogData)=>{
    let sql = `insert into blog(title,content,createtime,author) VALUES(
        '${blogData.title}',
        '${blogData.content}',
        '${new Date().getTime()}',
        '${blogData.author}');`;
    const insertData = await exec(sql);
    return {
        id: insertData.insertId
    }
}

const updateBlog = async (id,blogData)=>{
    let sql = `update blog set title='${blogData.title}',content='${blogData.content}' where id='${id}';`;
    const updateData = await exec(sql)
    return updateData.affectedRows > 0
}

const deleteBlog = async (id,author)=>{
    let sql = `delete from blog where id='${id}' and author='${author}'`;
    const deleteData = await exec(sql)
    return deleteData.affectedRows > 0
}

module.exports = {
    getList,
    getDetail,
    saveBlog,
    updateBlog,
    deleteBlog,
}
