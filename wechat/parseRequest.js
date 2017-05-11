const Promise = require('bluebird')
const xml2js = require('xml2js')
const getRawBody = require('raw-body')

module.exports = async function(stream, request) {
  const xml = await getRawBody(stream, {
    length: stream.length,
    limit: '1mb',
    encoding: request.charset
  })

  // console.log(xml.toString())
  const content = await parseXML(xml)
  const message = formatMessage(content.xml)

  return Promise.resolve(message)
}

async function parseXML(xml) {
  return new Promise(function(resolve, reject) {
    xml2js.parseString(xml, { trim: true }, function(err, content) {
      if (err) return reject(err)
      resolve(content)
    })
  })
}

function formatMessage(data) {
  let message = {}
  if (typeof data === 'object') {
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let item = data[keys[i]]
      let key = keys[i]

      if (Array.isArray(item)) {
        item.length === 0 ? message[key] = '' : message[key] = item[0]
      } else {
        message[key] = item
      }
    }
  }
  return message
}