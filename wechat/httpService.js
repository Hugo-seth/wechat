const Promise = require('bluebird')
const request = require('request-promise')

module.exports = function(method, url, body, formData) {
  let options = {
    method: method,
    url: url,
    json: true
  }
  if (body) {
    options.body = body
  }
  if (formData) {
    options.formData = formData
  }

  return new Promise(function(resolve, reject) {
    request(options)
      .then(response => {
        console.log(response)
        resolve(response)
      })
      .catch(error => {
        console.error(error)
        reject(error)
      })
  })
}