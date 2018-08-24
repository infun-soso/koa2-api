const router = require('koa-router')()
const Article = require('../model/article.js')

router.get('/index', async (ctx, next) => {
	ctx.response.body = 'this issss admin index'
	await next()
})

module.exports = router