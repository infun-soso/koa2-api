const db = require('../mongodb')

const articleSchema = new db.Schema({
    // 文章标题
    title: { type: String, required: true },

    // 关键字
    keyword: { type: String, required: true },

    // 图片
    images: { type: String, required: false },

    // 描述
    descript: { type: String, required: false },

    // 标签
    tag: [],

    // 内容
    content: { type: String, required: true },
    
    markdown: { type: String, required: true },

    // 状态 1 发布 2 草稿
    state: { type: Number, default: 1 },

    // 文章公开状态 1 公开 2 私密
    publish: { type: Number, default: 1 },

    // 缩略图
    thumb: String,

    // 文章分类 1 code 2 think 3 民谣
    type: { type: Number },

    // 发布日期
    create_at: { type: Date, default: Date.now },

    // 最后修改日期
    update_at: { type: Date, default: Date.now },

    // 其他元信息
    meta: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 }
    }
})

const Article = db.model('Article', articleSchema)

module.exports = Article