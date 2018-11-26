const qiniu = require('qiniu')
const config = new qiniu.conf.Config()

config.zone = qiniu.zone.Zone_z1

module.exports = config