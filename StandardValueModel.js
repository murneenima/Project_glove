const mongoose = require('mongoose')
var Schema = mongoose.Schema

// =================== STD Value ====================
var StandardValue = new Schema({
    std_size:{
        type:String,
        required:true,
        unique:true
    },
    std_productname:{
        type:String,
        required:true,
        unique:true
    },
    std_producttype:{
        type:String,
        required:String,
        unique:String
    },
    std_length:{
        type:String,
        required:true,
        unique:true
    },
    std_weight:{
        type:String,
        required:true,
        unique:true
    }
})

var StandardValue = mongoose.model('StandardValue',StandardValueSchema)
module.exports = StandardValue