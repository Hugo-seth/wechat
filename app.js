const fs = require('fs')
const mongoose = require('mongoose')
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const views = require('koa-views')
const serve = require('koa-static')

const dbUrl = 'mongodb://localhost/wechat'

mongoose.connect(dbUrl)

// models loading
const models_path = __dirname + '/app/models'
const walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      let newPath = path + '/' + file
      let stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      } else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)

const app = new Koa()
const router = new Router()

app.use(serve(__dirname + '/app/static'))

app.use(views(__dirname + '/app/views', {
  extension: 'pug'
}))

app.use(bodyParser())

app.use(async(ctx, next) => {
  const start = new Date()

  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${decodeURIComponent(ctx.url)} - ${ms}ms`)
})

require('./config/routes')(router)

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(1234)
console.log('Listening: 1234')