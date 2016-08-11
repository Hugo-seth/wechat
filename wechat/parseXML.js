'use strict'

var xml2js = require('xml2js')
var Promise = require('bluebird')
var tpl = require('./tpl.js')

exports.parseXMLAsync = function(xml) {
  return new Promise(function(resolve, reject) {
    xml2js.parseString(xml, {trim: true}, function(err, content) {
      if (err) {
        reject(err)
      } else {
        resolve(content)
      }
    })
  })
}

function formatMessage(data) {
  var message = {}

  if (typeof data === 'object') {
    var keys = Object.keys(data)

    for (var i = 0; i < keys.length; i++) {
      var item = data[keys[i]]
      var key = keys[i]

      if (item instanceof Array) {
        if (item.length === 0) {
          message[key] = ''
        } else {
          message[key] = item[0]
        }
      } else {
        message[key] = item
      }
    };
  }

  return message
}

exports.formatMessage = formatMessage

exports.tpl = function(content, message) {
  var info = {
    fromUserName: message.ToUserName,
    toUserName: message.FromUserName,
    responseType: message.responseType,
    content: content
  }
  info.createTime = new Date().getTime()

  return tpl.compiled(info)

}