/**
 * Created by Administrator on 2017/7/22 0022.
 */
const fs = require('fs');

exports.readFileAsync = function (fpath,encoding) {
    return new Promise(function (resolve,reject) {
        fs.readFile(fpath,encoding,function (err,content) {
            if(err) reject(err);
            else resolve(content);
        })
    })
}
exports.writeFileAsync = function (fpath,encoding) {
    return new Promise(function (resolve,reject) {
        fs.writeFile(fpath,encoding,function (err,content) {
            if(err) reject(err);
            else resolve(content);
        })
    })
}
