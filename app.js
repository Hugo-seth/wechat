'use strict'

var Koa = require('koa')
var server = require('./wechat/g')
var config = require('./config/config')
var handler = require('./wechat/handlerRequest')
var ejs = require('ejs')
var heredoc = require('heredoc')

var app = new Koa()

var tpl = heredoc(function() {/*
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
    <title>猜电影</title>
  </head>
  <body>
    <h1>点击标题，开始录音翻译</h1>
    <p class="j-title"></p>
    <div class="j-poster"></div>
    <script src="http://www.zeptojs.cn/zepto.min.js"></script>
    <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
    <script>
      wx.config({
        debug: true, // 开启调试模式
        appId: '', // 必填，公众号的唯一标识
        timestamp: , // 必填，生成签名的时间戳
        nonceStr: '', // 必填，生成签名的随机串
        signature: '',// 必填，签名
        jsApiList: [] // 必填，需要使用的JS接口列表
      });
    </script>
  </body>
  </html>
*/})

app.use(function *(next) {
  if (this.url.indexOf('/movie') > -1) {
    this.body = ejs.render(tpl, {})
    return next
  }

  yield next
})

app.use(server(config.wechat, handler.handlerRequest))

app.listen(1234)
console.log('Listening: 1234')