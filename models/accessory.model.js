const mongoose = require("mongoose");
const AccessorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image:{
        type:String
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    original_price: {
      type: Number,
      required: true,
    },
    discounted_price: {
      type: Number,
      required: true,
    },
    discount_percent: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: Boolean,
      default: null,
    },
  },
  { timestamps: true }
);

const AccessoryModel =  mongoose.model("Accessory",AccessorySchema)
module.exports = AccessoryModel