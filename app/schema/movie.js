/**
 * Created by Administrator on 2017/7/2 0002.
 */
const mongoose = require('mongoose');
const ObjectId= mongoose.Schema.Types.ObjectId;
//模式
const movieSchema = new mongoose.Schema({
  catetory:{
    type:ObjectId,
    ref:'Catetory'
  },
  doubanId:String,
  director:String,
  title:String,
  language:String,
  country:String,
  flash:String,
  poster:String,
  year:Number,
  summary:String,
  pv:{
    type:Number,
    default:0
  },
  meta:{
    createAt:{
      type:Date,
      default:Date.now()
    },
    updateAt:{
      type:Date,
      default:Date.now()
    }
  }
});
//每次存储都调用
movieSchema.pre('save',function (next) {
  if(this.isNew){
    this.meta.createAt = this.meta.updateAt = Date.now();
  }else{
    this.meta.updateAt = Date.now();
  }
  next();
});
//增加静态方法 相当于dao层
movieSchema.statics = {
  fetch:function (cb) {
    return this.find({}).exec(cb);
  },
  findById:function (id,cb) {
    return this.findOne({
      _id:id
    }).
    exec(cb);
  },
}

module.exports = movieSchema;