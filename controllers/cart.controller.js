const CartModel = require("../models/cart.model");
const UserModel = require("../models/user.model");
const CartController = {
  async addCartItem(req, res) {
    try {
      const { user_id, product_id, color_id } = req.body;
      console.log(req.body)
      const user = await UserModel.findOne({ _id: user_id });
      if (!user)
        return res.send({
          flag: 0,
          message: "User not found",
        });
      const cart = await CartModel.findOne({ user_id, product_id, color_id });
      if (cart) {
        cart.quantity += 1;
        await cart.save();
        return res.send({
          flag: 1,
          message: "Added to cart.",
        });
      } else {
        const newCart = new CartModel({
          user_id,
          product_id,
          color_id,
          quantity: 1,
        });
        await newCart.save();
        res.send({
          flag: 1,
          message: "Item added to cart",
        });
      }
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  async decQuantity(req,res){
    try {
        const {user_id,product_id,color_id} = req.body;
        const cartItem = await CartModel.findOne({user_id,product_id,color_id});
        if(!cartItem){
            return res.send(
                {
                    flag:0,
                    message:"No cart item found."
                }
            )
        }
        if(cartItem.quantity == 1){
            return res.send(
                {
                    flag:0,
                    message:"Item quantity already 1."
                }
            )
        }
        cartItem.quantity = cartItem.quantity - 1;
        await cartItem.save();
        res.send(
            {
                flag:1,
                message:"Item quantity descreased by 1."
            }
        )
    } catch (error) {
        console.log(error.message);
        res.send(
            {
                flag:0,
                message:"Internal server problem."
            }
        )
    }
  },
  async deleteCartItem(req,res){
    try {
        const {user_id,product_id,color_id} = req.body;
        const cartItem = await CartModel.deleteOne({user_id,product_id,color_id});
        if(cartItem.deletedCount === 0){
            return res.send(
                {
                    flag:0,
                    message:"Cart item not found."
                }
            )
        }
        res.send(
            {
                flag:1,
                message:"Cart item removed."
            }
        )
    } catch (error) {
        console.log(error.message);
        res.send(
            {
                flag:0,
                message:"Internal server problem."
            }
        )
    }
  },
};
module.exports = CartController;
