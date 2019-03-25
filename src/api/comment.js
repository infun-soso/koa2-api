const Comment = require('../model/comment')
const User = require('../model/user')
const Article = require('../model/article')
const router = require('koa-router')()

router.get('/all_comments', async (ctx, next) => {
	const req = ctx.request.body
	console.log(req)
	let keyword = req.keyword || null;
  // let is_handle = parseInt(req.query.is_handle) || 0;
  // console.log('is_handle ', is_handle);
  let pageNum = parseInt(req.pageNum) || 1;
  let pageSize = parseInt(req.pageSize) || 10;
	let conditions = {};
	
	let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
  let responseData = {
    count: 0,
    list: [],
	};
	
	const CommnetCounts = await Comment.countDocuments({});
	responseData.count = CommnetCounts;
	// 待返回的字段
	let fields = {
		article_id: 1,
		content: 1,
		is_top: 1,
		likes: 1,
		user_id: 1,
		user: 1,
		other_comments: 1,
		state: 1,
		is_handle: 1,
		create_time: 1,
		// update_time: 1,
	};
	let options = {
		skip: skip,
		limit: pageSize,
		sort: { create_time: -1 },
	};
	await Comment.find(conditions, fields, options, (err, result ) => {
		responseData.list = result
		ctx.response.body = {
			code: 0,
			data: responseData,
			msg: 'success'
		}
	});
})

router.post('/add', async (ctx, next) => {
	const req = ctx.request.body
	const { user_id, article_id, comment_content } = req
	const UserResult = await User.findById({
		_id: user_id
	})
	if(UserResult) {
		let userInfo = {
			user_id: UserResult._id,
			name: UserResult.name,
			type: UserResult.type,
			avatar: UserResult.avatar
		}
		let comment = new Comment({
			article_id: article_id,
			content: comment_content,
			user_id,
			user: userInfo
		})
		const CommentResult = await comment
			.save()
		const ArticleResult = await Article.findOne({ _id: article_id })
		ArticleResult.comments.push(CommentResult._id);
		ArticleResult.meta.comments += 1
		const UpdateResult = await Article.updateOne(
			{ _id: article_id },
			{ comments: ArticleResult.comments, meta: ArticleResult.meta }
		)
		if(UpdateResult.ok === 1) {
			ctx.response.body = {
				code: 0,
				data: [],
				msg: 'success'
			}
		} else {
			ctx.response.body = {
				code: 1,
				data: [],
				msg: 'error'
			}
		}
	} else {
		ctx.response.body = {
			code: 1,
			data: [],
			msg: '此用户不存在'
		}
	}
})

router.post('/add_other', async (ctx, next) => {
	const req = ctx.request.body
	let { article_id, comment_id, user_id, comment_content, to_user } = req;
	const CommentResult = await Comment.findById({
		_id: comment_id
	})
	const UserResult = await User.findById({
		_id: user_id
	})
	if(UserResult) {
		let otherUserInfo = {
			user_id: UserResult._id,
			name: UserResult.name,
			type: UserResult.type,
			avatar: UserResult.avatar
		}
		let item = {
			user: otherUserInfo,
			content: comment_content,
			to_user: JSON.parse(to_user),
		};
		CommentResult.other_comments.push(item)
		const CommentUpdateResult = await Comment.updateOne({
			_id: comment_id,
		}, {
			other_comments: CommentResult.other_comments
		})
		const ArticleResult = await Article.findOne({
			_id: article_id
		})
		ArticleResult.meta.comments += 1
		const ArticleUpdateResult = await Article.updateOne({
			_id: article_id
		}, {
			meta: ArticleResult.meta
		})
		if(ArticleUpdateResult.ok === 1) {
			ctx.response.body = {
				code: 0,
				data: [],
				msg: 'success'
			}
		} else {
			ctx.response.body = {
				code: 1,
				data: [],
				msg: 'error'
			}
		}
	}
})

module.exports = router