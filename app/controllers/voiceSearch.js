'use strict'

var Koa = require('koa')
var config = require('./config/config')
var instance = require('./wechat/wechat-instance')
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
      <h3 class="j-title">点击标题，开始录音翻译</h3>
      <div class="j-movie-content"></div>
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
            'translateVoice',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'onMenuShareQZone'
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
          //console.log($('.j-title'))
          var content = {
            title: '搜电影啦', // 分享标题
            desc: '你也想来搜一下吗？', // 分享描述
            link: 'https://github.com', // 分享链接
            imgUrl: 'http://coding.imooc.com/static/module/common/img/logo.png', // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () { 
              window.alert('分享成功')
            },
            cancel: function () { 
              window.alert('分享失败')
            }
          }
          wx.onMenuShareAppMessage(content)
          
          $('.j-title').on('click', function() {
            //console.log('tap')
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
                      var result = res.translateResult
                      console.log(result)

                      $.ajax({
                        type: 'get',
                        url: 'https://api.douban.com/v2/movie/search?q=' + result,
                        dataType: 'jsonp',
                        jsonp: 'callback',
                        success: function(data) {
                          var subject = data.subjects[0]
                          var title = subject.title
                          console.log(title)
                          var director = subject.directors[0].name
                          console.log(director)
                          var year = subject.year
                          console.log(year)
                          var img = subject.images.large
                          console.log(img)

                          var html =  '<p>'+ title + '</p><p>' + director  + '</p><p>' + year + '</p><img src=" ' + img + ' ">'
                          //console.log(html)
                          $('.j-movie-content').html(html)

                          content.title = '我搜到了《' + title + '》'
                          content.imgUrl = img

                          wx.onMenuShareAppMessage(content)
                        }
                      })
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

exports.movie = function*(next) {
  var wechatAPI = instance.getWechat()
  var ticketData = yield wechatAPI.fetchSDKTicket()
  var ticket = ticketData.SDKTicket
    //console.log(ticket)
  var url = this.href.replace(':8000', '')
  var params = sign(ticket, url)
  console.log(params)
  this.body = ejs.render(tpl, params)

  return next
}

/*app.use(function*(next) {
  if (this.url.indexOf('/movie') > -1) {

  }

  yield next
})*/

