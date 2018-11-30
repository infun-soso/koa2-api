const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/my_blog", { useNewUrlParser: true });

//如果连接成功会执行error回调
mongoose.connection.on("error", function (error) {
    console.log("数据库连接失败：" + error);
});
//如果连接成功会执行open回调
mongoose.connection.on("open", function () {
    console.log("数据库连接成功");
});

module.exports = mongoose