'use strict'
var urlencode = require('urlencode')
var mongoose = require('mongoose')
var User = mongoose.model('User')

//var Koa = require('koa')
var config = require('../../config/config')
var instance = require('../../wechat/wechatInstance')
var ejs = require('ejs')
var heredoc = require('heredoc')
var util = require('../../libs/util')
var movieAPI = require('../api/movie')
var koa_request = require('koa-request')

exports.search = function*(next) {
  var wechatAPI = instance.getWechat()
  var ticketData = yield wechatAPI.fetchSDKTicket()
  var ticket = ticketData.SDKTicket
  console.log(ticket)
  var url = this.href.replace(':8000', '')
  var params = util.sign(ticket, url)
  console.log(params)
  yield this.render('wechat/searchMovie', params)

  return next
}

exports.getMovie = function*(next) {
  // var code = this.query.code
  // var openUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.wechat.appID + '&secret=' + config.wechat.appSecret + '&code=' + code + '&grant_type=authorization_code'

  // var response = yield koa_request({
  //   url: openUrl
  // })

  // var data = JSON.parse(response.body)
  // console.log(data)

  // var wechatAPI = instance.getWechat()
  // var ticketData = yield wechatAPI.fetchSDKTicket()
  // var ticket = ticketData.SDKTicket
  //   //console.log(ticket)
  // var url = this.href.replace(':8000', '')
  // var params = util.sign(ticket, url)

  var id = this.params.id

  var movie = yield movieAPI.searchById(id)
  var params = {
    movie: movie
  }
  console.log(params)

  yield this.render('wechat/MovieDetail', params)

  return next
}

// exports.jump = function*(next) {
//   var movieId = this.params.id
//   var redirect = urlencode(config.wechat.domain + '/movie/' + movieId)
//   var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.wechat.appID + '&redirect_uri=' + redirect + '&response_type=code&scope=snsapi_userinfo&state=' + movieId + '#wechat_redirect'
//   console.log(url)

//   this.redirect(url)
// }