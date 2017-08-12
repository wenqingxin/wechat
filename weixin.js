/**
 * Created by Administrator on 2017/7/23 0023.
 */
const config = require('./config')
const Wechat = require('./WECHAT/wechat')
const movie = require('./app/api/movie')
const Catetory = require('./app/model/catetory')
const Movie = require('./app/model/movie')
const path = require('path')
const request = require('request')
var weChatApi = new Wechat(config.wechat)
weChatApi.createMenu();
exports.reply = async function(ctx,next) {
    let message = this.weixin;
    const info =
        "亲,欢迎关注科幻电影世界\n"+
        "回复 1~3，测试文字回复\n"+
        "回复 4，测试图文回复\n"+
        "回复 电影名字，查询电影信息\n"+
        "回复 语音，查询电影信息\n"+
        "也可点击  <a href='"+config.wechat.myService+"/movie'>语音查询电影</a>";
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){//可能是二维码
                console.log('扫二维码进来',message.EventKey+' '+message.EventTicket);
            }
            ctx.body = info;
        }else if(message.Event === 'unsubscribe'){
            console.log('无情取关');
        }else if(message.Event === 'LOCATION'){
            ctx.body = '您上报的位置是'+message.Latitude+'/'+message.Longitude+'-'+message.precision;
        }else if(message.Event === 'CLICK'){
            //ctx.body = '您点击了菜单： '+message.EventKey;
            if(message.EventKey == 'TODAY_MOViE'){
                let res = await movie.findHotMovies();
                console.log('电影搜索结果',res)
                if(res && res.length!=0){
                    let reply = res.map(function (item) {
                        return {
                            title:item.title,
                            description:item.summary,
                            picUrl:item.poster,
                            url:config.wechat.myService+'/wx/MovieDetail?q='+item.doubanId
                        }
                    })
                    ctx.body = reply
                }
            }else if(message.EventKey == 'HELP'){
                ctx.body = info;
            }
        }else if(message.Event === 'SCAN'){
            ctx.body = '关注后扫二维码： '+message.EventKey+' '+message.Ticket;
        }else if(message.Event === 'VIEW'){
            ctx.body = '您点击了菜单中的链接'+message.EventKey;
        }else if(message.Event === 'scancode_push'){
            ctx.body = '您扫描二维码推送'+message.EventKey;
        }else if(message.Event === 'scancode_waitmsg'){
            ctx.body = '您扫码推事件且弹出“消息接收中”提示框'+message.EventKey;
        }else if(message.Event === 'pic_sysphoto'){
            ctx.body = '您弹出系统拍照发图'+message.EventKey;
        }else if(message.Event === 'pic_photo_or_album'){
            ctx.body = '您弹出拍照或者相册发图'+message.EventKey;
        }else if(message.Event === 'pic_weixin'){
            ctx.body = '您弹出微信相册发图器'+message.EventKey;
        }else if(message.Event === 'location_select'){
            ctx.body = '您弹出地理位置选择器'+message.EventKey;
        }

    } else if(message.MsgType === 'voice' || message.MsgType === 'text'){
        let content ;
        if(message.MsgType === 'voice'){
            content = message.Recognition;
        }else{
            content = message.Content

        }

        let reply = '恩，然后呢？';
        if(content === '1'){
            reply = 'hehe1';
        }
        else if(content === '2'){
            reply = 'hehe2';
        }
        else if(content === '3'){
            reply = 'hehe3';
        }else if(content === '4'){
            reply = [{
                title:'test',
                description:'description',
                picUrl:'http://inews.gtimg.com/newsapp_bt/0/1829875560/641',
                url:'http://news.qq.com/a/20170722/036434.htm?pgv_ref=aio2015_qqbrowsertab'
            },{
                title:'test2',
                    description:'description',
                    picUrl:'http://inews.gtimg.com/newsapp_bt/0/1829875560/641',
                    url:'http://news.qq.com/a/20170722/036434.htm?pgv_ref=aio2015_qqbrowsertab'
            }]
        }else{
            let res = await movie.searchMovie(content);
            console.log('电影搜索结果',res)
            if(res && res.length!=0){
                reply = res.splice(0,5).map(function (item) {
                    return {
                        title:item.title,
                        description:item.summary,
                        picUrl:item.poster,
                        url:config.wechat.myService+'/wx/MovieDetail?q='+item.doubanId
                    }
                })
            }else{
                reply = await new Promise(function (resolve,reject) {
                    request({url:'http://api.douban.com/v2/movie/search?q='+encodeURIComponent(content),method:'GET',json:true}, function (error, response, body) {
                        //console.log('远程电影搜索结果',body)
                        if(body && body.subjects && body.subjects.length!=0){
                            body.subjects.forEach(async function (item) {
                                let res = await movie.findMovieByDoubanId(item.id);
                                if(!res ||res.length == 0){
                                    request({url:'https://api.douban.com/v2/movie/subject/'+item.id,method:'GET',json:true},function (error, response, body) {
                                        console.log('远程电影详情',body)
                                        let _movie = new Movie({
                                            doubanId:body.id,
                                            director:body.directors[0] && body.directors[0].name,
                                            title:body.title,
                                            language:body.countries[0],
                                            country:body.countries[0],
                                            flash:body.images.large,
                                            poster:body.images.large,
                                            year:body.year,
                                            summary:body.summary,
                                        })
                                        Catetory.findOne({name:item.genres[0]},function (err,catetory) {
                                            if(catetory){
                                                _movie.catetory = catetory._id;
                                                _movie.save(function (err,movie) {
                                                    if(err) console.log(err);
                                                    if(!catetory.movies){
                                                        catetory.movies=[];
                                                    }
                                                    let hasCat = catetory.movies.find(function (item) {
                                                        return item.doubanId == _movie.doubanId;
                                                    });
                                                    if(!hasCat){
                                                        catetory.movies.push(movie._id);
                                                        catetory.save(function (err,catetory) {
                                                            if(err) console.log(err)
                                                        });
                                                    }

                                                    //res.redirect('/admin/movie/list/')
                                                })
                                            }else{
                                                let _catetory = new Catetory({
                                                    name:item.genres[0]
                                                });
                                                _catetory.save(function (err,catetory) {
                                                    if(err) console.log(err);
                                                    _movie.catetory = catetory._id;
                                                    _movie.save(function (err,movie) {
                                                        if(err) console.log(err);
                                                        catetory.movies.push(movie._id);
                                                        catetory.save(function (err,catetory) {
                                                            if(err) console.log(err)
                                                        });
                                                        //res.redirect('/admin/movie/list/')
                                                    })
                                                })
                                            }
                                        })

                                    })
                                }else{
                                    ctx.body = '未找到该电影'
                                }
                            })
                            resolve(body.subjects.splice(0,5).map(function (item) {
                                return {
                                    title:item.title,
                                    description:item.original_title,
                                    picUrl:item.images.large,
                                    url:config.wechat.myService+'/wx/MovieDetail?q='+item.id
                                }
                            }))

                        }
                    });
                })
            }
        }/*else if(content === '5'){
            let data = await weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'))
            reply = {
                type:'image',
                mediaId:data.media_id
            };
        }else if(content === '6'){
            let data = await weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'))
            reply = {
                type:'video',
                title:'回复视频',
                description:'回复视频描述下',
                mediaId:data.media_id
            };
        }else if(content === '7'){
            let data = await weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'))
            reply = {
                type:'music',
                title:'回复音乐',
                description:'回复音乐描述下',
                thumbMediaId:data.media_id,
                musicUrl:'http://up.mcyt.net/md5/53/MjkxNTk4_Qq4329912.mp3'
            };
        }else if(content === '8'){//永久素材了啦
            let data = await weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'),
                {
                    type:'image',
                    //description:'{"title":"just a test"}',
                    //introductions:'Never give up'
                });
            reply = {
                type:'image',
                mediaId:data.media_id
            };
        } else if(content === '10'){//永久图文
            let picData = await weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'),
                {
                });
            console.log('上传图片结果',picData)
            let midia = {
                airticles:[{
                    title:'tutu',
                    thumb_media_id:picData.media_id,
                    author:'Wenqingxin',
                    digest:'摘要',
                    show_cover_pic:1,
                    content:'内容',
                    content_source_url:'https://www.baidu.com'
                }]
            }
            let data= await weChatApi.uploadMaterial('news',midia,{});
            data= await weChatApi.fetchMaterial(data.media_id,'news',{});
            console.log('上传永久图文结果',data);

            let items = data.news_item;
            let news = [];
            items.forEach(function (item) {
                news.push({
                    title:item.title,
                    description:item.digest,
                    picUrl:picData.url,
                    url:item.url
                })
            })
            reply = news;
        }else if(content === '11'){
            let count = await weChatApi.countMaterial()
            let res = await [
                weChatApi.batchMaterial({
                    offset:0,
                    count:10,
                    type:'image'
                }),
                weChatApi.batchMaterial({
                    offset:0,
                    count:10,
                    type:'voice'
                }),
                weChatApi.batchMaterial({
                    offset:0,
                    count:10,
                    type:'news'
                }),
                weChatApi.batchMaterial({
                    offset:0,
                    count:10,
                    type:'video'
                })
            ]
            console.log(count)
            console.log(JSON.stringify(res))
        }else if(content === '12'){
            let newTag = await weChatApi.createTag('伐木累');
            console.log('新分组',newTag)
            let allTags = await weChatApi.fetchTags();
            console.log('分组列表',allTags)
            let inTag = await weChatApi.getTagOnUser(message.FromUserName);
            console.log('我在'+inTag+'分组')
            reply = 'tag done'
        }else if(content === '13'){
            console.log('当前openid',message.FromUserName);
            let user = await weChatApi.fetchUsers(message.FromUserName);
            console.log(JSON.stringify(user))
        }else if(content === '14'){
            let image = {
                content:'下午去拿化妆品哟'
            }
            let res = await weChatApi.sendByTag('text',image);
            console.log('发送结果',res);
        }else if(content === '15'){
            let tempQr = {"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}}
            let permQr = {"action_name": "QR_LIMIT_SCENE", "action_info": {"scene": {"scene_id": 123}}}

            let res1 = await weChatApi.createQrCode(tempQr);
            let res2 = await weChatApi.createQrCode(permQr);

            reply = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket='+res2.ticket;
            console.log('临时二维码',res1);
            console.log('永久二维码',res2);
        }else if(content === '16'){

        }else{
            let qry = {
                "query":content,
                "city":"北京",
                "category": "flight,hotel",
                "appid":config.wechat.appID,
                "uid":message.FromUserName
            }

            let res = await weChatApi.semanticQuery(qry);
            reply = JSON.stringify(res.answer);
            console.log('查询结果返回',res)
        }*/

        ctx.body = reply;
    }
    //await next;
}