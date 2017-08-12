'use strict'
const util = require('./libs/util');
const path = require('path');
const wechat_file = path.join(__dirname,'./config/wechat.txt')
const wechat_ticket_file = path.join(__dirname,'./config/wechatTicket.txt')
const config = {
    wechat:{
/*        appID:'wxc5f62c93cc6b0686',
        appSecret:'2baecfe12069675c70fa49dfe5460ad7',*/
        appID:'wx4be8ebbc8c255500',//测试账号
        appSecret:'b03ac1acbed0d7e5550854eaf9835245',//测试账号
        token:'Iamareallyskinnyboy',
        myService:'http://112.74.182.219:1234',
        getAccessToken:function () {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken:function (data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data)
        },
        getTicket:function () {
            return util.readFileAsync(wechat_ticket_file)
        },
        saveTicket:function (data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_ticket_file,data)
        }
    }
}
module.exports = config;

