const crypot = require('crypto');

// 密钥
const SECRET_KEY = 'JINJINJIN_123#';

// md5 加密
function md5(content) {
    let md5 = crypot.createHash('md5');
    return md5.update(content).digest('hex');
}

// 加密函数
function genPassword(password) {
    const str = `password=${password}&key=${SECRET_KEY}`;
    return md5(str);
}

module.exports = {
    genPassword
}
