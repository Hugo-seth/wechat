'use strict'

var fs = require('fs')
var mongoose = require('mongoose')

var dbUrl = 'mongodb://localhost/wechat'

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


//var menu = require('./wechat/menu')
//var instance = require('./wechat/wechatInstance')
//var wechatAPI = instance.getWechat()

/*wechatAPI.deleteMenu().then(function() {
  return wechatAPI.createMenu(menu)
})
.then(function(data) {
  console.log(data)
})*/
var User = mongoose.model('User')

var Koa = require('koa')
var app = new Koa()
var Router = require('koa-router')
var router = new Router()
var session = require('koa-session')
var bodyParser = require('koa-bodyparser')

var views = require('koa-views')

app.use(views(__dirname + '/app/views', {
  extension: 'jade'
}))

app.keys = ['wechat']
app.use(session(app))
app.use(bodyParser())

app.use(function *(next) {
  var user = this.session.user

  if (user && user._id) {
    this.session.user = yield User.findOne({_id: user._id}).exec()
    this.state.user = this.session.user
  } else {
    this.state.user = null
  }

  yield next
})

require('./config/routes')(router)

app
  .use(router.routes())
  .use(router.allowedMethods())

//app.use(server(config.wechat, handler.handlerRequest))

app.listen(1234)
console.log('Listening: 1234')

