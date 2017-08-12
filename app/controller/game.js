/**
 * Created by Administrator on 2017/8/2 0002.
 */
const Wechat =require('../../wechat/wechat.js')
const crypto =require('crypto')
const config = require('../../config')
const weChatApi = new Wechat(config.wechat)
const ejs = require('ejs');
module.exports = async function (ctx,next) {
    let data = await weChatApi.fetchJsApiTicket();
    let timeStamp =  parseInt(new Date().getTime()/1000,10);+'';
    let nonce = Math.random().toString(36).substr(2,15);
    let str = [
        'noncestr='+nonce,
        'jsapi_ticket='+data.ticket,
        'timestamp='+timeStamp,
        'url='+ctx.href
    ].sort().join('&')
    let shasum = crypto.createHash('sha1');
    shasum.update(str)
    let signature = shasum.digest('hex');
    ctx.body =
        `<!DOCTYPE html>
            <html>
                <head>
                    <meta name="viewport" content="user-scalable=no, initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width"/>
                    <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js" type="text/javascript"></script>
                    <script src="http://zeptojs.com/zepto.min.js"></script>
                </head>
                <body>
                    <h1 id='audioSearch'>点击语音搜索</h1>
                    <div id='resContent'>
                        <div id="inputTitle"></div>
                        <div id="inputDirector"></div>
                        <div id="inputCountry"></div>
                        <div id="inputLanguage"></div>
                        <div id="inputYear"></div>
                        <div id="inputSummary"></div>
                        <div id="inputPoster"></div>
                    </div>
                    <script>
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: '<%= appId.toString()%>',
                        timestamp:'<%= timestamp%>' , // 必填，生成签名的时间戳
                        nonceStr: '<%= nonceStr%>', // 必填，生成签名的随机串
                        signature: '<%= signature%>',// 必填，签名，见附录1
                        jsApiList: [
                                    'startRecord',
                                    'stopRecord',
                                    'onVoiceRecordEnd',
                                    'playVoice',
                                    'pauseVoice',
                                    'stopVoice',
                                    'onVoicePlayEnd',
                                    'uploadVoice',
                                    'downloadVoice',
                                    'chooseImage',
                                    'previewImage',
                                    'uploadImage',
                                    'downloadImage',
                                    'translateVoice'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
                    wx.ready(function(){
                        wx.checkJsApi({
                            jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                            success: function(res) {
                                // 以键值对的形式返回，可用的api值true，不可用为false
                                // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                                console.log(res);
                            }
                        });
                        var isRecording = false;
                        $('h1').on('click',function(){
                            if(isRecording){
                                isRecording= false;
                                wx.stopRecord({
                                    success: function (res) {
                                        var localId = res.localId;
                                        wx.translateVoice({
                                           localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                                            isShowProgressTips: 1, // 默认为1，显示进度提示
                                            success: function (res) {
                                                //alert(res.translateResult); // 语音识别的结果
                                                $.ajax({
                                                    type:'get',
                                                    url:'http://api.douban.com/v2/movie/search?q='+res.translateResult,
                                                    dataType:'jsonp',
                                                    crossDomain:true,
                                                    jsonp:'callback',
                                                    success:function(data){
                                                        //alert(JSON.stringify(data.subjects[0]));
                                                        var _data = data.subjects[0];
                                                        var options = {
                                                                current: _data.images.large, // 当前显示图片的http链接
                                                                urls: [] // 需要预览的图片http链接列表
                                                        };
                                                        data.subjects.forEach(function(item){
                                                            options.urls.push(item.images.large);
                                                        })
                                                        $('#inputTitle').html(data.title)

                                                        $('#inputPoster').html('<img src="'+_data.images.large+'"/>')
                                                        $('img').on('click',function(){
                                                            wx.previewImage(options);
                                                        })
                                                    },
                                                    error:function(){
                                                        alert('失败了');
                                                    }
                                                })
                                            }
                                        });
                                    }
                                });
                                $(this).html('点击语音搜索');
                            }else{
                               isRecording=true;
                               wx.startRecord();
                               $(this).html('停止搜索');
                            }
                            
                        })
                    });
                    </script>
                </body>
            </html>
        `
    ctx.body=ejs.render(ctx.body,{
        appId: config.wechat.appID, // 必填，公众号的唯一标识
        timestamp:timeStamp , // 必填，生成签名的时间戳
        nonceStr: nonce, // 必填，生成签名的随机串
        signature: signature,// 必填，签名，见附录1
    })
}