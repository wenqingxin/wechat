var koa = require('koa');
var app = koa();

// x-response-time

app.use(function *(next){
    console.log('x-response-time before');
    var start = new Date;
    yield next;
    console.log('x-response-time after');
    var ms = new Date - start;
    this.set('X-Response-Time', ms + 'ms');
});

// logger

app.use(function *(next){
    console.log('logger before');
    var start = new Date;
    yield next;
    console.log('logger after');
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
});

// response

app.use(function *(){
    console.log('response before');
    this.body = 'Hello World';
    console.log('response after');
});

app.listen(3000);