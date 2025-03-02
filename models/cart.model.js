const mongoose = require("mongoose");

const CartSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  color_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
  },
  quantity: {
    type: Number,
    default: 0,
  },
},{
    timestamps:true,
});

const CartModel = new mongoose.model("Cart", CartSchema);
module.exports = CartModel;
