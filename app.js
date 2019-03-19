const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')

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
// const clientApi = require('./api/client')
routers.use('/admin', postApi.routes(), postApi.allowedMethods())
app.use(routers.routes()).use(routers.allowedMethods())

app.listen(4000, function() {
	console.log('Koa Sever is listening on the port 4000')
})