const Promise = require('bluebird')
const request = require('request-promise')

const baseUrl = 'https://api.douban.com/v2/movie'

module.exports = function(method, url, body) {
  let options = {
    method: method,
    url: baseUrl + url,
    json: true
  }
  if (body) {
    options.body = body
  }

  return new Promise(function(resolve, reject) {
    request(options)
      .then(response => {
        // console.log(response)
        resolve(response)
      })
      .catch(error => {
        console.error(error)
        reject(error)
      })
  })
}