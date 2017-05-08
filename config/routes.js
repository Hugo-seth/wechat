'use strict'

var Index = require('../app/controllers/index')
var Wechat = require('../app/controllers/wechat')

module.exports = function(router) {
  // Index
  router.get('/', Index.index)

  // Movie

  // wechat
  router.get('/wechat', Wechat)
  router.post('/wechat', Wechat)
}