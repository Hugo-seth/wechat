var wechat = require('../../wechat/wechatListen')
var config = require('../../config/config')
var handler = require('../../wechat/handlerRequest')

module.exports = async function(ctx, next) {

  this.middle = wechat(config.wechat, handler.handlerRequest)

  await this.middle(next)
}