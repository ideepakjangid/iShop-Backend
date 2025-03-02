const mongoose = require('mongoose')

const ColorSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            unique:true
        },
        hxcode:{
            type:String,
            required:true,
            unique:true
        },
        slug:{
            type:String,
            required:true
        },
        status:{
            type:Boolean,
            default:true
        },
        deletedAt:{
            type:Date,
            default:null,
            
        }
    },
    {timestamps:true}
)

const ColorModel = mongoose.model("Color",ColorSchema)
module.exports = ColorModel;