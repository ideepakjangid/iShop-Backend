require("dotenv").config();
const {verifyRazorpayPayment} = require("../helper");
const CartModel = require("../models/cart.model");
const OrderModel = require("../models/order.model");
const UserModel = require("../models/user.model");
const TransactionModel = require("../models/transaction.model")
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const OrderController = {
  async getOrders(req,res){
    try {
      const {page,limit} = req.query;
      let skip = 0;
      let Limit = limit ?? null;
      if(page && limit){
        skip = limit * Number(page - 1)
      }
      const totalProducts = await OrderModel.countDocuments();
      const orders = await OrderModel.find().populate({path:"user_id",select:"name email contact"}).skip(skip).limit(Limit);
      if(orders.length == 0){
        return res.send(
          {
            flag:0,
            message:"No orders!"
          }
        )
      }
      res.send(
        {
          flag:1,
          message:"All orders!",
          orders,
          totalProducts,
          Limit
        }
      )
    } catch (error) {
      res.send(
        {
          flag:0,
          message:"Internal server problem!"
        }
      )
    }
  },
  async getOrderByUserId(req,res){
    try {
      const {user_id} = req.params;
      if(!user_id){
        return res.send(
          {
            flag:0,
            message:"User id is required!"
          }
        )
      }
      const orders = await OrderModel.find({user_id:user_id,deletedAt:null}).populate("products.product_id");
      if(!orders){
        return res.send(
          {
            flag:0,
            message:"No order found!"
          }
        )
      }
      res.send(
        {
          flag:1,
          message:"Order founds",
          orders
        }
      )
    } catch (error) {
      console.log("Error",error.message)
      res.send(
        {
          flag:0,
          message:"Internal server problem!"
        }
      )
    }
  },
  async create(req, res) {
    try {
      const { user_id, payment_method, address } = req.body;
      const user = await UserModel.findOne({ _id: user_id });
      if (!user) {
        return res.send({
          flag: 0,
          message: "User not found!",
        });
      }
      const cart = await CartModel.find({ user_id: user_id }).populate({
        path: "product_id",
        select: "_id original_price discounted_price",
      });
      if (!cart) {
        return res.send({
          flag: 0,
          message: "User has no Cart item.",
        });
      }
      const userAddress = user.address[address];
      let original_total = 0;
      let final_total = 0;
      const products = cart.map((item) => {
        original_total += item.quantity * item.product_id.original_price;
        final_total += item.quantity * item.product_id.discounted_price;
        return {
          product_id: item.product_id._id,
          original_price: item.product_id.original_price,
          final_price: item.product_id.discounted_price,
          quantity: item.quantity,
        };
      });

      const order = new OrderModel({
        user_id,
        products,
        final_total,
        original_total,
        address: {
          name: userAddress.name,
          phone: userAddress.phone,
          house: userAddress.house,
          pin: userAddress.pin,
          area: userAddress.area,
          block: userAddress.block,
          district: userAddress.district,
          state: userAddress.state,
        },
        payment_method,
        payment_status: 1,
        order_status: payment_method == 1 ? 1 : 0,
      });
      const updateOrder = await order.save();
      if (payment_method == 1) {
        await CartModel.deleteMany({ user_id });
        return res.send({
          flag: 1,
          message: "Your order has been placed successfully.",
          order_id: updateOrder._id,
        });
      } else {
        var options = {
          amount: order.final_total * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency: "INR",
          receipt: order._id,
        };
        instance.orders.create(options, function (err, order) {
          if(!err){
            return res.send(
              {
                flag:1,
                message:"Proceed your payment",
                razorpay_order_id:order.id,
                order_id:updateOrder._id
              }
            )
          }
        });
      }
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async paymentSuccess(req,res){
    try {
      const {response,order_id} = req.body;
      if(verifyRazorpayPayment(response.razorpay_order_id,response.razorpay_payment_id,response.razorpay_signature)){
       const order = await OrderModel.findOne({_id:order_id});
       if(order){
        order.payment_status = 2;
        order.order_status = 1;
        await order.save();
        await CartModel.deleteMany({user_id:order.user_id});
       const transaction = new TransactionModel(
        {
                user_id:order.user_id,
                  order_id:order._id,
                  razorpay_payment_id:response.razorpay_payment_id,
                  razorpay_order_id:response.razorpay_order_id,
                  razorpay_signature:response.razorpay_signature
        }
       )
       await transaction.save();
       return res.send(
        {
          flag:1,
          message:"Your payment has done.",
          order_id:order._id
        }
       )
      }}
    } catch (error) {
      console.log("Payment success routes Error",error)
      res.send(
        {
          flag:0,
          message:"Internal server problem"
        }
      )
    }
  },
  async paymentFailed(req,res){
    try {
      const {rezorpay_order_id,razorpay_payment_id,order_id}=req.body;
      const order = await OrderModel.findOne({_id:order_id});
      if(order){
        order.order_status = 0;
        order.payment_status = 1;
        await order.save();

        const existTransaction = await TransactionModel.findOne({order_id})
        if(existTransaction){

          return res.send({
            flag: 1,
            message: "Your payment is failed.",
            order_id,
          });
        }

        const transaction = new TransactionModel({
          user_id:order.user_id,
          order_id:order._id,
          razorpay_payment_id,
          rezorpay_order_id,
        })
        await transaction.save();
        return res.send(
          {
            flag:1,
            message:"Your payment is failed.",
            order_id
          }
        )
      }else{
        res.send(
          {
            flag:0,
            message:"No order found."
          }
        )
      }
    } catch (error) {
      res.send(
        {
          flag:0,
          message:"Internal server problem."
        }
      )
    }
  },
  async deleteOrder(req,res){
    try {
      const {order_id}= req.params;
      if( !order_id) return res.send(
        {
          flag:0,
          message:"Order id is required!"
        }
      )
      const order = await OrderModel.updateOne({_id:order_id},{deletedAt:Date.now()});
      if(!order){
        return res.send(
          {
            flag:0,
            message:"No order found!"
          }
        )
      }
      // await order.save();
      res.send(
        {
          flag:1,
          message:"Order deleted successfully!"
        }
      )
    } catch (error) {
      console.log(error.message)
      res.send(
        {
          flag:0,
          message:"Internal server problem!"
        }
      )
    }
  }
};
module.exports = OrderController;
