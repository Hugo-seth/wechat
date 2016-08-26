var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var koa_request = require('koa-request')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var _ = require('lodash')
var co = require('co')

// index page
exports.findAll = function*() {
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
exports.searchByCategory = function*(catId) {
  var categories = Category
    .find({ _id: catId })
    .populate({
      path: 'movies',
      select: 'title poster',
    })
    .exec()

  return categories
}

exports.searchByName = function*(q) {
  var movies = yield Movie
    .find({ title: new RegExp(q + '.*', 'i') })
    .exec()

  return movies
}

exports.searchById = function*(id) {
  var movie = yield Movie
    .findOne({ _id: id })
    .exec()

  return movie
}

function updateMovies(item) {
  console.log('search douban detail')
  var options = {
    url: 'https://api.douban.com/v2/movie/subject/' + item.doubanId,
    json: true
  }

  request(options).then(function(response) {
    var data = response.body
      //console.log(data)

    _.extend(item, {
      country: data.countries[0],
      language: data.languages ? data.languages[0] : '',
      summary: data.summary
    })

    var genres = item.genres
    if (!item.category) {
      item.category = []
    }

    if (genres && genres.length > 0) {
      var cateArray = []

      genres.forEach(function(genre) {
        cateArray.push(function*() {
          var cat = yield Category.findOne({ name: genre }).exec()

          if (cat) {
            console.log('cate already')
            cat.movies.push(item._id)
            yield cat.save()
          } else {
            console.log('cate exit')
            cat = new Category({
              name: genre,
              movies: [item._id]
            })
            cat = yield cat.save()
          }

          item.category.push(cat._id)

        })
      })

      co(function*() {
        yield cateArray
        yield item.save()
      })

    } else {
      item.save()
    }

  })
}

exports.searchByDouban = function*(q) {
  console.log('search douban')

  var options = {
    url: 'https://api.douban.com/v2/movie/search?q=' + encodeURIComponent(q)
  }

  var response = yield koa_request(options)
  var data = JSON.parse(response.body)
  var subjects = []
  var movies = []

  if (data && data.subjects) {
    subjects = data.subjects
  }

  if (subjects.length > 0) {
    var queryArray = []

    subjects.forEach(function(item) {
      queryArray.push(function*() {
        var movie = yield Movie.findOne({ doubanId: item.id })

        if (movie) {
          movies.push(movie)
        } else {
          var directors = item.directors || []
          var director = directors[0] || {}

          movie = new Movie({
            director: director.name || '',
            title: item.title,
            doubanId: item.id,
            poster: item.images.large,
            year: item.year,
            genres: item.genres || []
          })

          //movie = yield movie.save()
          movies.push(movie)
        }
      })
    })

    yield queryArray

    /*movies.forEach(function(item) {
      updateMovies(item)
    })*/
    updateMovies(movies[0])

  }

  return movies

}