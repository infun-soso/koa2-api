const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const errorHandle = require('./src/middleware/jwtError')
const jwt = require('koa-jwt')

app.use(errorHandle)

const secret = 'infun'
app.use(jwt({
  secret,
}).unless({
  // path: [/\/user\/login/, /\/login\/register/],
  path: [/\//]
}))

//413 payload too large 请求体过大
app.use(bodyParser({
	formLimit:"3mb",
	jsonLimit:"3mb",
	textLimit:"3mb",
	enableTypes: ['json', 'form', 'text']
}))

const routers = require('koa-router')()
const mongoose = require('./src/mongodb')

const postApi = require('./src/api/post')
const commentApi = require('./src/api/comment')
const userApi = require('./src/api/user')
const adminApi = require('./src/api/admin/user')
// const clientApi = require('./api/client')
routers.use('/post', postApi.routes(), postApi.allowedMethods())
routers.use('/comment', commentApi.routes(), commentApi.allowedMethods())
routers.use('/user', userApi.routes(), userApi.allowedMethods())
routers.use('/admin', adminApi.routes(), adminApi.allowedMethods())
app.use(routers.routes()).use(routers.allowedMethods())

app.listen(4000, function() {
	console.log('Koa Sever is listening on the port 4000')
})