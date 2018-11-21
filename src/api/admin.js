const router = require('koa-router')()
const Article = require('../model/article.js')
const User = require('../model/user.js')

const multer = require('koa-multer')
const upload = multer()
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
console.log(upload.single('file'))
router.get('/post', async (ctx, next) => {
	let req = ctx.query
	await  Article.find({
		"_id": req.postId
	}).then(result => {
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

router.post('/addarticle', upload.single('files[]'), async (ctx, next) => {
	// multer 将发送数据代理到ctx.req.body 文件 ctx.req.file
	// bodyparser 将发送数据代理到ctx.request.body
	let req = ctx.req.body
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
	// 新建表不会显示 需要插入一条数据 数据类型要一致
	await User.find({
		username: req.username
	}).then(result => {
		if (result.length !== 0) {
			ctx.body = {
				code: 0,
				data: {
					username: req.username,
					password: req.password
				},
				msg: '登录成功'
			}
		} else {
			ctx.response.body = {
				"code": 1,
				"data": [],
				"msg": '用户不存在'
			}
		} 
	}).catch(err => {
		console.log(err)
	})
})
module.exports = router