require("dotenv").config();
const path = require('path')
const crypto = require("crypto");
const jwt = require('jsonwebtoken')
function getName(name){
    return  `IMG-${Date.now()}${path.extname(name)}`
}

function verifyRazorpayPayment(order_id, razorpay_payment_id, razorpay_signature, secret = process.env.KEY_SECRET) {
  try {
    // Create HMAC SHA256 signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Compare with the received signature
    return generated_signature === razorpay_signature ? true : false
    }
  catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, message: "Internal server error" };
  }
}

const generateToken = (user)=>{
  console.log("user is",user)
return jwt.sign(user,process.env.TOKEN_SECRET_KEY)
}

function verifyToken(token){
  return jwt.verify(token, process.env.TOKEN_SECRET_KEY)
}

module.exports = {getName,verifyRazorpayPayment,generateToken,verifyToken}