const tpl = require('./responseTpl')

module.exports = async function(requestData, responseData) {
  const info = {
    fromUserName: requestData.ToUserName,
    toUserName: requestData.FromUserName,
    responseType: responseData.responseType,
    content: responseData.content
  }
  info.createTime = new Date().getTime()

  return Promise.resolve(tpl.compiled(info))
}

async function plainText(content) {
  const response = { responseType: 'text' }
  if (content === 'subscribe') {
    response.content = {
      text: '欢迎关注电影爱好者\n' + '回复 1 ~ 5 ，来点好玩的\n' + '回复 电影名称 或 语音 ，搜索电影'
    }
  }

  switch (content) {

  }
}