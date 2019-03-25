const router = require('koa-router')()
const Article = require('../model/article.js')
const Comment = require('../model/comment.js')
const User = require('../model/user.js')
const qiniu = require('qiniu')
const config = require('../utils/qiniu')
const path = require('path')
const md5 = require('md5')
const fs = require('fs')


const formidable = require('formidable')
// const multer = require('koa-multer')
// const upload = multer()

const domain = 'http://pic.wyfs.top/'
var accessKey = '8Z3BdkVh2RyRuzsqVhAKK7Njo_6oUzlpSUt2M9Hf'
var secretKey = 'HNCkhVc169GbiZ_Fp-F-4YYjx5Pdb4bXDx-hws-v'
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

var options = {
  scope: 'blog',
}
var putPolicy = new qiniu.rs.PutPolicy(options)
var uploadToken = putPolicy.uploadToken(mac)

router.get('/index', async (ctx, next) => {
	let req = ctx.request.body
	await Article.find().then(result => {
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

router.get('/post', async (ctx, next) => {
	const id = ctx.query.postId
	await Article.findOne({ "_id": id })
	        .then(async data => {
						let fields = {};
						const CommnetResult = await Comment.find({ _id: { $in: data.comments } })
						data.comments = CommnetResult
						data.meta.views = data.meta.views + 1;
						fields.meta = data.meta;
						await Article.updateOne({ _id: id }, fields)
							.then(result => {
								if (result) {
									ctx.response.body = {
										"code": 0,
										"data": data,
										"msg": 'success'
									}
								} else {
									ctx.response.body = {
										"code": 1,
										"data": [],
										"msg": 'error'
									}
								} 
							})
							.catch(err => {
								console.error('err :', err);
								throw err;
							});
					}).catch(err => {
						console.log(err)
					})
})

const removeTemImage = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err
    }
  })
}
const dealReq = (ctx) => {
	return new Promise(function(resolve, reject) {
		var form = new formidable.IncomingForm()
		form.multiples = true //设置允许多张上传 files就会是一个图片数组 否则会覆盖只有一张
		var targetFile = path.join(__dirname, '../uploads')
		form.uploadDir = targetFile
		
		form.parse(ctx.req, (err, fields, files) =>{
			if(err) throw err
			// 一张 files 为对象， 多张 为数组
			if (!files) return
			let info = files.file.name.split('.')
			let nameText = info[0] + Date.now()
			const key = `blog/${md5(nameText)}.${info[info.length - 1]}`
			const formUploader = new qiniu.form_up.FormUploader(config)
			const putExtra = new qiniu.form_up.PutExtra()
			formUploader.putFile(uploadToken, key, files.file.path, putExtra, (respErr, respBody, respInfo) => {
				if (respErr) throw respErr
				const tag = fields.tags.split(',')
				if (respInfo.statusCode == 200) {
					const newLine = new Article({
						title: fields.articleTitle,
						keyword: fields.keywords,
						descript: fields.description,
						content: fields.content,
						images: domain + respBody.key,
						markdown: fields.markdown,
						tag: tag
					})
					newLine.save().then(data => {
						removeTemImage(files.file.path)
						if (data) {
							ctx.response.body = {
								"code": 0,
								"data": [],
								"msg": 'success'
							}
							resolve()
						} else {
							ctx.response.body = {
								code: 1,
								data: [],
								msg: 'error'
							}
							reject()
						}
					})
				} else {
					console.log(respInfo.statusCode)
					console.log(respBody)
				}
			})
		})
	})
}

router.post('/addArticle',async (ctx, next) => {
	// multer 将发送数据代理到ctx.req.body 文件 ctx.req.file
	// bodyparser 将发送数据代理到ctx.request.body
	try {
		await dealReq(ctx)
	} catch (error) {
		console.log(error)
	}
})

router.post('/updateArticle',async (ctx, next) => {
	console.log(ctx.request.body)
	const req = ctx.request.body
	await Article.update({'_id': req.postId}, {
		content: req.content,
		markdown: req.markdown,
		descript: req.description,
		keyword: req.keywords,
		title: req.articleTitle,
		tag: req.tags
	}).then(res => {
		if (res) {
			ctx.response.body = {
				"code": 0,
				"data": [],
				"msg": 'success'
			}
		} else {
			ctx.response.body = {
				"code": 1,
				"data": [],
				"msg": 'error'
			}
		} 
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