const sha1 = require('sha1')

var config = require('../../config/config')
var parseRequest = require('../../wechat/parseRequest')
var handleRequest = require('../../wechat/handleRequest')
var handleResponse = require('../../wechat/handleResponse')

module.exports = async function(ctx, next) {
  const token = config.wechat.token
  const signature = ctx.query.signature
  const nonce = ctx.query.nonce
  const timestamp = ctx.query.timestamp
  const echostr = ctx.query.echostr

  const str = [token, timestamp, nonce].sort().join('')
  const sha = sha1(str)

  if (sha !== signature) {
    ctx.body = 'Bad Request'
    return false
  }
  ctx.body = ''

  // ctx.req is node origin request
  const requestData = await parseRequest(ctx.req, ctx.request)
    // console.log(requestData)

  const responseData = await handleRequest(requestData)
    // console.log(responseData)

  const xml = await handleResponse.convertToXML(requestData, responseData)
  console.log(xml)

  ctx.status = 200
  ctx.type = 'application/xml'
  ctx.body = xml
}