'use strict'

var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var parseXML = require('./parseXML')
var fs = require('fs')

var baseUrl = 'https://api.weixin.qq.com/cgi-bin'

var API = {
  accessToken: baseUrl + '/token?grant_type=client_credential',
  uploadMedia: baseUrl + '/media/upload?'
}

function Wechat(opts) {
  var that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.getAccessToken()
    .then(function(data) {
      //console.log(data)
      try {
        data = JSON.parse(data)
      } catch (e) {
        return that.updateAccessToken()
      }

      if (that.isValidAccessToken(data)) {
        console.log('valid')
        return Promise.resolve(data)
      } else {
        console.log('invalid')
        return that.updateAccessToken()
      }
    })
    .then(function(data) {
      console.log(data)
      that.access_token = data.access_token
      that.expires_in = data.expires_in

      that.saveAccessToken(data)
    })
}

Wechat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }

  var access_token = data.access_token
  var expires_in = data.expires_in
  var now = new Date().getTime()
  //console.log(now + ' ' + expires_in)

  if (now < expires_in) {
    return true
  } else {
    return false
  }
}

Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID
  var appSecret = this.appSecret
  var url = API.accessToken + '&appid=' + appID + '&secret=' + appSecret

  return new Promise(function(resolve, reject) {
    request({ url: url, json: true })
      .then(function(response) {
        //console.log(response)

        var data = response.body
        var now = new Date().getTime()
        var expires_in = now + (data.expires_in - 20) * 1000

        data.expires_in = expires_in
        //console.log(data)
        resolve(data)
      })
  })
}

Wechat.prototype.fetchAccessToken = function () {
  var that = this

  var data = {
    access_token: that.access_token,
    expires_in: that.expires_in
  }
  //console.log(data)
  if (this.isValidAccessToken(data)) {
    return Promise.resolve(data)
  } else {
    this.updateAccessToken()
      .then(function(data) {
        //console.log(data)
        that.access_token = data.access_token
        that.expires_in = data.expires_in

        that.saveAccessToken(data)

        return Promise.resolve(data)
      })
  }
  
}

Wechat.prototype.response = function() {
  var response = this.myResponse
  var request = this.request

  var xml = parseXML.handlerXML(response, request)
  console.log(xml)

  this.status = 200
  this.type = 'application/xml'
  this.body = xml
}

Wechat.prototype.uploadMedia = function(type, path) {
  var that = this

  var form = {
    media: fs.createReadStream(path)
  }
  var appID = this.appID
  var appSecret = this.appSecret
  
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = API.uploadMedia + 'access_token=' + data.access_token + '&type=' + type

        request({method: 'POST', url: url, formData: form, json: true })
          .then(function(response) {
            var media = response.body
            console.log(media)

            resolve(media)
          })
      })

  })

}

module.exports = Wechat
