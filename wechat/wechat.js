'use strict'

var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var parseXML = require('./parseXML')
var fs = require('fs')
var _ = require('lodash')

var baseUrl = 'https://api.weixin.qq.com/cgi-bin'

var API = {
  accessToken: '/token?grant_type=client_credential',
  temp: {
    uploadMedia: '/media/upload?',
    getMedia: '/media/get?'
  },
  permanent: {
    addNews: '/material/add_news?',
    addNewsImg: '/media/uploadimg?',
    addMaterial: '/material/add_material?',
    getMaterial: '/material/get_material?',
    count: '/material/get_materialcount?'
  }
}

function Wechat(opts) {
  var that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

}

Wechat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }

  var access_token = data.access_token
  var expires_in = data.expires_in
  var now = new Date().getTime()
  console.log(now + ' ' + expires_in)

  if (now < expires_in) {
    return true
  } else {
    return false
  }
}

Wechat.prototype.updateAccessToken = function() {
  var that = this

  var appID = this.appID
  var appSecret = this.appSecret
  var url = baseUrl + API.accessToken + '&appid=' + appID + '&secret=' + appSecret

  return new Promise(function(resolve, reject) {
    request({ url: url, json: true })
      .then(function(response) {
        //console.log(response)

        var data = response.body
        var now = new Date().getTime()
        var expires_in = now + (data.expires_in - 20) * 1000

        data.expires_in = expires_in
          //console.log(data)
        console.log('update')
        resolve(data)
      })
  })
}

Wechat.prototype.fetchAccessToken = function() {
  var that = this

  if (this.access_token && this.expires_in) {
    var data = {
      access_token: this.access_token,
      expires_in: this.expires_in
    }
    if (this.isValidAccessToken(data)) {
      return Promise.resolve(data)

    }
  }

  return this.getAccessToken()
    .then(function(data) {
      console.log('get')
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
      that.access_token = data.access_token
      that.expires_in = data.expires_in

      that.saveAccessToken(data)

      return Promise.resolve(data)
    })

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

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
  var that = this

  var form = {}
  var _url

  if (permanent) {

    _.extend(form, permanent)

    if (type === 'newsImg') {
      _url = baseUrl + API.permanent.addNewsImg
    } else if (type === 'news') {
      _url = baseUrl + API.permanent.addNews
      form = material
    } else {
      _url = baseUrl + API.permanent.addMaterial
      form.media = fs.createReadStream(material)
    }
  } else {
    var _url = baseUrl + API.temp.uploadMedia
    form.media = fs.createReadStream(material)
  }

  //console.log(form)

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = _url + 'access_token=' + data.access_token

        if (!permanent) {
          url += '&type=' + type
        } else {
          form.access_token = data.access_token
        }
        console.log(url)

        var options = {
          method: 'POST',
          url: url,
          json: true
        }

        if (type === 'news') {
          options.body = form
        } else {
          options.formData = form
        }
        console.log(options)
        request(options)
          .then(function(response) {
            var media = response.body
            console.log(media)
            if (media) {
              resolve(media)
            } else {
              throw new Error('upload material fails')
            }

          })
      })

  })

}

Wechat.prototype.getMaterial = function(mediaId, type, permanent) {
  var that = this

  var _url

  if (permanent) {
    _url = baseUrl + API.permanent.getMaterial
  } else {
    var _url = baseUrl + API.temp.getMedia
  }
  //console.log(form)

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = _url + 'access_token=' + data.access_token
        var options = { method: 'POST', json: true }
        if (permanent) {
          var form = {
            access_token: data.access_token,
            media_id: mediaId
          }
          options.body = form
        } else {
          if (type === 'video') {
            url = url.replace('https', 'http')
          }
          url += '&media_id=' + mediaId
        }
        options.url = url
        console.log(options)

        if (type === 'news' || type === 'video') {
          request(options)
            .then(function(response) {
              var media = response.body
              console.log(media)
              if (media) {
                resolve(media)
              } else {
                throw new Error('getMaterial fails')
              }

            })
        } else {
          resolve(url)
        }
      })
  })

}

Wechat.prototype.count = function() {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = baseUrl + API.permanent.count + 'access_token=' + data.access_token
        console.log(url)

        request({ method: 'GET', url: url, json: true })
          .then(function(response) {
            var materialNums = response.body
            console.log(materialNums)
            if (materialNums) {
              resolve(materialNums)
            } else {
              throw new Error('countMaterial fails')
            }

          })
      })

  })

}

module.exports = Wechat
