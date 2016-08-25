'use strict'

//var Koa = require('koa')
var config = require('../../config/config')
var instance = require('../../wechat/wechatInstance')
var ejs = require('ejs')
var heredoc = require('heredoc')
var util = require('../../libs/util')
var movieAPI = require('../api/movie')

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

/*app.use(function*(next) {
  if (this.url.indexOf('/movie') > -1) {

  }

  yield next
})*/
exports.getMovie = function*(next) {
  var wechatAPI = instance.getWechat()
  var ticketData = yield wechatAPI.fetchSDKTicket()
  var ticket = ticketData.SDKTicket
    //console.log(ticket)
  var url = this.href.replace(':8000', '')
  var params = util.sign(ticket, url)

  var id = this.params.id

  var movie = movieAPI.searchById(id)
  params.movie = movie
  console.log(params)

  yield this.render('wechat/MovieDetail', params)

  return next
}

