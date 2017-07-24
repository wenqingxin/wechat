const request = require('request');
const util = require('./util');
const fs = require('fs');
const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    access_token:prefix+'token?grant_type=client_credential',
    temporary:{
        upload:prefix+'media/upload?',
    },
    permanent:{
        upload:prefix+'material/add_material',
        uploadNews:prefix+'material/add_news',
        uploadNewsPic:prefix+'media/uploadimg'
    }
}
function WeChat(opts) {
    this.appID= opts.appID;
    this.appSecret= opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.fetchAccessToken();
}
WeChat.prototype.validAccessToken = function (data) {
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    var expires_in = data.expires_in;
    var now = (new Date().getTime());
    if(now < expires_in){
        return true
    }else{
        return false;
    }

};
WeChat.prototype.updateAccessToken = function (data) {
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.access_token+'&appid='+appID+'&secret='+appSecret;

    return new Promise(function (resolve,reject) {
        request({url:url,json:true}, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            let now = new Date().getTime();
            body.expires_in = now + (body.expires_in - 20)*1000;
            resolve(body);
        });
    })

};
WeChat.prototype.uploadMaterial = function (type,material,permanent) {
    let form = {
    };
    let uploadUrl = api.temporary.upload;
    if(permanent){
        uploadUrl = api.permanent.upload;
        Object.assign(form,permanent)
    }
    if(type === 'pic'){
        uploadUrl = api.permanent.uploadNewsPic;
    }
    if(type === 'news'){
        uploadUrl = api.permanent.uploadNews;
        form = material;//数组
    }else{
        form.media = fs.createReadStream(material);
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = uploadUrl+'access_token='+data.access_token;
            if(!permanent){
                url = url+'&type='+type;
            }else{
                form.access_token = data.access_token;
            }
            let options = {
                method:'POST',
                url:url,
                json:true,
            }
            if(type === 'news'){
                options.body  = form;
            }else{
                options.formData  = form;
            }
            request(options, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })

};
WeChat.prototype.fetchAccessToken = function () {
    if(this.access_token &&  this.expires_in){
        if(this.validAccessToken(this)){
            return Promise.resolve(this);
        }
    }
    this.getAccessToken()
        .then( data=> {
        try{
            data = JSON.parse(data);
        }catch (e){
            return this.updateAccessToken();
        }
        if(this.validAccessToken(data)){
            return Promise.resolve(data);
        }else{
            return this.updateAccessToken();
        }
    }).then(data => {
        this.access_token = data.access_token;
        this.expires_in = data.expires_in;
        this.saveAccessToken(data);
        return Promise.resolve(data);
    })
};
WeChat.prototype.reply = function () {
    let content = this.body;
    let message = this.weixin;

    let xml = util.tpl(content,message);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
    console.log('回复xml:',xml)
};
module.exports = WeChat;