/**
 * Created by Administrator on 2017/8/2 0002.
 */
var mongoose = require('mongoose');
var movieSchema = require('../schema/movie');
var movie = mongoose.model('Movie',movieSchema);
async function searchMovie(q) {
    return await movie.find({title:new RegExp(q+'.*','i')}).exec()
}
async function findMovieByDoubanId(q) {
    return await movie.findOne({doubanId:q}).populate({
        path:'catetory',
        select:'name',
        //options:{limit:2,skip:index}
    }).exec()
}
async function findHotMovies(q) {
    return await movie.find({}).populate({
        path:'catetory',
        select:'name',
        //options:{limit:2,skip:index}
    }).sort({pv: -1}).limit(5).exec()
}

exports.searchMovie = searchMovie;
exports.findMovieByDoubanId = findMovieByDoubanId;
exports.findHotMovies = findHotMovies;