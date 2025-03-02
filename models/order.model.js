const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  original_price: {
    type: Number,
    required: true,
  },
  final_price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [ProductSchema],
  final_total: {
    type: Number,
    required: true,
  },
  original_total: {
    type: Number,
    required: true,
  },
  address: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    house: {
      type: String,
    },
    pin: {
      type: String,
    },
    area: {
      type: String,
    },
    block: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
  },
  payment_method:{
    type:Number,
    enum:[1,2],
  },
  payment_status:{
    type:Number,
    enum:[1,2,3,4,5], // 1:Pending 2:Success 3:Failed 4:Refund inti 5:Refunded
  },
  order_status:{
    type:Number,
    enum:[0,1,2,3,4,5,6] //0:Pending 1:Ordre placed 2:Order Packed 3:Order Dispatched 4:Order Shippped 5:Out for delivery 6:Delivered
  },
  deletedAt:{
    type:Date,
    default:null
  }
},{
    timestamps:true,
});

const OrderModel = new mongoose.model("Order",OrderSchema)
module.exports = OrderModel;
