'use strict'

var config = require('../config/config')
var Wechat = require('./wechat')

exports.getWechat = function() {
  var wechatAPI = new Wechat(config.wechat)

  return wechatAPI
}
