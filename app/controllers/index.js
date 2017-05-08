const movieApi = require('../api/movie')

// index page
exports.index = async function(ctx, next) {
  let categories = await movieApi.findAllCategories()

  await ctx.render('pages/index', {
    title: '电影爱好者 首页',
    categories: categories
  })
}