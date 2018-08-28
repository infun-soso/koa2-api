const router = require('koa-router')()
const Article = require('../model/article.js')

router.get('/index', async (ctx, next) => {
	ctx.response.body = 'this issss admin index'
	await next()
})

router.post('/addarticle', async (ctx, next) => {
	console.log(ctx.request.body)
	ctx.response.body = `<h1>Welcome,!</h1>`
	await next()
})

module.exports = router