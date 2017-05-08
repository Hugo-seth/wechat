const Promise = require('bluebird')
const Axios = require('axios')

module.exports = function(method, url, params, body) {
  let options = {
    method: method,
    url: url,
    params: Object.assign({}, params),
    data: body
  }

  return new Promise(function(resolve, reject) {
    Axios(options)
      .then(Response => {
        console.log(response)
          // if (response.status === 200) {
          //   resolve(response.data)
          // } else {
          //   reject(response.statusText.toString())
          // }
      })
      .catch(error => {
        console.log(error)
          // if (error.response) {
          //   // The request was made, but the server responded with a status code
          //   // that falls out of the range of 2xx
          //   //console.log(error.response.data)
          //   //console.log(error.response.headers)
          //   console.log(error.response.status)
          //   reject(error.response.status.toString())
          // } else {
          //   // Something happened in setting up the request that triggered an Error
          //   console.log('Error', error.message)
          //   reject(error.message.toString())
          // }
      })
  })
}