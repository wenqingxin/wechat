/**
 * Created by Administrator on 2017/7/22 0022.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.get('/',function (req,res,next) {
    let count = 1;
    let fileFlag = fs.existsSync(__dirname);
    if(!fileFlag){
        fs.writeFileSync(path.join(__dirname,'./count.txt'),count,'utf-8');
    }else{
        count = fs.readFileSync(path.join(__dirname,'./count.txt'),'utf-8');
        count = Number(count)+1;
        fs.writeFileSync(path.join(__dirname,'./count.txt'),count,'utf-8');
    }
    console.log(count+'')
    res.send(count+'')
});
app.listen(3000);