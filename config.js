'use strict'
const util = require('./libs/util');
const path = require('path');
const wechat_file = path.join(__dirname,'./config/wechat.txt')
const config = {
    wechat:{
        appID:'wx4be8ebbc8c255500',
        appSecret:'b03ac1acbed0d7e5550854eaf9835245',
        token:'Iamareallyskinnyboy',
        getAccessToken:function () {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken:function (data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data)
        }
    }
}
module.exports = config;

