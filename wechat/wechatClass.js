const fs = require('fs')
const Promise = require('bluebird')
const request = require('./httpService')
const parseXML = require('./parseXML')

class Wechat {
  constructor(config) {
    this.appID = config.appID
    this.appSecret = config.appSecret
    this.readAccessTokenFile = config.readAccessTokenFile
    this.writeAccessTokenFile = config.writeAccessTokenFile
    this.readSDKTicketFile = config.readSDKTicketFile
    this.writeSDKTicketFile = config.writeSDKTicketFile
  }

  isValid(data, type) {
    if (!data || !data[type] || !data.expires_in) {
      return false
    }
    let now = new Date().getTime()
    if (now < data.expires_in) return true

    return false
  }

  updateAccessToken() {
    const that = this
    const url = API.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret

    return new Promise(function(resolve, reject) {
      request('get', url)
        .then(data => {
          data.expires_in = new Date().getTime() + (data.expires_in - 20) * 1000
          resolve(data)
        })
    })
  }

  fetchAccessToken() {
    const that = this

    if (this.access_token && this.expires_in) {
      let data = {
        access_token: this.access_token,
        expires_in: this.expires_in
      }
      if (this.isValid(data, 'access_token')) {
        return Promise.resolve(data)
      }
    }

    return this.readAccessTokenFile()
      .then(data => {
        try {
          data = JSON.parse(data)
        } catch (e) {
          return that.updateAccessToken()
        }

        if (that.isValid(data, 'access_token')) {
          return Promise.resolve(data)
        } else {
          return that.updateAccessToken()
        }
      })
      .then(data => {
        that.access_token = data.access_token
        that.expires_in = data.expires_in
        that.writeAccessTokenFile(data)

        return Promise.resolve(data)
      })
  }

  updateSDKTicket() {
    const that = this

    return new Promise(function(resolve, reject) {
      that.fetchAccessToken()
        .then(function(data) {
          var url = API.SDKTicket.get + '&access_token=' + data.access_token

          request({ url: url, json: true })
            .then(function(response) {
              var _data = response.body
                //console.log(_data)
              var now = new Date().getTime()
              var ticket = {}
              ticket.SDKTicket_expires_in = now + (_data.expires_in - 20) * 1000
              ticket.SDKTicket = _data.ticket

              resolve(ticket)
            })
        })
    })
  }

  fetchSDKTicket() {
    const that = this

    if (this.SDKTicket && this.SDKTicket_expires_in) {
      let data = {
        SDKTicket: this.SDKTicket,
        SDKTicket_expires_in: this.SDKTicket_expires_in
      }
      if (this.isValid(data, 'SDKTicket')) {
        return Promise.resolve(data)
      }
    }

    return this.readSDKTicketFile()
      .then(data => {
        try {
          data = JSON.parse(data)
        } catch (e) {
          return that.updateSDKTicket()
        }

        if (that.isValid(data, 'SDKTicket')) {
          return Promise.resolve(data)
        } else {
          return that.updateSDKTicket()
        }
      })
      .then(data => {
        that.SDKTicket = data.SDKTicket
        that.SDKTicket_expires_in = data.SDKTicket_expires_in
        that.writeSDKTicketFile(data)

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

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
  const that = this

  let form = {}
  let _url

  if (permanent) {
    Object.assign(form, permanent)

    if (type === 'newsImg') {
      _url = API.permanentMaterial.addNewsImg
    } else if (type === 'news') {
      _url = API.permanentMaterial.addNews
      form = material
    } else {
      _url = API.permanentMaterial.addMaterial
      form.media = fs.createReadStream(material)
    }
  } else {
    _url = API.tempMaterial.uploadMedia
    form.media = fs.createReadStream(material)
  }

  return new Promise(function(resolve, reject) {
    that.fetchAccessToken()
      .then(function(data) {
        let url = _url + 'access_token=' + data.access_token
        if (!permanent) {
          url += '&type=' + type
        } else {
          form.access_token = data.access_token
          if (type === 'video') {
            form.description = JSON.stringify(form.description)
          }
        }
        console.log(url)

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
        if (Array.isArray(openIds)) {
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

        request({ method: 'POST', url: url, body: form, json: true })
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

        request({ url: url, json: true })
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

        request({ url: url, json: true })
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