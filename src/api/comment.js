const Comment = require('../model/comment')
const User = require('../model/user')
const Article = require('../model/article')
const router = require('koa-router')()

router.post('/add', async (ctx, next) => {
	console.log(ctx.body, ctx.request.body)
	const req = ctx.request.body
	const { user_id, article_id, comment_content } = req
	await User.findById({
		_id: user_id
	})
		.then(async result => {
			if (result) {
				let userInfo = {
					user_id: result._id,
					name: result.name,
					type: result.type,
					avatar: result.avatar
				}
				let comment = new Comment({
					article_id: article_id,
					content: comment_content,
					user_id,
					user: userInfo
				})
				await comment
					.save()
					.then(async commentResult => {
						await Article.findOne({ _id: article_id }, async (errors, data) => {
							if (errors) {
								console.log('Errors: ', errors)
							} else {
								data.comments.push(commentResult._id);
								data.meta.comments += 1
								await Article.updateOne(
									{ _id: article_id },
									{ comments: data.comments, meta: data.meta }
								).then(articleResult => {
									if(articleResult.ok === 1) {
										ctx.response.body = {
											code: 0,
											data: [],
											msg: 'success'
										}
									}
								})
								.catch(err => {
									console.error('err :', err);
									throw err;
								});
							}
						})
					})
			} else {
				ctx.response.body = {
					code: 1,
					data: [],
					msg: '用户不存在'
				}
			}
		})
	// const newLine = new User({
	// 	name: 'wangyanfeng',
	// 	password: '930228',
	// })
	// newLine.save().then(data => {
	// 	removeTemImage(files.file.path)
	// 	if (data) {
	// 		ctx.response.body = {
	// 			"code": 0,
	// 			"data": [],
	// 			"msg": 'success'
	// 		}
	// 		resolve()
	// 	} else {
	// 		ctx.response.body = {
	// 			code: 1,
	// 			data: [],
	// 			msg: 'error'
	// 		}
	// 		reject()
	// 	}
	// })
})

module.exports = router