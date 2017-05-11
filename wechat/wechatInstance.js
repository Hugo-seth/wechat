const config = require('../config/config')
const Wechat = require('./wechatClass')

module.exports = new Wechat(config.wechat)