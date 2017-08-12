/**
 * Created by Administrator on 2017/8/2 0002.
 */
const Movie = require('../../model/movie')
module.exports  = function (id) {
    return async function(ctx,next) {
        return await Movie.findById({_id:id}).exec();
    }
}