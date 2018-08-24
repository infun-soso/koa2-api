const Koa = require('koa')
const app = new Koa()

const routers = require('koa-router')()
const mongoose = require('./src/mongodb')

const adminApi = require('./src/api/admin')
// const clientApi = require('./api/client')

routers.use('/admin', adminApi.routes(), adminApi.allowedMethods())

app.use(routers.routes()).use(routers.allowedMethods());

app.listen(4000, function() {
	console.log('Koa Sever is listening on the port 4000')
})