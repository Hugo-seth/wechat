const xml2js = require('xml2js')
const Promise = require('bluebird')
const tpl = require('./responseTpl')

exports.parseXML = async function(xml) {
  return new Promise(function(resolve, reject) {
    xml2js.parseString(xml, { trim: true }, function(err, content) {
      if (err) return reject(err)
      resolve(content)
    })
  })
}

exports.formatMessage = function(data) {
  let message = {}
  if (typeof data === 'object') {
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let item = data[keys[i]]
      let key = keys[i]

      if (Array.isArray(item)) {
        item.length === 0 ? message[key] = '' : message[key] = item[0]
      } else {
        message[key] = item
      }
    }
  }
  return message
}

exports.handlerXML = function(response, request) {
  var info = {
    fromUserName: request.ToUserName,
    toUserName: request.FromUserName,
    responseType: response.responseType,
    content: response.content
  }
  info.createTime = new Date().getTime()
    //console.log(info)

  return tpl.compiled(info)
}