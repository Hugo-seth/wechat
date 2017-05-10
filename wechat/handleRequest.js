const path = require('path')
const menu = require('./menu.js')
const movie = require('../app/api/movie')
const wechatInstance = require('./wechatInstance').getWechatInstance()

// wechatInstance.deleteMenu().then(function() {
//     return wechatInstance.createMenu(menu)
//   })
//   .then(function(data) {
//     console.log(data)
//   })      

module.exports = async function(requestData) {
  const response = { responseType: 'text' }

  if (requestData.MsgType === 'event') {
    if (requestData.Event === 'subscribe') {
      response.content = {
        text: '欢迎关注电影爱好者\n' +
          '回复 1 ~ 5 ，来点好玩的\n' +
          '回复 电影名称 或 语音 ，搜索电影'
      }
    } else if (requestData.Event === 'CLICK') {
      response.content = {
        text: requestData.Event + requestData.EventKey
      }
    } else {
      response.content = {
        text: requestData.Event
      }
    }
  } else if (requestData.MsgType === 'text') {
    if (requestData.Content === '1') {
      response.content = {
        text: '天下第一就是你'
      }
    } else if (requestData.Content === '2') {
      response.content = {
        text: '天下最二还是你'
      }
    } else if (requestData.Content === '3') {
      const imageObj = await wechatInstance.uploadMaterial('image', path.join(__dirname, '../images/mayday.jpg'), true)

      response.responseType = 'image'
      response.content = {
        img: imageObj.media_id //'BxY9DCQShdYAJf_qI21taieicnZ7J6Z1rH4zvvxlJ2E'
      }
    } else if (requestData.Content === '4') {
      const videoObj = await wechatInstance.uploadMaterial('video', path.join(__dirname, '../images/mayday.mp4'), true, {
        description: {
          title: '温柔',
          introduction: '如果有，就给你自由'
        }
      })
      response.responseType = 'video'
      response.content = {
        video: videoObj.media_id, //'BxY9DCQShdYAJf_qI21tamhcufRPTdHymt3nfJn3zp8', 
        title: '温柔',
        description: '如果有，就给你自由'
      }
    } else if (requestData.Content === '5') {
      // let addNews = {
      //   articles: [{
      //     title: 'Hello Mayday',
      //     thumb_media_id: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk',
      //     author: 'hugo',
      //     digest: 'I will go',
      //     show_cover_pic: 1,
      //     content: '谁说不能让我 此生唯一自传 如同诗一般？关于作品9号 [自传]',
      //     content_source_url: 'http://baike.baidu.com/link?url=KG-XlHbi2lW8lhq71F9ud8Ve_yVoOmoYs62ra1SjTzskg3DeoOnQeObfZvHUPYWDQNt9z57PuiXfwUUOTI_UkbMK2dJQTAOBDrFv5yRVWo3'
      //   }]
      // }
      // const newsObj = await wechatInstance.uploadMaterial('news', addNews)
      response.responseType = 'news'
      response.content = { news: [] }

      var getNews = await wechatInstance.getMaterial('BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8', true)
      getNews.news_item.forEach(function(item) {
        response.content.news.push({
          title: item.title,
          description: item.digest,
          picurl: item.thumb_url,
          url: item.url
        })
      })
    } else {

      var movies = await movie.searchByName(requestData.Content)

      if (!movies || movies.length === 0) {
        movies = await movie.searchByDouban(requestData.Content)
      }

      if (movies && movies.length > 0) {
        response.responseType = 'news'

        movies = movies.slice(0, 5)
          //console.log(movies)

        that.myResponse.content = {
          news: []
        }

        movies.forEach(function(item) {
          that.myResponse.content.news.push({
            title: item.title,
            description: item.title,
            picurl: item.poster,
            url: config.wechat.domain + '/movie/' + item._id
          })
        })
      } else {
        response.content = {
          text: '没有查询到与' + requestData.Content + '匹配的电影，你可以换个名字试试'
        }

      }
    }

  } else if (requestData.MsgType === 'voice') {

    var voiceText = requestData.Recognition

    var movies = await movie.searchByName(voiceText)

    if (!movies || movies.length === 0) {
      movies = await movie.searchByDouban(voiceText)
    }

    if (movies && movies.length > 0) {
      response.responseType = 'news'

      movies = movies.slice(0, 5)
        //console.log(movies)

      that.myResponse.content = {
        news: []
      }

      movies.forEach(function(item) {
        that.myResponse.content.news.push({
          title: item.title,
          description: item.title,
          picurl: item.images.large,
          url: config.wechat.domain + '/movie/' + item._id
        })
      })
    } else {
      response.content = {
        text: '没有查询到与' + requestData.Content + '匹配的电影，你可以换个名字试试'
      }

    }
  }
  return Promise.resolve(response)
}

