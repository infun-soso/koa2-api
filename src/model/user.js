const db = require('../mongodb')

const UserSchema = new db.Schema({
    // 用户名
    username: { type: String, required: true },

    // 密码
    password: { type: String, required: true },

})

// 表名
const User = db.model('accounts', UserSchema) 
module.exports = User