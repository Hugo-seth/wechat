'use strict'

var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var parseXML = require('./parseXML')
var fs = require('fs')
var _ = require('lodash')

var baseUrl = 'https://api.weixin.qq.com/cgi-bin'

var API = {
  accessToken: baseUrl + '/token?grant_type=client_credential',
  temp: {
    uploadMedia: baseUrl + '/media/upload?',
    getMedia: baseUrl + '/media/get?'
  },
  permanent: {
    addNews: baseUrl + '/material/add_news?',
    addNewsImg: baseUrl + '/media/uploadimg?',
    addMaterial: baseUrl + '/material/add_material?',
    getMaterial: baseUrl + '/material/get_material?',
    count: baseUrl + '/material/get_materialcount?',
    getMaterialList: baseUrl + '/material/batchget_material?'
  },
  group: {
    create: baseUrl + '/groups/create?',
    get: baseUrl + '/groups/get?',
    getUserGroup: baseUrl + '/cgi-bin/groups/getid?',
    updateGroup: baseUrl + '/cgi-bin/groups/update?',
    removeUser: baseUrl + '/cgi-bin/groups/members/update?',
    batchRemove: baseUrl + '/groups/members/batchupdate?',
    del: baseUrl + '/groups/delete?'
  },
  user: {
    getUserInfo: baseUrl + '/user/info?lang=zh_CN',
    batchGet: baseUrl + '/user/info/batchget?'
  },
  message: {
    sendAll: baseUrl + '/message/mass/sendall?'
  },
  menu: {
    create: baseUrl + '/menu/create?',
    get: baseUrl + '/menu/get?',
    del: baseUrl + '/menu/delete?'
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
      _url = API.permanent.addNewsImg
    } else if (type === 'news') {
      _url = API.permanent.addNews
      form = material
    } else {
      _url = API.permanent.addMaterial
      form.media = fs.createReadStream(material)
    }
  } else {
    var _url = API.temp.uploadMedia
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
          if (type === 'video') {
            form.description = JSON.stringify(form.description)
          }
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
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.getMaterial = function(mediaId, type, permanent) {
  var that = this

  var _url

  if (permanent) {
    _url = API.permanent.getMaterial
  } else {
    var _url = API.temp.getMedia
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
              var material = response.body
              console.log(material)
              if (material) {
                resolve(material)
              } else {
                throw new Error('getMaterial fails')
              }
            })
            .catch(function(err) {
              reject(err)
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
        var url = API.permanent.count + 'access_token=' + data.access_token
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
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.getMaterialList = function(options) {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = API.permanent.getMaterialList + 'access_token=' + data.access_token
        console.log(url)

        request({ method: 'POST', url: url, body: options, json: true })
          .then(function(response) {
            var materialList = response.body
            console.log(materialList)
            if (materialList) {
              resolve(materialList)
            } else {
              throw new Error('getMaterialList fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.createGroup = function(name) {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = API.group.create + 'access_token=' + data.access_token
        console.log(url)

        var options = {
          group: {
            name: name
          }
        }

        request({ method: 'POST', url: url, body: options, json: true })
          .then(function(response) {
            var group = response.body
            console.log(group)
            if (group) {
              resolve(group)
            } else {
              throw new Error('createGroup fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.getGroup = function() {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = API.group.get + 'access_token=' + data.access_token
        console.log(url)

        request({ url: url, json: true })
          .then(function(response) {
            var groups = response.body
            console.log(groups)
            if (groups) {
              resolve(groups)
            } else {
              throw new Error('getGroups fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.getUserInfo = function(openIds) {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {

        var url
        var options = {
          json: true
        }
        if (_.isArray(openIds)) {
          url = API.user.batchGet + '&access_token=' + data.access_token
          options.method = 'POST'
          options.body = {
            user_list: openIds
          }
        } else {
          url = API.user.getUserInfo + '&access_token=' + data.access_token + '&openid=' + openIds
        }
        console.log(url)
        options.url = url

        request({ url: url, json: true })
          .then(function(response) {
            var userInfo = response.body
            console.log(userInfo)
            if (userInfo) {
              resolve(userInfo)
            } else {
              throw new Error('getUserInfo fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.sendMessage = function(message, type, groupId) {
  var that = this

  var form = {
    msgtype: type
  }
  form[type] = message
  if (groupId) {
    form.filter = {
      is_to_all: false,
      group_id: groupId
    }
  } else {
    form.filter = {
      is_to_all: true
    }
  }
  console.log(form)

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = API.message.sendAll + 'access_token=' + data.access_token

        request({method: 'POST', url: url, body: form, json: true })
          .then(function(response) {
            var result = response.body
            console.log(result)
            if (result) {
              resolve(result)
            } else {
              throw new Error('sendMessage fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.createMenu = function(menu) {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = API.menu.create + 'access_token=' + data.access_token
        console.log(url)

        request({ method: 'POST', url: url, body: menu, json: true })
          .then(function(response) {
            var menu = response.body
            console.log(menu)
            if (menu) {
              resolve(menu)
            } else {
              throw new Error('createMenu fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.getMenu = function() {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = API.menu.get + 'access_token=' + data.access_token
        console.log(url)

        request({url: url, json: true })
          .then(function(response) {
            var menu = response.body
            console.log(menu)
            if (menu) {
              resolve(menu)
            } else {
              throw new Error('getMenu fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

Wechat.prototype.deleteMenu = function() {
  var that = this

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        var url = API.menu.del + 'access_token=' + data.access_token
        console.log(url)

        request({url: url, json: true })
          .then(function(response) {
            var result = response.body
            console.log(result)
            if (result) {
              resolve(result)
            } else {
              throw new Error('deleteMenu fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })

  })

}

module.exports = Wechat