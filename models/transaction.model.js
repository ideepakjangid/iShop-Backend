const mongoose = require('mongoose');
const TransactionSchema = mongoose.Schema(
    {
        user_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        order_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Order"
        },
        razorpay_payment_id:{
            type:String
        },
        razorpay_order_id:{
            type:String
        },
        razorpay_signature:{
            type:String
        }
    },{
        timestamps:true
    }
)

const TransactionModel = new mongoose.model("Transaction",TransactionSchema)
module.exports = TransactionModel