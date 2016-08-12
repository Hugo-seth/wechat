'use strict'

var config = require('../config/config')
var Wechat = require('./wechat')
var wechatAPI = new Wechat(config.wechat)

exports.handlerRequest = function* (next) {

  var wechat

  var request = this.request
  console.log(request)

  this.myResponse.responseType = 'text'

  if (request.MsgType === 'event') {
    if (request.Event === 'subscribe') {
      this.myResponse.content = '哈哈，来了'
    }
  } else if (request.MsgType === 'text') {
    this.myResponse.content = '哈哈： ' + request.Content
  } else {
    
    this.myResponse.responseType = 'image'

    var media = yield wechatAPI.uploadMedia('image', 'images/1.png')
    this.myResponse.content = media.media_id
  }

  yield next
}