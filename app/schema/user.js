/**
 * Created by Administrator on 2017/7/10 0010.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTORY=10;
const userSchema = new mongoose.Schema({
    name:{
        unique:true,
        type:String
    },
    password:String,
    //0:normal user
    //1:verified user
    //2:professional user

    //>10:admin
    //>50:superadmin
    role:{
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
userSchema.pre('save',function (next) {
    let user = this;
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else{
        this.meta.updateAt = Date.now();
    }
    bcrypt.genSalt(SALT_WORK_FACTORY,function (err,salt) {
        if(err) return next(err);
        bcrypt.hash(user.password,salt,function (err,hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        })
    });
});
userSchema.statics = {
    fetch:function (cb) {
        return this.find({}).exec(cb)
    },
    findById:function (id,cb) {
        return this.findOne({_id:id}).exec(cb)
    }
};
userSchema.methods = {
    comparePassword:function (password,cb) {
        bcrypt.compare(password,this.password,function (err,isMatch) {
            if(err) return cb(err);
            cb(null,isMatch);
        })
    }
}
module.exports = userSchema;