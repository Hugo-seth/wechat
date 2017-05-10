const config = require('../config/config')
const Wechat = require('./wechatClass')

exports.getWechatInstance = function() {
  return new Wechat(config.wechat)
}