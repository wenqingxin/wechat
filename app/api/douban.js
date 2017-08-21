/**
 * Created by Administrator on 2017/8/14 0014.
 */
const request = require('request');
const Catetory = require('../model/catetory')
const Movie = require('../model/movie')

function getMovieList(type) {
    return new Promise((resolve,reject)=>{
        request({
            url:'http://api.douban.com/v2/movie/'+type,
            json:true,
            method:'get'
        },function (err,res) {
            if(err) {
                console.log(err);
                reject(err);
            }
            resolve(res);
        })
    })
}
function saveMoviedetail(id,cat) {
    return new Promise((resolve,reject)=>{
        request({url:'https://api.douban.com/v2/movie/subject/'+id,method:'GET',json:true},function (error, response, body) {
            if(error){
                reject(error)
                return;
            }
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
            Catetory.findOne({name:cat},function (err,catetory) {
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
                        name:body.genres[0]
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
            resolve(_movie);
        })
    })
}
exports.getMovieList = getMovieList;
exports.saveMoviedetail = saveMoviedetail;

