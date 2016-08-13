'use strict'

var config = require('../config/config')
var Wechat = require('./wechat')
var wechatAPI = new Wechat(config.wechat)

//wechatAPI.updateAccessToken()

exports.handlerRequest = function*(next) {

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

    if (request.Content === '1') {
      this.myResponse.responseType = 'image'

      var media = yield wechatAPI.uploadMedia('image', 'images/config.png')
      this.myResponse.content = media.media_id

    } else if (request.Content === '2') {
      this.myResponse.responseType = 'video'

      this.response.content = {
        title: '回复视频',
        description: '看我回复的是什么'
      }
      var media = yield wechatAPI.uploadMedia('image', 'images/2.mp4')
      this.myResponse.content.media_id = media.media_id
    }

  } else {

    this.myResponse.content = 'sorry, 不知道你在说什么'
  }

  yield next
}