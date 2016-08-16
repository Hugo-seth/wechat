'use strict'

module.exports = {

  button: [{
    type: 'click',
    name: '点击事件',
    key: 'button1 click'
  }, {
    name: '点出菜单',
    sub_button: [{
      type: 'view',
      name: '搜索',
      url: 'https://github.com'
    }, {
      type: 'scancode_push',
      name: '扫码',
      key: 'scancode_push'
    }, {
      type: 'scancode_waitmsg',
      name: '扫码推送',
      key: 'scancode_waitmsg'
    }, {
      type: 'pic_sysphoto',
      name: '弹出系统拍照',
      key: 'pic_sysphoto'
    }, {
      type: 'pic_photo_or_album',
      name: '弹出拍照或者相册',
      key: 'pic_photo_or_album'
    }]
  }, {
    name: '点出菜单2',
    sub_button: [{
      type: 'pic_weixin',
      name: '弹出微信相册',
      key: 'pic_weixin'
    }, {
      type: 'location_select',
      name: '弹出地理位置',
      key: 'location_select'
    }, {
      type: 'media_id',
      name: '发素材图',
      media_id: 'BxY9DCQShdYAJf_qI21taqfFb5ZBH-UVaSG6Yh9AoTk'
    }, {
      type: 'media_id',
      name: '发素材视频',
      media_id: 'BxY9DCQShdYAJf_qI21tas4Q0kHU5UdBt3NqE-YpaTE'
    }, {
      type: 'view_limited',
      name: '发素材图文',
      media_id: 'BxY9DCQShdYAJf_qI21tavnpwCeA9hvRXFANx4Blry8'
    }]
  }]

}