const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')

//413 payload too large 请求体过大
app.use(bodyParser({
	formLimit:"3mb",
	jsonLimit:"3mb",
	textLimit:"3mb",
	enableTypes: ['json', 'form', 'text']
}))
// 配置session
app.keys = ['infunsoso'];

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));

const routers = require('koa-router')()
const mongoose = require('./src/mongodb')

const postApi = require('./src/api/post')
const commentApi = require('./src/api/comment')
const userApi = require('./src/api/user')
// const clientApi = require('./api/client')
routers.use('/admin', postApi.routes(), postApi.allowedMethods())
routers.use('/comment', commentApi.routes(), commentApi.allowedMethods())
routers.use('/user', userApi.routes(), userApi.allowedMethods())
app.use(routers.routes()).use(routers.allowedMethods())

app.listen(4000, function() {
	console.log('Koa Sever is listening on the port 4000')
})