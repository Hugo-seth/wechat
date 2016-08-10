'use strict'

var sha1 = require('sha1')

function Wechat(opts) {
  var that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.getAccessToken()
    .then(function(data) {
      try {
        data = JSON.parse(data)
      } catch(e) {
        return that.updateAccessToken()
      }

      
    })
}

module.exports = function(opts) {
  return function* (next) {
    console.log(this.query)

    var token = opts.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr

    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    if (sha === signature) {
      this.body = echostr + ''
    } else {
      this.body = 'wrong'
    }
  }
}