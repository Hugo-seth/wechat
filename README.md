wechat by node
The config.js that app.js required is exports a object which has a property named wechat, The wachat object has 3 properties: appID、appSecret and token,you can get them in https://mp.weixin.qq.com/.

app.js require的config.js就只暴露了一个包含wechat属性的对象，wechat属性是一个包含appID、appSecret和token 3个属性的对象。你可以在你自己的公众号里（https://mp.weixin.qq.com/）获得，或者在微信开发者文档里申请测试号（https://mp.weixin.qq.com/wiki/home/index.html）。