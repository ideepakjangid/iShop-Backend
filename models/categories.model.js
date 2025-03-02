const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            unique:true,
        },
        slug:{
            type:String,
            required:true,
            unique:true,
        },
        status:{
            type:Boolean,
            default:true
        },
        deletedAt:{
            type:Date,
            default:null
        }
    },
    {timestamps:true}
)

const CategoryModel = mongoose.model("Category",CategorySchema)
module.exports = CategoryModel;