/*
else if (requestData.Event === 'LOCATION') {
  response.content = {
    text: '经度: ' + requestData.Longitude + ' 纬度: ' + requestData.Latitude
  }
} else if (requestData.Event === 'CLICK') {
  response.content = {
    text: requestData.Event + requestData.EventKey
  }
} else if (requestData.Event === 'VIEW') {
  response.content = {
    text: requestData.Event + requestData.EventKey
  }
} else if (requestData.Event === 'scancode_push') {
  response.content = {
    text: requestData.Event + requestData.ScanResult
  }
} else if (requestData.Event === 'scancode_waitmsg') {
  response.content = {
    text: requestData.Event + requestData.ScanResult
  }
} else if (requestData.Event === 'pic_sysphoto') {
  response.content = {
    text: requestData.Event + requestData.SendPicsInfo
  }
} else if (requestData.Event === 'pic_photo_or_album') {
  response.content = {
    text: requestData.Event + requestData.SendPicsInfo
  }
} else if (requestData.Event === 'pic_weixin') {
  response.content = {
    text: requestData.Event + requestData.SendPicsInfo
  }
} else if (requestData.Event === 'location_select') {
  response.content = {
    text: requestData.Event + requestData.SendLocationInfo + requestData.Label
  }
}
*/

/*
if (requestData.Content === '1') {
  response.responseType = 'image'

  

} else if (requestData.Content === '2') {
  response.responseType = 'video'

  response.content.title = '回复视频'
  response.content.description = '看我回复的是什么'

  var media = await wechatInstance.uploadMaterial('video', 'images/mayday.mp4')
    //console.log(media)
    //'XAL41g_MAgxHSkHuO9Ay8xndu0n2bk8cbEwhDFmsVbkw606PM3EQhkd_OOBEcQFk'
  response.content.video = media.media_id

} else if (requestData.Content === '3') {
  response.responseType = 'text'

  //var media = await wechatInstance.uploadMaterial('thumb', 'images/mayday.jpg', {})
  //console.log(media)
  //'BxY9DCQShdYAJf_qI21taml4192YigMVHzDLt_gKknE'
  //url: 'http://mmbiz.qpic.cn/mmbiz_jpg/WQaZgV48yX153qfK7e5IHibDte7iamIvhyL1TAHl0bZt0Ob1TycahyR37UPknUIqo4LNohDyvCl5ddFX4q70jcvQ/0?wx_fmt=jpeg'
  response.content.text = 'BxY9DCQShdYAJf_qI21taml4192YigMVHzDLt_gKknE'

} else if (requestData.Content === '4') {
  response.responseType = 'music'

  response.content.title = '段子薛'
  response.content.description = '其实我是一个演员'
    //http://c.y.qq.com/v8/playsong.html?songid=102636799&source=yqq#wechat_redirect
  response.content.music = 'http://c.y.qq.com/v8/playsong.html?songid=102636799'
  response.content.img = 'BxY9DCQShdYAJf_qI21taml4192YigMVHzDLt_gKknE'

} else if (requestData.Content === '5') {
  response.responseType = 'image'

  //var media = await wechatInstance.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
  //console.log(media)
  //media_id: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'
  //url: 'http://mmbiz.qpic.cn/mmbiz/WQaZgV48yX28PZukYLbibhCMicyA6dQ5YIDvO9pmEwwVNQF7CQYibtQibnibXrLuQTgYdUpqDftdXt5R4xvWF3wKXOw/0?wx_fmt=jpeg'
  //response.content.img = media.media_id
  response.content.img = 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'

} else if (requestData.Content === '6') {
  response.responseType = 'video'

  //var video = await wechatInstance.uploadMaterial('video', 'images/mayday.mp4', {
    //type: 'video',
    //description: {
      //title: '温柔',
      //introduction: '如果有，就给你自由'
    //}
  //})
  //'BxY9DCQShdYAJf_qI21tas4Q0kHU5UdBt3NqE-YpaTE'
  //down_url: 'http://202.77.59.45/vweixinp.tc.qq.com/1007_d132f4ab8c8247be938a9b0307628cf3.f10.mp4?vkey=7CBBCDF5BCA5A25B0460D7A2D942EE6963B6C46E742175B07828DEADF037762AF48AD5D81AF819DC&sha=0&save=1'
  //'BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc'

  //response.content.video = video.media_id
  response.content.video = 'BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc'

  var getVideo = await wechatInstance.getMaterial('BxY9DCQShdYAJf_qI21talnUIH-X7wllNrRMWpyn-Kc', 'video', {})
  console.log(getVideo)
  response.content.title = getVideo.title
  response.content.description = getVideo.description

} else if (requestData.Content === '7') {
  response.responseType = 'news'

  //var media = await wechatInstance.uploadMaterial('image', 'images/mayday.jpg', { type: 'image' })
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

  //var news = await wechatInstance.uploadMaterial('news', addNews, {})
  //console.log(news)
  //var getNews = await wechatInstance.getMaterial(news.media_id, 'news', {})
  //news:
  //'BxY9DCQShdYAJf_qI21tag5acmTkl_cpuHjo5MRED6Y'
  //'BxY9DCQShdYAJf_qI21tasqZjC640g3TrPeLwOL7Wc4'
  // one: 'BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8'
  var getNews = await wechatInstance.getMaterial('BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8', 'news', {})
    //console.log(getNews)
  response.content.news = []

  getNews.news_item.forEach(function(item) {
    that.myResponse.content.news.push({
      title: item.title,
      description: item.digest,
      picurl: item.thumb_url,
      url: item.url
    })
  })


} else if (requestData.Content === '8') {
  response.responseType = 'text'

  var counts = await wechatInstance.count()
    //console.log(counts)

  response.content.text = 'voice: ' + counts.voice_count + ' video: ' + counts.video_count + ' img: ' + counts.image_count + ' news: ' + counts.news_count

} else if (requestData.Content === '9') {
  response.responseType = 'text'

  //var counts = await wechatInstance.getMaterialList({
    //type: 'image',
    //offset: 0,
    //count: 10
  //})
  var lists = await [
    wechatInstance.getMaterialList({
      type: 'image',
      offset: 0,
      count: 10
    }),
    wechatInstance.getMaterialList({
      type: 'news',
      offset: 0,
      count: 10
    }),
    wechatInstance.getMaterialList({
      type: 'video',
      offset: 0,
      count: 10
    })
  ]
  console.log(JSON.stringify(lists))

  response.content.text = ' video: ' + lists[2].total_count + ' img: ' + lists[0].total_count + ' news: ' + lists[1].total_count

} else if (requestData.Content === '10') {
  response.responseType = 'text'

  var group = await wechatInstance.createGroup('分组1')
    //console.log(group)

  response.content.text = '创建分组成功，id: ' + group.group.id + ' name: ' + group.group.name

} else if (requestData.Content === '11') {
  response.responseType = 'text'

  var group = await wechatInstance.createGroup('分组2')
    //console.log(group)

  response.content.text = '创建分组成功，id: ' + group.group.id + ' name: ' + group.group.name

} else if (requestData.Content === '12') {
  response.responseType = 'text'

  var groups = await wechatInstance.getGroup()
    //console.log(groups)

  response.content.text = '分组数量: ' + groups.groups.length

} else if (requestData.Content === '20') {
  response.responseType = 'text'

  var openId = this.requestData.FromUserName

  var userInfo = await wechatInstance.getUserInfo(openId)
    //console.log(userInfo)

  response.content.text = 'nickname: ' + userInfo.nickname

} else if (requestData.Content === '30') {
  response.responseType = 'text'

  var message = {
    media_id: 'BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8'
  }
  var result = await wechatInstance.sendMessage(message, 'mpnews')

  response.content.text = '群发消息'

} else if (requestData.Content === '31') {
  response.responseType = 'text'

  var message = {
    content: 'hello imooc'
  }
  var result = await wechatInstance.sendMessage(message, 'text')

  response.content.text = '群发消息'

}
*/