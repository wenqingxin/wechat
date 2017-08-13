/**
 * Created by Administrator on 2017/7/31 0031.
 */
const config = require('./config')
module.exports = {
    "button":[
        {
            "type":"click",
            "name":"今日推荐",
            "key":"TODAY_MOViE"
        },
        {
            "name":"电影",
            "sub_button":[
                {
                    "type":"view",
                    "name":"搜索",
                    "url":config.wechat.myService+"/movie"
                },
                {
                    "type":"view",
                    "name":"管理后台",
                    "url":config.wechat.myService+":8081"
                },
                {
                    "type":"location_select",
                    "name":"地理位置",
                    "key":"V1001_GOOD"
                },

                ]
        },{
            "type":"click",
            "name":"帮助",
            "key":"HELP"
        }]
}