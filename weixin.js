/**
 * Created by Administrator on 2017/7/23 0023.
 */
const config = require('./config')
const Wechat = require('./WECHAT/wechat')
const path = require('path')
var weChatApi = new Wechat(config.wechat)
exports.reply = function* (next) {
    let message = this.weixin;

    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){//可能是二维码
                console.log('扫二维码进来',message.EventKey+' '+message.EventTicket);
            }
            this.body ='哈哈,你订阅了这个号\r\n';
        }else if(message.Event === 'unsubscribe'){
            console.log('无情取关');
        }else if(message.Event === 'LOCATION'){
            this.body = '您上报的位置是'+message.Latitude+'/'+message.Longitude+'-'+message.precision;
        }else if(message.Event === 'CLICK'){
            this.body = '您点击了菜单： '+message.EventKey;
        }else if(message.Event === 'SCAN'){
            this.body = '关注后扫二维码： '+message.EventKey+' '+message.Ticket;
        }else if(message.Event === 'VIEW'){
            this.body = '您点击了菜单中的链接'+message.EventKey;
        }

    }else if(message.MsgType === 'text'){
        let content = message.Content;
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
            }]
        }else if(content === '5'){
            let data = yield weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'))
            reply = {
                type:'image',
                mediaId:data.media_id
            };
        }else if(content === '6'){
            let data = yield weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'))
            reply = {
                type:'video',
                title:'回复视频',
                description:'回复视频描述下',
                mediaId:data.media_id
            };
        }else if(content === '7'){
            let data = yield weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'))
            reply = {
                type:'music',
                title:'回复音乐',
                description:'回复音乐描述下',
                thumbMediaId:data.media_id,
                musicUrl:'http://up.mcyt.net/md5/53/MjkxNTk4_Qq4329912.mp3'
            };
        }else if(content === '9'){
            let data = yield weChatApi.uploadMaterial('image',path.join(__dirname,'./learnZiLiao/58aba38b00012cc212800720.jpg'),
                {
                    type:'image',
                    //description:'{"title":"just a test"}',
                    //introductions:'Never give up'
                });
            reply = {
                type:'image',
                mediaId:data.media_id
            };
        }

        this.body = reply;
    }
    yield next;
}