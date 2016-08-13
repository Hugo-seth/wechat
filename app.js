'use strict'

var Koa = require('koa')
var server = require('./wechat/g')
var config = require('./config/config')
var handler = require('./wechat/handlerRequest')

var app = new Koa()

app.use(server(config.wechat, handler.handlerRequest))
//
app.listen(1234)
console.log('Listening: 1234')