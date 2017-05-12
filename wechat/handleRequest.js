const Promise = require('bluebird')
const handleResponse = require('./handleResponse')

module.exports = async function(requestData) {
  let response

  if (requestData.MsgType === 'event') {
    generateText(requestData.Event)
  } else if (requestData.MsgType === 'text') {
    switch (requestData.Content) {
      case '1':
      case '2':
        response = await handleResponse.generateText(requestData.Content)
        break
      case '3':
        response = await handleResponse.generateImage()
        break
      case '4':
        response = await handleResponse.generateVideo()
        break
      case '5':
        response = await handleResponse.generateCommonNews()
        break
      default:
        response = await handleResponse.generateMovieNews(requestData.Content)
    }
  } else if (requestData.MsgType === 'voice') {
    const voiceText = requestData.Recognition
    if (voiceText) {
      response = await handleResponse.generateMovieNews(voiceText)
    } else {
      response = await handleResponse.generateText('Sorry, 没听清你说的是什么？')
    }
  }

  return response
}