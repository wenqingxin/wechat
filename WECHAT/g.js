'use strict'
//const request = Promise.promisify(require('request'));
const sha1 = require('sha1');
const WeChat = require('./wechat');
const getRawBody = require('raw-body');
const util = require('./util');
module.exports = function (opts,handler) {
    console.log('初始化')
    var whchat = new WeChat(opts);
    return async function (ctx,next) {
        console.log(ctx.query);
        let token = opts.token;
        let signature = ctx.query.signature;
        let echostr = ctx.query.echostr;
        let timestamp = ctx.query.timestamp;
        let nonce = ctx.query.nonce;
        let str = [token,timestamp,nonce].sort().join('');
        str = sha1(str);

        if(ctx.method === 'GET'){
            if(str == signature ){
                ctx.body = echostr;
            }else{
                ctx.body = 'error';
            }
        }else if(ctx.method === 'POST'){
            if(str != signature ){
                ctx.body = 'error';
                return false;
            }
            let data = await getRawBody(ctx.req,{
                length:ctx.length,
                limit:'1mb',
                encoding:ctx.charset
            })
            let content = await util.parseXMLAsync(data);
            console.log(content);
            let message = util.formatMessage(content.xml)
            console.log(message);
            ctx.weixin = message;
            await handler.call(ctx,ctx,next);
            whchat.reply.call(ctx);
        }
    }
}