'use strict'

var config = require('../config/config')
var menu = require('./menu.js')
var movie = require('../app/api/movie')
var instance = require('./wechatInstance')
var wechatAPI = instance.getWechat()

/*wechatAPI.deleteMenu().then(function() {
  return wechatAPI.createMenu(menu)
})
.then(function(data) {
  console.log(data)
})*/

exports.handlerRequest = function*(next) {
  var that = this

  var request = this.request
    //console.log(request)

  this.myResponse.responseType = 'text'

  if (request.MsgType === 'event') {
    if (request.Event === 'subscribe') {
      this.myResponse.content = {
        text: '欢迎关注电影爱好者\n' +
          '回复 1 ~ 5 ，来点好玩的\n' +
          '也可以点击 <a href="http://pxa6rbdwgl.proxy.qqbrowser.cc/movie">语音查电影</a>'
      }
    } else {
      this.myResponse.content = {
        text: request.Event
      }
    }
  } else if (request.MsgType === 'text') {

    if (request.Content === '1') {
      this.myResponse.content = {
        text: '天下第一就是你'
      }

    } else if (request.Content === '2') {
      this.myResponse.content = {
        text: '天下最二还是你'
      }

    } else if (request.Content === '3') {
      this.myResponse.responseType = 'image'

      this.myResponse.content = {
        img: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'
      }

    } else if (request.Content === '4') {
      this.myResponse.responseType = 'video'

      this.myResponse.content = {
        video: 'BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc'
      }

      //var getVideo = yield wechatAPI.getMaterial('BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc', 'video', {})

      this.myResponse.content.title = '温柔'
      this.myResponse.content.description = '如果有，就给你自由'

    } else if (request.Content === '5') {
      this.myResponse.responseType = 'news'

      var getNews = yield wechatAPI.getMaterial('BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8', 'news', {})

      this.myResponse.content = {
        news: []
      }

      getNews.news_item.forEach(function(item) {
        that.myResponse.content.news.push({
          title: item.title,
          description: item.digest,
          picurl: item.thumb_url,
          url: item.url
        })
      })

    } else {

      var movies = yield movie.searchByName(request.Content)

      if (!movies || movies.length === 0) {
        movies = yield movie.searchByDouban(request.Content)
      }

      if (movies && movies.length > 0) {
        this.myResponse.responseType = 'news'

        movies = movies.slice(0, 5)
        console.log(movies)

        that.myResponse.content = {
          news: []
        }

        movies.forEach(function(item) {
          that.myResponse.content.news.push({
            title: item.title,
            description: item.title,
            picurl: item.poster,
            url: 'https://github.com/'
          })
        })
      } else {
        this.myResponse.content = {
          text: '没有查询到与' + request.Content + '匹配的电影，你可以换个名字试试'
        }

      }
    }

  } else if (request.MsgType === 'voice') {
    this.myResponse.content = {
      text: 'what?'
    }
    
    /*var voiceText = request.Recognition

    var movies = yield movie.searchByName(voiceText)

    if (!movies || movies.length === 0) {
      movies = yield movie.searchByDouban(voiceText)
    }

    if (movies && movies.length > 0) {
      this.myResponse.responseType = 'news'

      movies = movies.slice(0, 5)
      console.log(movies)

      that.myResponse.content = {
        news: []
      }

      movies.forEach(function(item) {
        that.myResponse.content.news.push({
          title: item.title,
          description: item.title,
          picurl: item.images.large,
          url: 'https://github.com/'
        })
      })
    } else {
      this.myResponse.content = {
        text: '没有查询到与' + request.Content + '匹配的电影，你可以换个名字试试'
      }

    }*/
  }

  yield next
}

/*
else if (request.Event === 'LOCATION') {
  this.myResponse.content = {
    text: '经度: ' + request.Longitude + ' 纬度: ' + request.Latitude
  }
} else if (request.Event === 'CLICK') {
  this.myResponse.content = {
    text: request.Event + request.EventKey
  }
} else if (request.Event === 'VIEW') {
  this.myResponse.content = {
    text: request.Event + request.EventKey
  }
} else if (request.Event === 'scancode_push') {
  this.myResponse.content = {
    text: request.Event + request.ScanResult
  }
} else if (request.Event === 'scancode_waitmsg') {
  this.myResponse.content = {
    text: request.Event + request.ScanResult
  }
} else if (request.Event === 'pic_sysphoto') {
  this.myResponse.content = {
    text: request.Event + request.SendPicsInfo
  }
} else if (request.Event === 'pic_photo_or_album') {
  this.myResponse.content = {
    text: request.Event + request.SendPicsInfo
  }
} else if (request.Event === 'pic_weixin') {
  this.myResponse.content = {
    text: request.Event + request.SendPicsInfo
  }
} else if (request.Event === 'location_select') {
  this.myResponse.content = {
    text: request.Event + request.SendLocationInfo + request.Label
  }
}
*/

