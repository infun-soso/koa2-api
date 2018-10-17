const router = require('koa-router')()
const Article = require('../model/article.js')

router.get('/index', async (ctx, next) => {
	let req = ctx.request.body
	await  Article.find().then(result => {
		if (result) {
			ctx.response.body = {
				"code": 0,
				"data": result,
				"msg": 'success'
			}
		} else {
			ctx.response.body = {
				"code": 1,
				"data": [],
				"msg": 'error'
			}
		} 
	}).catch(err => {
		console.log(err)
	})
})

router.post('/addarticle', async (ctx, next) => {
	let req = ctx.request.body
	const newLine = new Article({
		title: req.articleTitle,
		keyword: req.keywords,
		descript: req.description,
		content: req.content
	})

	await newLine.save().then(res => {
		if (res) {
			ctx.response.body = {
				"code": 0,
				"data": [],
				"msg": 'success'
			}
		} else {
			ctx.body = {
				code: 1,
				data: [],
				msg: 'error'
			}
		}
	}).catch(err => {
		console.log(err)
	}) 
})

router.post('/login', async (ctx, next) => {
	let req = ctx.request.body
	ctx.body = {
		code: 0,
		data: {
			username: req.username,
			password: req.password
		},
		msg: 'success'
	}
})
module.exports = router