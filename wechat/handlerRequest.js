'use strict'

var config = require('../config/config')
var Wechat = require('./wechat')
var wechatAPI = new Wechat(config.wechat)

exports.handlerRequest = function*(next) {
  var that = this

  var wechat

  var request = this.request
  //console.log(request)

  this.myResponse.responseType = 'text'

  if (request.MsgType === 'event') {
    if (request.Event === 'subscribe') {
      this.myResponse.content = {
        text: '哈哈，来了'
      }
    } else if (request.Event === 'LOCATION') {
      this.myResponse.content = {
        text: '经度: ' + request.Longitude + ' 纬度: ' + request.Latitude
      }
    } else {
      this.myResponse.content = {
        text: ''
      }
    }
  } else if (request.MsgType === 'text') {
    this.myResponse.content = {
      text: '哈哈： ' + request.Content
    }

    if (request.Content === '1') {
      this.myResponse.responseType = 'image'

      var media = yield wechatAPI.uploadMaterial('image', 'images/config.png')
      //console.log(media)
      //'VE03KZXx2bJ4RlGIez5fhrrq-HrYt2X__T0BIeAPTUa3bsJm7qou-MsNGDmihSHz'
      this.myResponse.content.img = media.media_id

    } else if (request.Content === '2') {
      this.myResponse.responseType = 'video'

      this.myResponse.content.title = '回复视频'
      this.myResponse.content.description = '看我回复的是什么'

      var media = yield wechatAPI.uploadMaterial('video', 'images/mayday.mp4')
      //console.log(media)
      //'XAL41g_MAgxHSkHuO9Ay8xndu0n2bk8cbEwhDFmsVbkw606PM3EQhkd_OOBEcQFk'
      this.myResponse.content.video = media.media_id

    } else if (request.Content === '3') {
      this.myResponse.responseType = 'image'

      //var media = yield wechatAPI.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
      //console.log(media)
      //media_id: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'
      //url: 'http://mmbiz.qpic.cn/mmbiz/WQaZgV48yX28PZukYLbibhCMicyA6dQ5YIDvO9pmEwwVNQF7CQYibtQibnibXrLuQTgYdUpqDftdXt5R4xvWF3wKXOw/0?wx_fmt=jpeg'
      //this.myResponse.content.img = media.media_id
      this.myResponse.content.img = 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'

    } else if (request.Content === '4') {
      this.myResponse.responseType = 'video'

      var media = yield wechatAPI.uploadMaterial('video', 'images/mayday.mp4', {
        type: 'video',
        description: {
          title: 'mayday',
          introduction: 'watch mayday'
        }
      })
      //console.log(media)
      this.myResponse.content.video = media.media_id
        //media_id: 
        //url: 
      var getVideo = yield wechatAPI.getMaterial('', 'video', {})
      this.myResponse.content.title = getVideo.title
      this.myResponse.content.description = getVideo.description

    } else if (request.Content === '5') {
      this.myResponse.responseType = 'news'

      //var media = yield wechatAPI.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
      //console.log(media)

      /*var addNews = {
        articles: [{
          title: 'Hello Mayday',
          thumb_media_id: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk',
          author: 'hugo',
          digest: 'I will go',
          show_cover_pic: 1,
          content: '谁说不能让我 此生唯一自传 如同诗一般？关于作品9号 [自传]',
          content_source_url: 'http://baike.baidu.com/link?url=KG-XlHbi2lW8lhq71F9ud8Ve_yVoOmoYs62ra1SjTzskg3DeoOnQeObfZvHUPYWDQNt9z57PuiXfwUUOTI_UkbMK2dJQTAOBDrFv5yRVWo3'
        }]
      }*/

      //var news = yield wechatAPI.uploadMaterial('news', addNews, {})
      //console.log(news)
      //var getNews = yield wechatAPI.getMaterial(news.media_id, 'news', {})
      //news:
      //'BxY9DCQShdYAJf_qI21tag5acmTkl_cpuHjo5MRED6Y'
      //'BxY9DCQShdYAJf_qI21tasqZjC640g3TrPeLwOL7Wc4'
      // one: 'BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8'
      var getNews = yield wechatAPI.getMaterial('BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8', 'news', {})
      //console.log(getNews)
      this.myResponse.content.news = []

      getNews.news_item.forEach(function(item) {
        that.myResponse.content.news.push({
          title: item.title,
          description: item.digest,
          picurl: item.thumb_url,
          url: item.url
        })
      })


    } else if (request.Content === '6') {
      this.myResponse.responseType = 'text'

      var counts = yield wechatAPI.count()
      //console.log(counts)

      this.myResponse.content.text = 'voice: ' + counts.voice_count + ' video: ' + counts.video_count + ' img: ' + counts.image_count + ' news: ' + counts.news_count

    } else if (request.Content === '7') {
      this.myResponse.responseType = 'text'

      /*var counts = yield wechatAPI.getMaterialList({
        type: 'image',
        offset: 0,
        count: 10
      })*/
      var lists = yield [
        wechatAPI.getMaterialList({
          type: 'image',
          offset: 0,
          count: 10
        }),
        wechatAPI.getMaterialList({
          type: 'news',
          offset: 0,
          count: 10
        }),
        wechatAPI.getMaterialList({
          type: 'video',
          offset: 0,
          count: 10
        })
      ]
      console.log(JSON.stringify(lists))

      this.myResponse.content.text = ' video: ' + lists[2].total_count + ' img: ' + lists[0].total_count + ' news: ' + lists[1].total_count

    } else if (request.Content === '10') {
      this.myResponse.responseType = 'text'

      var group = yield wechatAPI.createGroup('分组1')
      //console.log(group)

      this.myResponse.content.text = '创建分组成功，id: ' + group.group.id + ' name: ' + group.group.name

    } else if (request.Content === '11') {
      this.myResponse.responseType = 'text'

      var group = yield wechatAPI.createGroup('分组2')
      //console.log(group)

      this.myResponse.content.text = '创建分组成功，id: ' + group.group.id + ' name: ' + group.group.name

    } else if (request.Content === '12') {
      this.myResponse.responseType = 'text'

      var groups = yield wechatAPI.getGroup()
      //console.log(groups)

      this.myResponse.content.text = '分组数量: ' + groups.groups.length

    } else if (request.Content === '20') {
      this.myResponse.responseType = 'text'

      var openId = this.request.FromUserName

      var userInfo = yield wechatAPI.getUserInfo(openId)
      //console.log(userInfo)

      this.myResponse.content.text = 'nickname: ' + userInfo.nickname

    } else if (request.Content === '30') {
      this.myResponse.responseType = 'text'

      var message = {
        media_id: 'BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8'
      }
      var result = yield wechatAPI.sendMessage(message, 'mpnews')

      this.myResponse.content.text = '群发消息'

    } else if (request.Content === '31') {
      this.myResponse.responseType = 'text'

      var message = {
        content: 'hello imooc'
      }
      var result = yield wechatAPI.sendMessage(message, 'text')

      this.myResponse.content.text = '群发消息'

    }
  } else {

    this.myResponse.content = {
      text: 'sorry, 不知道你在说什么'
    }
  }

  yield next
}