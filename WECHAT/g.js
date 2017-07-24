'use strict'
//const request = Promise.promisify(require('request'));
const sha1 = require('sha1');
const WeChat = require('./wechat');
const getRawBody = require('raw-body');
const util = require('./util');
module.exports = function (opts,handler) {
    console.log('初始化')
    var whchat = new WeChat(opts);
    return function *(next) {
        console.log(this.query);
        let token = opts.token;
        let signature = this.query.signature;
        let echostr = this.query.echostr;
        let timestamp = this.query.timestamp;
        let nonce = this.query.nonce;
        let str = [token,timestamp,nonce].sort().join('');
        str = sha1(str);

        if(this.method === 'GET'){
            if(str == signature ){
                this.body = echostr;
            }else{
                this.body = 'error';
            }
        }else if(this.method === 'POST'){
            if(str != signature ){
                this.body = 'error';
                return false;
            }
            let data = yield getRawBody(this.req,{
                length:this.length,
                limit:'1mb',
                encoding:this.charset
            })
            let content = yield util.parseXMLAsync(data);
            console.log(content);
            let message = util.formatMessage(content.xml)
            console.log(message);
            this.weixin = message;
            yield handler.call(this,next);
            whchat.reply.call(this);
        }
    }
}