'use strict'

var config = require('../config/config')
var Wechat = require('./wechat')
var wechatAPI = new Wechat(config.wechat)

//wechatAPI.updateAccessToken()

exports.handlerRequest = function*(next) {
  var that = this

  var wechat

  var request = this.request
  console.log(request)

  this.myResponse.responseType = 'text'

  if (request.MsgType === 'event') {
    if (request.Event === 'subscribe') {
      this.myResponse.content = {
        text: '哈哈，来了'
      }
    }
  } else if (request.MsgType === 'text') {
    this.myResponse.content = {
      text: '哈哈： ' + request.Content
    }

    if (request.Content === '1') {
      this.myResponse.responseType = 'image'

      var media = yield wechatAPI.uploadMaterial('image', 'images/config.png')
      this.myResponse.content.img = media.media_id

    } else if (request.Content === '2') {
      this.myResponse.responseType = 'video'

      this.myResponse.content.title = '回复视频'
      this.myResponse.content.description = '看我回复的是什么'

      var media = yield wechatAPI.uploadMaterial('video', 'images/mayday.mp4')
      console.log(media)

      this.myResponse.content.video = media.media_id
    } else if (request.Content === '3') {
      this.myResponse.responseType = 'image'

      var media = yield wechatAPI.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
      console.log(media)

      this.myResponse.content.img = media.media_id
    } else if (request.Content === '4') {
      this.myResponse.responseType = 'video'
      this.myResponse.content.title = '回复视频'
      this.myResponse.content.description = '看我回复的是什么'

      var media = yield wechatAPI.uploadMaterial('video', 'images/mayday.mp4', {
        type: 'video',
        description: {
          title: "mayday",
          introduction: "listen mayday"
        }
      })
      console.log(media)

      this.myResponse.content.video = media.media_id
    } else if (request.Content === '5') {
      this.myResponse.responseType = 'news'

      var media = yield wechatAPI.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
      console.log(media)

      var addNews = {
        articles: [{
          title: 'Mayday',
          thumb_media_id: media.media_id,
          author: 'hugo',
          digest: 'hello world',
          show_cover_pic: 1,
          content: 'They are mayday',
          content_source_url: 'https://github.com'
        }, {
          title: 'Mayday',
          thumb_media_id: media.media_id,
          author: 'hugo',
          digest: 'hello world',
          show_cover_pic: 1,
          content: 'They are mayday',
          content_source_url: 'https://github.com'
        }]
      }

      var news = yield wechatAPI.uploadMaterial('news', addNews, {})
      console.log(news)
      //var getNews = yield wechatAPI.getMaterial(news.media_id, 'news', {})
      //news:
      //'BxY9DCQShdYAJf_qI21tag5acmTkl_cpuHjo5MRED6Y'
      //'BxY9DCQShdYAJf_qI21tasqZjC640g3TrPeLwOL7Wc4'
      var getNews = yield wechatAPI.getMaterial('BxY9DCQShdYAJf_qI21tag5acmTkl_cpuHjo5MRED6Y', 'news', {})
      console.log(getNews)
      this.myResponse.content.news = []

      getNews.news_item.forEach(function(item) {
        that.myResponse.content.news.push({
          title: item.title,
          description: item.digest,
          picurl: item.thumb_media_id,
          url: item.url
        })
      })

      
    }
  } else {

    this.myResponse.content = {
      text: 'sorry, 不知道你在说什么'
    }
  }

  yield next
}
