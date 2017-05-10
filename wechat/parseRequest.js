const Promise = require('bluebird')
const getRawBody = require('raw-body')
const parseXML = require('./parseRequestXML')

module.exports = async function(stream, request) {
  const xml = await getRawBody(stream, {
    length: stream.length,
    limit: '1mb',
    encoding: request.charset
  })

  // console.log(xml.toString())
  const content = await parseXML.parseXML(xml)
  const message = parseXML.formatMessage(content.xml)

  return Promise.resolve(message)
}