const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')

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
  let movies = []
  const result = await doubanApi('get', '/search?q=' + encodeURIComponent(query))

  if (result && result.subjects && result.subjects.length > 0) {
    let subjects = result.subjects.slice(0, 10)
    for (let item of subjects) {
      let director = item.directors ? item.directors[0] : ''
      movies.push({
        director: director ? director.name : '',
        title: item.title,
        doubanId: item.id,
        doubanUrl: item.alt,
        poster: item.images.large,
        year: item.year,
        genres: item.genres || [],
        rating: item.rating ? item.rating.average : ''
      })
    }
    saveToDB(movies)
  }
  return movies
}

async function saveToDB(movies) {
  for (let item of movies) {
    let movie = await Movie.findOne({ doubanId: item.doubanId }).exec()
    if (!movie) {
      movie = await new Movie(item).save()
      if (item.genres.length > 0) {
        for (let genre of item.genres) {
          let category = await Category.findOne({ name: genre }).exec()
          if (category) {
            category.movies.push(movie._id)
            await category.save()
          } else {
            newCategory = new Category({
              name: genre,
              movies: [movie._id]
            })
            category = await newCategory.save()
          }
          movie.category.push(category._id)
        }
      }

      await movie.save()
    }
  }
}