/*
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
  this.myResponse.responseType = 'text'

  //var media = yield wechatAPI.uploadMaterial('thumb', 'images/mayday.jpg', {})
  //console.log(media)
  //'BxY9DCQShdYAJf_qI21taml4192YigMVHzDLt_gKknE'
  //url: 'http://mmbiz.qpic.cn/mmbiz_jpg/WQaZgV48yX153qfK7e5IHibDte7iamIvhyL1TAHl0bZt0Ob1TycahyR37UPknUIqo4LNohDyvCl5ddFX4q70jcvQ/0?wx_fmt=jpeg'
  this.myResponse.content.text = 'BxY9DCQShdYAJf_qI21taml4192YigMVHzDLt_gKknE'

} else if (request.Content === '4') {
  this.myResponse.responseType = 'music'

  this.myResponse.content.title = '段子薛'
  this.myResponse.content.description = '其实我是一个演员'
    //http://c.y.qq.com/v8/playsong.html?songid=102636799&source=yqq#wechat_redirect
  this.myResponse.content.music = 'http://c.y.qq.com/v8/playsong.html?songid=102636799'
  this.myResponse.content.img = 'BxY9DCQShdYAJf_qI21taml4192YigMVHzDLt_gKknE'

} else if (request.Content === '5') {
  this.myResponse.responseType = 'image'

  //var media = yield wechatAPI.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
  //console.log(media)
  //media_id: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'
  //url: 'http://mmbiz.qpic.cn/mmbiz/WQaZgV48yX28PZukYLbibhCMicyA6dQ5YIDvO9pmEwwVNQF7CQYibtQibnibXrLuQTgYdUpqDftdXt5R4xvWF3wKXOw/0?wx_fmt=jpeg'
  //this.myResponse.content.img = media.media_id
  this.myResponse.content.img = 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'

} else if (request.Content === '6') {
  this.myResponse.responseType = 'video'

  //var video = yield wechatAPI.uploadMaterial('video', 'images/mayday.mp4', {
    //type: 'video',
    //description: {
      //title: '温柔',
      //introduction: '如果有，就给你自由'
    //}
  //})
  //'BxY9DCQShdYAJf_qI21tas4Q0kHU5UdBt3NqE-YpaTE'
  //down_url: 'http://202.77.59.45/vweixinp.tc.qq.com/1007_d132f4ab8c8247be938a9b0307628cf3.f10.mp4?vkey=7CBBCDF5BCA5A25B0460D7A2D942EE6963B6C46E742175B07828DEADF037762AF48AD5D81AF819DC&sha=0&save=1'
  //'BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc'

  //this.myResponse.content.video = video.media_id
  this.myResponse.content.video = 'BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc'

  var getVideo = yield wechatAPI.getMaterial('BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc', 'video', {})
  console.log(getVideo)
  this.myResponse.content.title = getVideo.title
  this.myResponse.content.description = getVideo.description

} else if (request.Content === '7') {
  this.myResponse.responseType = 'news'

  //var media = yield wechatAPI.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
  //console.log(media)

  var addNews = {
    articles: [{
      title: 'Hello Mayday',
      thumb_media_id: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk',
      author: 'hugo',
      digest: 'I will go',
      show_cover_pic: 1,
      content: '谁说不能让我 此生唯一自传 如同诗一般？关于作品9号 [自传]',
      content_source_url: 'http://baike.baidu.com/link?url=KG-XlHbi2lW8lhq71F9ud8Ve_yVoOmoYs62ra1SjTzskg3DeoOnQeObfZvHUPYWDQNt9z57PuiXfwUUOTI_UkbMK2dJQTAOBDrFv5yRVWo3'
    }]
  }

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


} else if (request.Content === '8') {
  this.myResponse.responseType = 'text'

  var counts = yield wechatAPI.count()
    //console.log(counts)

  this.myResponse.content.text = 'voice: ' + counts.voice_count + ' video: ' + counts.video_count + ' img: ' + counts.image_count + ' news: ' + counts.news_count

} else if (request.Content === '9') {
  this.myResponse.responseType = 'text'

  //var counts = yield wechatAPI.getMaterialList({
    //type: 'image',
    //offset: 0,
    //count: 10
  //})
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
*/