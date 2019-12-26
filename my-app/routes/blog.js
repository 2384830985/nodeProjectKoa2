const router = require('koa-router')()
const {SuccessModel,ErrorModel} = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')
const {
    getList,
    getDetail,
    saveBlog,
    updateBlog,
    deleteBlog
} = require('./../controller/blog')
router.prefix('/api')

router.get('/list',async function (context,next) {
    const {author:author="",keyword:keyword=""} = context.query;
    const listData = await getList(author,keyword)
    context.body = new SuccessModel(listData)
})

router.get('/detail',async function (context,next) {
    const {id} = context.query;
    const data = await getDetail(id);
    context.body = new SuccessModel(data)
})

router.post('/save',loginCheck,async function (context,next) {
    context.request.body.author = context.session.username;
    const data = await saveBlog(context.request.body);
    context.body = new SuccessModel(data)
})

router.post('/update',loginCheck,async function (context,next) {
    const updateShow = await updateBlog(context.query.id,context.request.body)
    context.body = updateShow?new SuccessModel():new ErrorModel("更新博客失败")
})

router.post('/delete',loginCheck,async function (context,next) {
    const {username} = context.session.username;
    const deleteShow = await deleteBlog(context.query.id,username);
    context.body = deleteShow?new SuccessModel("删除博客成功"):new ErrorModel("删除博客失败")
})

module.exports = router;
