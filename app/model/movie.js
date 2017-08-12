var mongoose = require('mongoose');
var movieSchema = require('../schema/movie');
var movie = mongoose.model('Movie',movieSchema);

module.exports = movie;