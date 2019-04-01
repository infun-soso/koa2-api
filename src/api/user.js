const User = require('../model/user')
const router = require('koa-router')()
const crypto = require('crypto')
const jsonwebtoken = require('jsonwebtoken')

const md5 = (pwd) => {
  let md5 = crypto.createHash('md5');
  return md5.update(pwd).digest('hex');
}

const responseClient = (ctx, status, code, msg, response) => {
  ctx.response.status = status
  ctx.response.body = {
    code,
    data: response || [],
    msg
  }
}

const MD5_SUFFIX = "wangyanfengzhenshuai"

router.post('/register', async (ctx, next) => {
  const { name, email, password } = ctx.request.body
  if (!name) {
    responseClient(ctx, 400, 2, '用户名不可为空');
    return;
  }
  if (!password) {
    responseClient(ctx, 400, 2, '密码不可为空');
    return;
  }
  if (!email) {
    responseClient(ctx, 400, 2, '用户邮箱不可为空');
    return;
  }
  const reg = new RegExp(
    '^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$',
  ); //正则表达式
  if (!reg.test(email)) {
    responseClient(ctx, 400, 2, '请输入格式正确的邮箱！');
    return;
  }

  await 
    User.findOne({email: email})
      .then(async data => {
        if(data) {
          responseClient(ctx, 200, 2, '用户邮箱已存在！');
          return 
        } 
        //保存到数据库
        let user = new User({
          email,
          name,
          password: md5(password + MD5_SUFFIX)
          // phone,
          // type,
          // introduce,
        });
        await user.save().then(result => {
          if(result) {
            ctx.response.body = {
              code: 0,
              data: [],
              msg: 'success'
            }
          } else {
            ctx.response.body = {
              code: 1,
              data: [],
              msg: 'database error'
            }
          }
        })
      }).catch(err => {
        console.log('Error: ' + err)
      })
})

router.post('/login', async ctx => {
  const { email, password } = ctx.request.body
  if (!email) {
    responseClient(ctx, 400, 2, '用户邮箱不可为空');
    return;
  }
  if (!password) {
    responseClient(ctx, 400, 2, '密码不可为空');
    return;
  }
  await User.findOne({
    email: email,
    password: md5(password + MD5_SUFFIX),
  }).then(result => {
    if (result) {
      // session 实质是将加密的session存入cookie nuxt不同req无法共享session（可以用redis解决 store）
      // 正常请求改为token nuxt server端使用session
      const jwtData = {
        name: result.name,
        email: result.emial
      }
      const token = jsonwebtoken.sign({
        data: jwtData,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
      }, 'infun')
      const  fields = {
        token,
        userInfo: result
      }
      responseClient(ctx, 200, 0, '登录成功', fields);
    } else {
      responseClient(ctx, 400, 2, '用户名或者密码错误');
    }
  })
})

module.exports = router