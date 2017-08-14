const request = require('request');
const util = require('./util');
const fs = require('fs');
const prefix = 'https://api.weixin.qq.com/cgi-bin/';

const api = {
    access_token:prefix+'token?grant_type=client_credential',
    temporary:{
        upload:prefix+'media/upload',
        fetch:prefix+'media/get'
    },
    permanent:{
        upload:prefix+'material/add_material',
        uploadNews:prefix+'material/add_news',
        uploadNewsPic:prefix+'media/uploadimg',
        fetch:prefix+'material/get_material',
        delete:prefix+'material/del_material',
        update:prefix+'material/update_news',
        count:prefix+'material/get_materialcount',
        batch:prefix+'material/batchget_material'
    },
    tags:{
        create:prefix + 'tags/create',
        fetch:prefix + 'tags/get',
        update:prefix + 'tags/update',
        batchtagging:prefix + 'tags/members/batchtagging',
        batchuntagging:prefix + 'tags/members/batchuntagging',
        delete:prefix + 'tags/delete',
        getTagUsers:prefix + 'user/tag/get',
        getTagOnUser:prefix+'tags/getidlist'
    },
    user:{
        remark:prefix+'user/info/updateremark',
        fetch:prefix+'user/info',
        batchFetch:prefix+'user/info/batchfetch',
    },
    mass:{
        tag:prefix+'message/mass/sendall'
    },
    menu:{
        create:prefix+'menu/create',
        get:prefix+'menu/get',
        delete:prefix+'menu/delete',
    },
    qrCode:{
        create:prefix+'qrcode/create'
    },
    semantic:{
        query:'https://api.weixin.qq.com/semantic/semproxy/search'
    },
    jsapi:{
        getTicket:prefix+'ticket/getticket?type=jsapi'
    }
}
function WeChat(opts) {
    this.appID= opts.appID;
    this.appSecret= opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getTicket = opts.getTicket;
    this.saveTicket = opts.saveTicket;
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
            let url = uploadUrl+'?access_token='+data.access_token;
            if(!permanent){
                url = url+'&type='+type;
            }else{
                form.access_token = data.access_token;
            }
            let options = {
                method:'POST',
                url:url,
                json:true,
                formData:form
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
                if(error) console.log(error)
            });
        });

    })

};
WeChat.prototype.fetchMaterial = function (mediaId,type,permanent) {
    let fetchUrl = api.temporary.fetch;
    if(permanent){
        fetchUrl = api.permanent.fetch;
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = fetchUrl+'?access_token='+data.access_token+'&media_id='+mediaId;
            let options = {method:'POST',url,json:true};
            let form = {
            }
            if(permanent){
                form = {
                    media_id:mediaId,
                    access_token:data.access_token
                }
                Object.assign(options.body,form);
            }else{
                if(type == 'video'){
                    options.url = url.replace('https://','https://')
                }
                options.url+='&media_id='+mediaId
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
WeChat.prototype.countMaterial = function () {
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.permanent.count+'?access_token='+data.access_token;
            request({method:'GET',url,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })

};
WeChat.prototype.batchMaterial = function (options) {
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 2
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.permanent.batch+'?access_token='+data.access_token;
            request({method:'POST',url,json:true,body:options}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })

};
WeChat.prototype.deleteMaterial = function (mediaId) {
    let form = {
        media_id:mediaId
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.permanent.delete+'?access_token='+data.access_token+'&media_id='+mediaId;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })

};
WeChat.prototype.updateMaterial = function (mediaId,news) {
    let form = {
        media_id:mediaId
    }
    Object.assign(form,news)
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.permanent.update+'?access_token='+data.access_token+'&media_id='+mediaId;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
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
    return this.getAccessToken()
        .then( data=> {
        try{
            data = JSON.parse(data);
        }catch (e){
            console.log(e)
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

WeChat.prototype.createTag = function (name) {
    let form = {
        name
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.tags.create+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};
WeChat.prototype.fetchTags = function () {
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.tags.fetch+'?access_token='+data.access_token;
            request({method:'GET',url,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};

WeChat.prototype.getTagOnUser = function (openid) {
    let form = {
        openid
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.tags.getTagOnUser+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};
WeChat.prototype.updateTag = function (id,name) {
    let form = {
        id,
        name
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.tags.update+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};
WeChat.prototype.deleteTag = function (id) {
    let form = {
        id,
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.tags.delete+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};
WeChat.prototype.batchTag = function (openid_list,tagid,isCancel) {
    let form = {
        openid_list,
        tagid
    }
    let prefix = isCancel ? api.tags.batchuntagging : api.tags.batchtagging;
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = prefix+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};
WeChat.prototype.getTagUsers = function (tagid,next_openid) {
    let form = {
        next_openid,
        tagid
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.tags.getTagUsers+'?access_token='+data.access_token;
            request({method:'GET',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};

WeChat.prototype.remarkUser = function (openid,remark) {
    let form = {
        openid,
        remark
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.user.remark+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};
WeChat.prototype.fetchUsers = function (openids,lang) {
    let options = {
        method:'GET',
        url:'',
        json:true
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            options.url = api.user.fetch+'?access_token='+data.access_token+'&openid='+openids+'&lang=zh_CN ';
            if(Array.isArray(openids)){
                options = {
                    method:'POST',
                    body:{
                        user_list:openids,
                    },
                    json:true
                }
                options.url = api.user.batchFetch+'?access_token='+data.access_token;
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

WeChat.prototype.sendByTag = function (type,message,tagId) {
    let msg = {
        "filter":{
        },
        "msgtype":type,
    }
    msg[type] = message;
    if(!tagId){
        msg.filter.is_to_all = true;
    }else{
        msg.filter = {
            is_to_all:false,
            "tag_id":tagId
        }
    }
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.mass.tag+'?access_token='+data.access_token;
            request({method:'POST',url,body:msg,json:true}, function (error, response, body) {
                if(body){
                    resolve(body);
                }else{
                    reject();
                }
            });
        });

    })
};
const menuconfig = require('../menuconfig')
WeChat.prototype.createMenu = function () {
    let form = menuconfig;
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            console.log('创建菜单获取token',data)
            let url = api.menu.create+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    console.log(body)
                    resolve(body);
                }else{
                    reject();
                }
            });
        }).catch(function (e) {
            console.log(e)
        });

    })
};

WeChat.prototype.createQrCode = function (qr) {
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.qrCode.create+'?access_token='+data.access_token;
            request({method:'POST',url,body:qr,json:true}, function (error, response, body) {
                if(body){
                    console.log(body)
                    resolve(body);
                }else{
                    reject();
                }
            });
        }).catch(function (e) {
            console.log(e)
        });

    })
};
WeChat.prototype.semanticQuery = function (form) {
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.semantic.query+'?access_token='+data.access_token;
            request({method:'POST',url,body:form,json:true}, function (error, response, body) {
                if(body){
                    console.log(body)
                    resolve(body);
                }else{
                    reject();
                }
            });
        }).catch(function (e) {
            console.log(e)
        });

    })
};
WeChat.prototype.updateApiTicket = function () {
    return new Promise( (resolve,reject)=> {
        this.fetchAccessToken().then(function (data) {
            let url = api.jsapi.getTicket+'&access_token='+data.access_token;
            request({method:'get',url,json:true}, function (error, response, body) {
                if(body){
                    console.log(body)
                    resolve(body);
                }else{
                    reject();
                }
            });
        }).catch(function (e) {
            console.log(e)
        });

    })
};

WeChat.prototype.validTicket = function (data) {
    if(!data || !data.ticket || !data.expires_in){
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

WeChat.prototype.fetchJsApiTicket = function () {
    if(this.ticket &&  this.ticket_expires_in){
        if(this.validTicket(this)){
            return Promise.resolve(this);
        }
    }
    return this.getTicket()
        .then( data=> {
            try{
                data = JSON.parse(data);
            }catch (e){
                console.log(e)
                return this.updateApiTicket();
            }
            if(this.validTicket(data)){
                return Promise.resolve(data);
            }else{
                return this.updateApiTicket();
            }
        }).then(data => {
            this.ticket = data.ticket;
            this.ticket_expires_in = data.expires_in;
            this.saveTicket(data);
            return Promise.resolve(data);
        })
};

module.exports = WeChat;