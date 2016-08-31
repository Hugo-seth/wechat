'use strict'

module.exports = {

  button: [{
    name: '排行榜',
    sub_button: [{
      type: 'click',
      name: '评分最高的五十部电影',
      key: 'high_fifty_rating'
    }, {
      type: 'click',
      name: '最新的二十部电影',
      key: 'new_twenty'
    }]
  }, {
    name: '分类',
    sub_button: [{
      type: 'click',
      name: '动作',
      key: 'action_movies'
    }, {
      type: 'click',
      name: '科幻',
      key: 'science_fiction_movies'
    }, {
      type: 'click',
      name: '悬疑',
      key: 'suspense_movies'
    }]
  }, {
    name: '帮助',
    type: 'click',
    key: 'help'
  }]

}