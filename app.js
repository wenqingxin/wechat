'use strict'

const Koa = require('koa');
const wechat = require('./wechat/g');
const config = require('./config')
const weixin =require('./weixin')
const game = require('./app/controller/game')
const router = require('koa-router')();
var path = require('path');
var mongoose = require('mongoose');
const Movie = require('./app/api/movie')

/*
 var logger = require('express-logger');
 */
var views = require('koa-views');

// Must be used before any router is used
var mode = process.env.NODE_ENV || 'development';
console.log(mode)
const dbUrl = mode === 'development'? "mongodb://127.0.0.1:27017/movie" : 'mongodb://movie_rw:13370761096@127.0.0.1:27017/movie';
console.log(dbUrl)
mongoose.connect(dbUrl);

mongoose.Promise = global.Promise;
const app = new Koa();
app.use(views(__dirname + '/app/views/wx', { extension: ['pug'] }))
router.get('/', async (ctx,next) =>{
    ctx.body = '请调用API'
})
router.get('/movie', game);
router.get('/wx', wechat(config.wechat,weixin.reply));
router.post('/wx', wechat(config.wechat,weixin.reply));
router.get('/wx/MovieDetail', async (ctx,next) =>{
    if(ctx.query.q && ctx.query.q!="undefined"){
        let res = await Movie.findMovieByDoubanId(ctx.query.q);
        if(!res){
            ctx.body = '未查询到该电影'
        }else{
            await ctx.render('movidetail',res);
            res.pv=res.pv+1;
            res.save();
        }
    }else{
        ctx.body = '未查询到该电影'
    }
    console.log('我是倒数第三个前面')
    //ctx.body = '未查询到该电影'
    //await next()
    console.log('我是倒数第三个')

},async (ctx,next) =>{
    console.log('我是夹起的')
    await next()

});
app.use(router.routes()).use(router.allowedMethods());
app.use(async (ctx,next)=>{
    await next()
    console.log('我是倒数第二个')
});

app.use(async (ctx,next)=>{
    await next()
    console.log('我是最后个')
});

app.listen(1234);
console.log('Listening:1234');