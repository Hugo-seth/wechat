'use strict'

var wechat = require('../../wechat/wechatListen')
var config = require('../../config/config')
var handler = require('../../wechat/handlerRequest')

exports.listen = function *(next) {
  
  this.middle = wechat(config.wechat, handler.handlerRequest)

  yield this.middle(next)
}

