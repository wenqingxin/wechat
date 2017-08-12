/**
 * Created by Administrator on 2017/7/15 0015.
 */
var mongoose = require('mongoose');
var catetorySchema = require('../schema/catetory');
var catetory = mongoose.model('Catetory',catetorySchema);

module.exports = catetory;