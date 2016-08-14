'use strict'

var ejs = require('ejs')
var heredoc = require('heredoc')

var tpl = heredoc(function() {/*
  <xml>
  <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
  <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
  <CreateTime><%= createTime %></CreateTime>
  <MsgType><![CDATA[<%= responseType %>]]></MsgType>
  <% if (responseType === 'text') { %>
    <Content><![CDATA[<%= content.text %>]]></Content>
  <% } else if (responseType === 'image') { %>
    <Image>
      <MediaId><![CDATA[<%= content.img %>]]></MediaId>
    </Image>
  <% } else if (responseType === 'news') { %>
  <ArticleCount><%= content.news.length %></ArticleCount>
  <Articles>
    <% content.news.forEach(function(item) { %>
      <item>
        <Title><![CDATA[<%= item.title %>]]></Title> 
        <Description><![CDATA[<%= item.description %>]]></Description>
        <PicUrl><![CDATA[<%= item.picurl %>]]></PicUrl>
        <Url><![CDATA[<%= item.url %>]]></Url>
      </item>
    <% }) %>
  </Articles>
  <% } else if (responseType === 'video') { %>
  <Video>
    <MediaId><![CDATA[<%= content.video %>]]></MediaId>
    <Title><![CDATA[<%= content.title %>]]></Title>
    <Description><![CDATA[<%= content.description %>]]></Description>
  </Video>
  <% } else if (responseType === 'music') { %>
  <Music>
    <Title><![CDATA[<%= content.title %>]]></Title>
    <Description><![CDATA[<%= content.description %>]]></Description>
    <MusicUrl><![CDATA[<%= content.music %>]]></MusicUrl>
    <ThumbMediaId><![CDATA[<%= content.img %>]]></ThumbMediaId>
  </Music>
  <% } %>
  </xml>
*/})

var compiled = ejs.compile(tpl)

exports = module.exports = {
  compiled: compiled
}