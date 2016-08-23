'use strict'

var server = require('./wechat/g')
var config = require('./config/config')
var handler = require('./wechat/handlerRequest')

var mongoose = require('mongoose')

var dbUrl = 'mongodb://localhost/imooc'

mongoose.connect(dbUrl)

// models loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)


var menu = require('./wechat/menu')
var instance = require('./wechat/wechat-instance')
var wechatAPI = instance.getWechat()

/*wechatAPI.deleteMenu().then(function() {
  return wechatAPI.createMenu(menu)
})
.then(function(data) {
  console.log(data)
})*/

var app = new Koa()
var Router = require('koa-router')
var router = new Router()
var voiceSearch = require('./app/controllers/voiceSearch')

router.get('/movie', voiceSearch.movie)

app
  .use(router.router())
  .use(router.allowMethods())

app.use(server(config.wechat, handler.handlerRequest))

app.listen(1234)
console.log('Listening: 1234')

