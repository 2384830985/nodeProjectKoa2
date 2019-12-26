const {ErrorModel} = require('../model/resModel');

module.exports = async (context,next)=>{
    if (context.session.username) {
        await next()
        return
    }
    context.body = new ErrorModel('用户暂未登录')
}
