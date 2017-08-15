/**
 * Created by Administrator on 2017/7/31 0031.
 */
const config = require('./config')
module.exports = {
    "button":[
        {
            "name":"排行榜",
            "sub_button":[
                {
                    "type":"click",
                    "name":"正在热映",
                    "key":"HOT_MOViE",
                },
                {
                    "type":"click",
                    "name":"即将上映",
                    "key":"COMING_MOViE",
                },
                {
                    "type":"click",
                    "name":"今日推荐",
                    "key":"TODAY_MOViE"
                },
            ]
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
                    "name":"电影存货",
                    "url":config.wechat.myService+":8081"
                },
/*                {
                    "type":"location_select",
                    "name":"地理位置",
                    "key":"V1001_GOOD"
                },*/
                ]
        },{
            "type":"click",
            "name":"帮助",
            "key":"HELP"
        }]
}