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
    <Content><![CDATA[<%= content %>]]></Content>
  <% } else if (responseType === 'image') { %>
    <Image>
      <MediaId><![CDATA[<%= content %>]]></MediaId>
    </Image>
  <% } else if (responseType === 'news') { %>
  <ArticleCount><% content.length %></ArticleCount>
  <Articles>
    <% content.forEach(function(item) { %>
      <item>
        <Title><![CDATA[<%= item.title %>]]></Title> 
        <Description><![CDATA[<%= item.description1 %>]]></Description>
        <PicUrl><![CDATA[<%= item.picurl %>]]></PicUrl>
        <Url><![CDATA[<%= item.url %>]]></Url>
      </item>
    <% }) %>
  </Articles>
  <% } else if (responseType === 'video') { %>
  <Video>
    <MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
    <Title><![CDATA[<%= content.title %>]]></Title>
    <Description><![CDATA[<%= content.description %>]]></Description>
  </Video>
  <% } %>
  </xml>
*/})

var compiled = ejs.compile(tpl)

exports = module.exports = {
  compiled: compiled
}