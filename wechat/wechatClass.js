const fs = require('fs')
const Promise = require('bluebird')
const httpService = require('./httpService')
const wechatAPI = require('../config/config').wechatAPI

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
    const url = wechatAPI.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret

    return new Promise((resolve, reject) => {
      httpService('get', url)
        .then(data => {
          data.expires_in = new Date().getTime() + (data.expires_in - 20) * 1000
          that.writeAccessTokenFile(data)
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

        return Promise.resolve(data)
      })
  }

  updateSDKTicket() {
    const that = this

    return new Promise((resolve, reject) => {
      that.fetchAccessToken()
        .then(data => {
          var url = wechatAPI.SDKTicket.get + '&access_token=' + data.access_token

          httpService({ url: url, json: true })
            .then(data => {
              const ticket = {}
              ticket.SDKTicket_expires_in = new Date().getTime() + (data.expires_in - 20) * 1000
              ticket.SDKTicket = data.ticket

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

Wechat.prototype.uploadMaterial = function(type, material, isPermanent, options) {
  let url
  if (type === 'news') {
    var body = material
    url = wechatAPI.permanentMaterial.addNews
  } else {
    var formData = options ? Object.assign({}, options) : {}
    if (type === 'newsImg') {
      url = wechatAPI.permanentMaterial.addNewsImg
    } else if (isPermanent) {
      url = wechatAPI.permanentMaterial.addMaterial
      formData.type = type
    } else {
      url = wechatAPI.tempMaterial.uploadMedia + 'type=' + type
    }
    if (type === 'video') {
      formData.description = JSON.stringify(formData.description)
    }
    formData.media = fs.createReadStream(material)
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(data => {
        url += '&access_token=' + data.access_token
        console.log(url)

        httpService('POST', url, body, formData)
          .then(data => {
            resolve(data)
          })
      })
  })
}

Wechat.prototype.getMaterial = function(mediaId, isPermanent, type) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(data => {
        let url
        if (isPermanent) {
          url = wechatAPI.permanentMaterial.getMaterial
          var body = { media_id: mediaId }
        } else {
          url = wechatAPI.tempMaterial.getMedia + 'media_id=' + mediaId
          if (type === 'video') {
            url = url.replace('https', 'http')
          }
        }
        url += '&access_token=' + data.access_token
        console.log(url)

        httpService('POST', url, body)
          .then(data => {
            resolve(data)
          })
      })
  })
}

// Wechat.prototype.count = function() {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.permanent.count + 'access_token=' + data.access_token
//         console.log(url)

//         httpService({ method: 'GET', url: url, json: true })
//           .then(function(response) {
//             var materialNums = response.body
//             console.log(materialNums)
//             if (materialNums) {
//               resolve(materialNums)
//             } else {
//               throw new Error('countMaterial fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })

//   })

// }

// Wechat.prototype.getMaterialList = function(options) {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.permanent.getMaterialList + 'access_token=' + data.access_token
//         console.log(url)

//         httpService({ method: 'POST', url: url, body: options, json: true })
//           .then(function(response) {
//             var materialList = response.body
//             console.log(materialList)
//             if (materialList) {
//               resolve(materialList)
//             } else {
//               throw new Error('getMaterialList fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })

//   })

// }

// Wechat.prototype.createGroup = function(name) {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.group.create + 'access_token=' + data.access_token
//         console.log(url)

//         var options = {
//           group: {
//             name: name
//           }
//         }

//         httpService({ method: 'POST', url: url, body: options, json: true })
//           .then(function(response) {
//             var group = response.body
//             console.log(group)
//             if (group) {
//               resolve(group)
//             } else {
//               throw new Error('createGroup fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })

//   })

// }

// Wechat.prototype.getGroup = function() {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.group.get + 'access_token=' + data.access_token
//         console.log(url)

//         httpService({ url: url, json: true })
//           .then(function(response) {
//             var groups = response.body
//             console.log(groups)
//             if (groups) {
//               resolve(groups)
//             } else {
//               throw new Error('getGroups fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })

//   })

// }

// Wechat.prototype.getUserInfo = function(openIds) {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {

//         var url
//         var options = {
//           json: true
//         }
//         if (Array.isArray(openIds)) {
//           url = wechatAPI.user.batchGet + '&access_token=' + data.access_token
//           options.method = 'POST'
//           options.body = {
//             user_list: openIds
//           }
//         } else {
//           url = wechatAPI.user.getUserInfo + '&access_token=' + data.access_token + '&openid=' + openIds
//         }
//         console.log(url)
//         options.url = url

//         httpService({ url: url, json: true })
//           .then(function(response) {
//             var userInfo = response.body
//             console.log(userInfo)
//             if (userInfo) {
//               resolve(userInfo)
//             } else {
//               throw new Error('getUserInfo fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })
//   })
// }

// Wechat.prototype.sendMessage = function(message, type, groupId) {
//   var that = this

//   var form = {
//     msgtype: type
//   }
//   form[type] = message
//   if (groupId) {
//     form.filter = {
//       is_to_all: false,
//       group_id: groupId
//     }
//   } else {
//     form.filter = {
//       is_to_all: true
//     }
//   }
//   console.log(form)

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.message.sendAll + 'access_token=' + data.access_token

//         httpService({ method: 'POST', url: url, body: form, json: true })
//           .then(function(response) {
//             var result = response.body
//             console.log(result)
//             if (result) {
//               resolve(result)
//             } else {
//               throw new Error('sendMessage fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })

//   })

// }

// Wechat.prototype.createMenu = function(menu) {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.menu.create + 'access_token=' + data.access_token
//         console.log(url)

//         httpService({ method: 'POST', url: url, body: menu, json: true })
//           .then(function(response) {
//             var menu = response.body
//             console.log(menu)
//             if (menu) {
//               resolve(menu)
//             } else {
//               throw new Error('createMenu fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })
//   })
// }

// Wechat.prototype.getMenu = function() {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.menu.get + 'access_token=' + data.access_token
//         console.log(url)

//         httpService({ url: url, json: true })
//           .then(function(response) {
//             var menu = response.body
//             console.log(menu)
//             if (menu) {
//               resolve(menu)
//             } else {
//               throw new Error('getMenu fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })

//   })

// }

// Wechat.prototype.deleteMenu = function() {
//   var that = this

//   return new Promise(function(resolve, reject) {
//     that.fetchAccessToken()
//       .then(function(data) {
//         var url = wechatAPI.menu.del + 'access_token=' + data.access_token
//         console.log(url)

//         httpService({ url: url, json: true })
//           .then(function(response) {
//             var result = response.body
//             console.log(result)
//             if (result) {
//               resolve(result)
//             } else {
//               throw new Error('deleteMenu fails')
//             }
//           })
//           .catch(function(err) {
//             reject(err)
//           })
//       })
//   })
// }

module.exports = Wechat