const Promise = require('bluebird')
const request = require('request')

module.exports = function(method, url, body, formData) {
  let options = {
    method: method,
    url: url,
    body: body,
    json: true
  }
  if (formData) {
    options.formData = formData
  }

  return new Promise(function(resolve, reject) {
    request(options)
      .then(Response => {
        console.log(response)
        resolve(response.body)
      })
      .catch(error => {
        console.error(error)
        reject(error)
      })
  })
}