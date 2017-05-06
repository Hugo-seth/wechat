'use strict'

var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var WechatMovie = require('../app/controllers/WechatMovie')
var Wechat = require('../app/controllers/wechat')
var Movie = require('../app/controllers/movie')

var koaBody = require('koa-body')

module.exports = function(router) {

  // Index
  router.get('/', Index.index)

  // User
  router.post('/user/signup', User.signup)
  router.post('/user/signin', User.signin)
  router.get('/signin', User.showSignin)
  router.get('/signup', User.showSignup)
  router.get('/logout', User.logout)

  // wechat
  router.get('/wechat/movie', WechatMovie.search)
  router.get('/wechat/movie/:id', WechatMovie.getMovie)
    // router.get('/wechat/jump/:id', WechatMovie.jump)

  router.get('/wechat', Wechat.listen)
  router.post('/wechat', Wechat.listen)

}