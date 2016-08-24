'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var parseXML = require('./parseXML')
var instance = require('./wechatInstance')

module.exports = function(opts, handlerRequest) {

  var wechatAPI = instance.getWechat()

  return function*(next) {
    console.log(this.query)
    var that = this
    //console.log(this)

    var token = opts.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr

    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    if (this.method === 'GET') {
      if (sha === signature) {
        this.body = echostr + ''
        console.log('right request')
      } else {
        this.body = 'wrong'
      }
    } else if (this.method === 'POST') {
      if (sha !== signature) {
        this.body = 'wrong'
        return false
      }

      var data = yield getRawBody(this.req, {
        length: this.length,
        limit: '1mb',
        encoding: this.charset
      })

      //console.log(data.toString())

      var content = yield parseXML.parseXMLAsync(data)

      //console.log(content)

      var message = parseXML.formatMessage(content.xml)

      console.log(message)

      this.body = ''

      /*if (message.MsgType === 'text') {

        var now = new Date().getTime()

        that.status = 200
        that.type = 'application/xml'
        that.body = '<xml><ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName><FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName><CreateTime>' + now + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[来了，请坐]]></Content></xml>'

      }
      console.log(that.body)*/

      this.request = message
      this.myResponse = {}

      yield handlerRequest.call(this, next)

      wechatAPI.response.call(this)

      //console.log(this.status)
    }

  }
}