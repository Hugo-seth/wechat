'use strict'

var Koa = require('koa')
var wechat = require('./wechat/g')
var config = require('./config/config')
var handler = require('./wechat/handlerRequest')

var app = new Koa()

app.use(wechat(config.wechat, handler.handlerRequest))
//
app.listen(1234)
console.log('Listening: 1234')