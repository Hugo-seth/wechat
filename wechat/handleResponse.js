const path = require('path')
const Promise = require('bluebird')
const wechatInstance = require('./wechatInstance')
const tpl = require('./responseTpl')
const movie = require('../app/api/movie')

exports.convertToXML = function(requestData, responseData) {
  const info = {
    fromUserName: requestData.ToUserName,
    toUserName: requestData.FromUserName,
    responseType: responseData.responseType,
    content: responseData.content
  }
  info.createTime = new Date().getTime()

  return tpl.compiled(info)
}

exports.generateText = async function(content) {
  const response = { responseType: 'text', content: {} }

  switch (content) {
    case 'subscribe':
      response.content.text = '欢迎关注电影爱好者\n' + '回复 1 ~ 5 ，来点好玩的\n' + '回复 电影名称 或 语音 ，搜索电影'
      break
    case '1':
      response.content.text = '天下第一就是你'
      break
    case '2':
      response.content.text = '天下最二还是你'
      break
    default:
      response.content.text = content ? content : 'hello world'
  }
  return Promise.resolve(response)
}

exports.generateImage = async function() {
  const response = { responseType: 'image', content: {} }

  // const imageObj = await wechatInstance.uploadMaterial('image', path.join(__dirname, '../images/mayday.jpg'), true)
  // response.content.img = imageObj.media_id

  // 直接使用已上传的永久素材
  response.content.img = 'BxY9DCQShdYAJf_qI21tang358xX3jBeNgDtiqpHPXk'
  return Promise.resolve(response)
}

exports.generateVideo = async function() {
  const response = { responseType: 'video' }

  // const videoObj = await wechatInstance.uploadMaterial('video', path.join(__dirname, '../images/mayday.mp4'), true, {
  //   description: {
  //     title: 'Mayday',
  //     introduction: 'History of tomorrow'
  //   }
  // })
  // response.content = {
  //   video: videoObj.media_id,
  //   title: 'Mayday',
  //   description: 'History of tomorrow'
  // }

  // 直接使用已上传的永久素材
  response.content = {
    video: 'BxY9DCQShdYAJf_qI21tamvqcqrhISOHDUA8cUfA40U',
    title: 'Mayday',
    description: 'History of tomorrow'
  }
  return Promise.resolve(response)
}

exports.generateCommonNews = async function() {
  const response = { responseType: 'news', content: { news: [] } }

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
  // const getNews = await wechatInstance.getMaterial(newsObj.media_id, true)
  // getNews.news_item.forEach(function(item) {
  //   response.content.news.push({
  //     title: item.title,
  //     description: item.digest,
  //     picurl: item.thumb_url,
  //     url: item.url
  //   })
  // })

  // 直接使用已上传的永久素材
  const getNews = await wechatInstance.getMaterial('BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8', true)
  getNews.news_item.forEach(function(item) {
    response.content.news.push({
      title: item.title,
      description: item.digest,
      picurl: item.thumb_url,
      url: item.url
    })
  })
  return Promise.resolve(response)
}

exports.generateMovieNews = async function(content) {
  const response = {}

  let movies = await movie.searchByName(content)
  if (!movies || movies.length === 0) {
    movies = await movie.searchByDouban(content)
  }
  if (movies && movies.length > 0) {
    response.responseType = 'news'
    response.content = { news: [] }
    movies = movies.slice(0, 5)

    movies.forEach(function(item) {
      response.content.news.push({
        title: item.title,
        description: item.title,
        picurl: item.poster,
        url: config.wechat.domain + '/movie/' + item._id
      })
    })
  } else {
    response.responseType = 'text'
    response.content = { text: '没有查询到与' + content + '匹配的电影，你可以换个名字试试' }
  }
  return Promise.resolve(response)
}