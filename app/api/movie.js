const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')

const co = require('co')
const doubanApi = require('../api/douban')

mongoose.Promise = Promise

// index page
exports.findAllCategories = async function() {
  return Category
    .find({})
    .populate({
      path: 'movies',
      select: 'title poster',
      options: { limit: 6 }
    })
    .exec()
}

// search
exports.searchByName = async function(q) {
  return Movie
    .find({ title: new RegExp(q + '.*', 'i') })
    .exec()
}

exports.searchById = async function(id) {
  return Movie
    .findOne({ _id: id })
    .exec()
}

exports.searchByDouban = async function(query) {
  console.log('search douban')

  doubanApi('get', 'https://api.douban.com/v2/movie/search', { q: query })

  // var response = yield koaRequest(options)
  // var data = JSON.parse(response.body)
  // var subjects = []
  // var movies = []

  // if (data && data.subjects) {
  //   subjects = data.subjects.slice(0, 10)
  // }

  // if (subjects.length > 0) {
  //   var queryArray = []

  //   subjects.forEach(function(item) {
  //     queryArray.push(function*() {
  //       var movie = yield Movie.findOne({ doubanId: item.id })

  //       if (movie) {
  //         movies.push(movie)
  //       } else {
  //         var directors = item.directors || []
  //         var director = directors[0] || {}

  //         movie = new Movie({
  //           director: director.name || '',
  //           title: item.title,
  //           doubanId: item.id,
  //           poster: item.images.large,
  //           year: item.year,
  //           genres: item.genres || []
  //         })

  //         movie = yield movie.save()
  //         movies.push(movie)
  //       }
  //     })
  //   })

  //   yield queryArray

  //   movies.forEach(function(item) {
  //     updateMovies(item)
  //   })

  // }
  // return movies
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
    var stars = []
    data.casts.forEach(function(cast) {
      stars.push(cast.name)
    })
    Object.assign(item, {
      rating: data.rating.average,
      country: data.countries[0],
      language: data.languages ? data.languages[0] : '',
      summary: data.summary,
      stars: stars,
      doubanUrl: data.mobile_url
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
            var movie = yield Category.findOne({ movies: item._id }).exec()
            if (!movie) {
              cat.movies.push(item._id)
              yield cat.save()
            }
          } else {
            console.log('cate not exist')
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