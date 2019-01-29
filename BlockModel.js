const mongoose = require('mongoose')
var Schema = mongoose.Schema

// ================== Block Schema =================
var BlockSchema = new Schema({
    blockName:{
        type:String,
        required:true,
    },
    productLine:{
        type:String,
        required:true
    },
    badgeNo:{
        type:String,
        default:'N/A'
    },
    staff_name:{
        type:String,
        default:'N/A'
    },
    staff_surname:{
        type:String,
        default:'N/A'
    },
    staff_dept:{
        type:String,
        default:'N/A'
    },
})

var Block = mongoose.model('Block',BlockSchema)
module.exports = Block