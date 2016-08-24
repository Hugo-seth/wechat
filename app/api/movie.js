var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var koa_request = require('koa-request')

// index page
exports.findAll = function *() {
  var categories = Category
    .find({})
    .populate({
      path: 'movies',
      select: 'title poster',
      options: { limit: 6 }
    })
    .exec()

  return categories

}

// search page
exports.searchByCategory = function *(catId) {
  var categories = Category
    .find({_id: catId})
    .populate({
      path: 'movies',
      select: 'title poster',
    })
    .exec()

  return categories
}

exports.searchByName = function *(q) {
  var movies = yield Movie
    .find({title: new RegExp(q + '.*', 'i')})
    .exec()     

  return movies
}

exports.searchByDouban = function *(q) {
  
  var options = {
    url: 'https://api.douban.com/v2/movie/search?q=' + encodeURIComponent(q)
  }

  var response = yield koa_request(options)
  var data = JSON.parse(response.body)
  var subjects = []

  if (data && data.subjects) {
    subjects = data.subjects
  }

  return subjects
}