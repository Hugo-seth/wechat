const fs = require('fs')
const Promise = require('bluebird')
const crypto = require('crypto')

exports.readFileAsync = function(fpath, encoding) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, encoding, function(err, content) {
      if (err) {
        reject(err)
      } else {
        resolve(content)
      }
    })
  })
}

exports.writeFileAsync = function(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const createNonce = function() {
  return Math.random().toString(36).substr(2, 15)
}

const createTimestamp = function() {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}

const _sign = function(noncestr, ticket, timestamp, url) {
  let params = [
    'noncestr=' + noncestr,
    'jsapi_ticket=' + ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ]
  let str = params.sort().join('&')
  let shasum = crypto.createHash('sha1')
  shasum.update(str)

  return shasum.digest('hex')
}

exports.sign = function(ticket, url) {
  let noncestr = createNonce()
  let timestamp = createTimestamp()
  let signature = _sign(noncestr, ticket, timestamp, url)

  return {
    noncestr: noncestr,
    timestamp: timestamp,
    signature: signature
  }
}