const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxLenth: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    color: [{ type: mongoose.Schema.Types.ObjectId, ref: "Color" }],
    deletedAt: {
      type: Date,
      default: null,
    },
    image:{
      type: String,
      default:null
    },
    other_images:[
      {type:String,default:null}
    ],
    original_price: {
      type: Number,
      required: true,
      min: 1,
    },
    discounted_price: {
      type: Number,
      required: true,
    },
    discount_percent: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default:null
    },
    des: {
      type: String,
      default:null
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
