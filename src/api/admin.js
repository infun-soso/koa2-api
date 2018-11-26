const router = require('koa-router')()
const Article = require('../model/article.js')
const User = require('../model/user.js')
const qiniu = require('qiniu')
const config = require('../utils/qiniu')

const multer = require('koa-multer')
const upload = multer()

var accessKey = '8Z3BdkVh2RyRuzsqVhAKK7Njo_6oUzlpSUt2M9Hf';
var secretKey = 'HNCkhVc169GbiZ_Fp-F-4YYjx5Pdb4bXDx-hws-v';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

var options = {
  scope: 'blog',
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

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
	console.log(ctx.req.file)

	var formUploader = new qiniu.form_up.FormUploader(config);
	var putExtra = new qiniu.form_up.PutExtra();
	var readableStream = ctx.req.file; // 可读的流
	var key='pic.jpeg';
	formUploader.putFile(uploadToken, key, readableStream, putExtra, function(respErr,
		respBody, respInfo) {
		if (respErr) {
			throw respErr;
		}
		if (respInfo.statusCode == 200) {
			console.log(respBody);
		} else {
			console.log(respInfo.statusCode);
			console.log(respBody);
		}
	});

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