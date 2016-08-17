'use strict'

var Koa = require('koa')
var server = require('./wechat/g')
var config = require('./config/config')
var handler = require('./wechat/handlerRequest')
var Wechat = require('./wechat/wechat')
var ejs = require('ejs')
var heredoc = require('heredoc')
var crypto = require('crypto')

var app = new Koa()

var tpl = heredoc(function() {
  /*
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
      <title>搜电影</title>
    </head>
    <body>
      <h1>点击标题，开始录音翻译</h1>
      <p class="j-title"></p>
      <p class="j-doctor"></p>
      <p class="j-year"></p>
      <div class="j-poster"></div>
      <script src="http://www.zeptojs.cn/zepto.min.js"></script>
      <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
      <script>
        wx.config({
          debug: false,
          appId: 'wx5420f4ebe1623fff',
          timestamp: '<%= timestamp %>',
          nonceStr: '<%= noncestr %>',
          signature: '<%= signature %>',
          jsApiList: [
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'translateVoice'
          ]
        })
        wx.ready(function(){
          wx.checkJsApi({
            jsApiList: ['onVoiceRecordEnd'],
            success: function(res) {
              console.log(res)
            }
          })
          var isRecording = false
          var localId

          $('.j-title').on('tap', function() {
            if (!isRecording) {
              isRecording = true
              wx.startRecord({
                cancel: function() {
                window.alert('那就不能搜了哦')
                }
              })
            } else {
              isRecording = false
              wx.stopRecord({
                success: function (res) {
                 var localId = res.localId
                  wx.translateVoice({
                    localId: localId, 
                    isShowProgressTips: 1,
                    success: function (res) {
                      alert(res.translateResult)
                    }
                  })
                }
              })
            }
            
          })
        })       
      </script>
    </body>
    </html>
  */
})

var createNonce = function() {
  return Math.random().toString(36).substr(2, 15)
}

var createTimestamp = function() {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}

var _sign = function(noncestr, ticket, timestamp, url) {
  var params = [
    'noncestr=' + noncestr,
    'jsapi_ticket=' + ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ]

  var str = params.sort().join('&')
  //console.log(str)
  var shasum = crypto.createHash('sha1')
  shasum.update(str)

  return shasum.digest('hex')
}

function sign(ticket, url) {
  var noncestr = createNonce()
  var timestamp = createTimestamp()
  var signature = _sign(noncestr, ticket, timestamp, url)

  return {
    noncestr: noncestr,
    timestamp: timestamp,
    signature: signature
  }
}

app.use(function*(next) {
  if (this.url.indexOf('/movie') > -1) {
    var wechatAPI = new Wechat(config.wechat)
    var ticketData = yield wechatAPI.fetchSDKTicket()
    var ticket = ticketData.SDKTicket
    //console.log(ticket)
    var url = this.href.replace(':8000', '')
    var params = sign(ticket, url)
    console.log(params)
    this.body = ejs.render(tpl, params)

    return next
  }

  yield next
})

app.use(server(config.wechat, handler.handlerRequest))

app.listen(1234)
console.log('Listening: 1234')
