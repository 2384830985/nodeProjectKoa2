const router = require('koa-router')();
const {login} = require('./../controller/user')
const {SuccessModel,ErrorModel} = require('./../model/resModel')

router.prefix('/ajax')

router.post('/login',async (context,next)=>{
    const {username,password} = context.request.body;
    const userData = await login(username,password);
    if (userData.user_name) {
        context.session.username = userData.user_name;
        context.session.realname = userData.realname;
        context.body = new SuccessModel(userData)
    }else {
        context.body = new ErrorModel("登录失败")
    }
})

module.exports = router
