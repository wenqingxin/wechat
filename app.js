'use strict'

const Koa = require('koa');
const wechat = require('./wechat/g');
const config = require('./config')
const weixin =require('./weixin')
const app = Koa();
app.use(wechat(config.wechat,weixin.reply));
app.listen(1234);
console.log('Listening:1234');