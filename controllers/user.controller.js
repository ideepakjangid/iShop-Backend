const UserModel = require("../models/user.model");
const CartModel = require("../models/cart.model");
const bcrypt = require("bcrypt");
const fs = require('fs')
const { getName, generateToken } = require("../helper");
const UserController = {
  async read(req,res){
    try {
      const users = await UserModel.find({deletedAt:null});
      if(!users){
        return res.send(
          {
            flag:0,
            message:"No users!"
          }
        )
      }
      res.send(
        {
          flag:1,
          message:"Users successfully sent!",
          users,
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
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const result = await bcrypt.compare(password, user.password);
        const cart = await CartModel.find({ user_id: user._id }).populate({
          path: "product_id",
          select: "_id original_price discounted_price",
        });
        if (result) {
          const token= generateToken(user.toJSON())
          res.send({
            flag: 1,
            message: "User logged in.",
            user: { ...user._doc, password: "", cart },
            token
          });
        } else {
          res.send({
            flag: 0,
            message: "Password is worng",
          });
        }
      } else {
        res.send({
          flag: 0,
          message: "Email not found",
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
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      console.log(id)
      if (!id) {
        return res.send({
          flag: 0,
          message: "User id is required",
        });
      }
      const user = await UserModel.findOne({ _id: id });
      if (!user) {
        return res.send({
          flag: 0,
          message: "User not found",
        });
      }
      user.name = req.body.name;
      user.email = req.body.email;
      user.contact = req.body.contact;
      console.log(req.body)
      const updatedUser = await user.save();
      res.send({
        flag: 1,
        message: "User updated successfully",
        user: { ...updatedUser._doc, password: "" },
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async register(req, res) {
    const { email, password,name } = req.body;
    try {
      const existingEmail = await UserModel.findOne({ email: email });
      if (existingEmail) {
        return res.send({
          flag: 0,
          message: "Email already exists",
        });
      }
      const hash = await bcrypt.hash(password, 13);
      const user = new UserModel({ email: email, password: hash,name:name });
      const newUser = await user.save();
      res.send({
        flag: 1,
        message: "User created successfully",
        newData: { ...newUser._doc, password: "" },
        token:generateToken(newUser.toJSON())
      });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async addAddress(req, res) {
    try {
      const { id } = req.params;
      if (!id)
        return res.send({
          flag: 0,
          message: "User id is required",
        });
      const user = await UserModel.findOne({ _id: id });
      if (!user)
        return res.send({
          flag: 0,
          message: "User not found",
        });
      user.address.push(req.body);
      const updatedUser = await user.save();
      res.send({
        flag: 1,
        message: "Address added successfully",
        user: { ...updatedUser._doc, password: "" },
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async editAddress(req, res) {
    try {
      const { id } = req.params;
      if (!id)
        return res.send({
          flag: 0,
          message: "User id is required",
        });
      const user = await UserModel.findOne({ _id: id });
      if (!user)
        return res.send({
          flag: 0,
          message: "User not found",
        });
      user.address[req.body.index] = (req.body.data);
      const updatedUser = await user.save();
      res.send({
        flag: 1,
        message: "Address edit successfully",
        user: { ...updatedUser._doc, password: "" },
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async chagePassword(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.send({
          flag: 0,
          message: "User id is required",
        });
      }
      const user = await UserModel.findOne({ _id: id });
      if (!user) {
        return res.send({
          flag: 0,
          message: "User not found",
        });
      }
      const oldPassword = req.body.oldPassword;
      const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!oldPasswordMatch) {
        return res.send({
          flag: 0,
          message: "Old password is wrong",
        });
      }
      const newPassword = req.body.newPassword;
      const hash = await bcrypt.hash(newPassword, 13);
      user.password = hash;
      const updatedUser = await user.save();
      res.send({
        flag: 1,
        message: "Password changed successfully",
        user: { ...updatedUser._doc, password: "" },
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async deleteAddress(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.send({
          flag: 0,
          message: "User id is required",
        });
      }
      const user = await UserModel.findOne({ _id: id });
      if (!user) {
        return res.send({
          flag: 0,
          message: "User not found",
        });
      }
      const userAddress = user.address;
      userAddress.splice(req.body.index, 1);
      const updatedUser = await user.save();
      res.send({
        flag: 1,
        message: "Address deleted successfully",
        user: { ...updatedUser._doc, password: "" },
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async setDefaultAddress(req, res) {
    try {
      const { id } = req.params;
      const { index } = req.body;
      if (!id) {
        return res.send({
          flag: 0,
          message: "User id is required",
        });
      }
      const user = await UserModel.findOne({ _id: id });
      if (!user) {
        return res.send({
          flag: 0,
          message: "User not found",
        });
      }
      if (user.address.length < index) {
        return res.send({
          flag: 0,
          message: "Invalid index",
        });
      }
      user.address.map((address) => {
        address.isDefault = false;
      });
      user.address[index].isDefault = true;
      const updatedUser = await user.save();
      res.send({
        flag: 1,
        message: "Default address set successfully",
        user: { ...updatedUser._doc, password: "" },
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async setForgottonPassword(req, res) {
    try {
      const { email, password } = req.body;
      console.log("value of req.body",req.body)
      console.log("Value of email is",email)
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.send({
          flag: 0,
          message: "Email not found!",
        });
      }

      const hash = await bcrypt.hash(password, 13);
      user.password = hash;
      await user.save();
      res.send({
        flag: 1,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.log("Error", error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  async uploadPhoto(req, res) {
    try {
      const { user_id } = req.params;
      const image = req.files.image;
      const user = await UserModel.findOne({ _id: user_id });
      if (!user) {
        return res.send({
          flag: 0,
          message: "No user found!",
        });
      }
      if (!image) {
        return res.send({
          flag: 0,
          message: "Profile photo required!",
        });
      }
      const newName = getName(image.name);
      const destination = "./public/images/user/" + newName;
      await image.mv(destination);
      if(user.image){

        fs.unlink(`./public/images/user/${user.image}`,(err)=>{
          if (err) {
            console.error("Error deleting file:", err.message);
        } else {
            console.log("File deleted successfully");
        }})
      }
      user.image = newName;
      const updatedUser = await user.save();
      res.send({
        flag: 1,
        message: "Profile photo set successfully!",
        user: {...updatedUser._doc,password:''},
      });
    } catch (error) {
      console.log("Error in profile uploading", error.message);
      res.send({
        flag: 0,
        message: "Internal server problme!",
      });
    }
  },
  async toggleStatus(req,res){
    try {
      const {user_id, status} = req.params;
      const user = await UserModel.findOne({_id:user_id});
      if(!user){
        return res.send(
          {
            flag:0,
            message:"No user found!"
          }
        )
      }
      user.status = status
      await user.save();
      res.send(
        {
          flag:1,
          message:"Status changed successfully!"
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
  async moveToTrash(req,res){
    try {
      const {user_id} = req.params;
      const user = await UserModel.findOne({_id:user_id});
      if(!user){
        return res.send(
          {
            flag:0,
            message:"No user found!"
          }
        )
      }
      user.deletedAt = Date.now();
      await user.save();
      res.send(
        {
          flag:1,
          message:"User moved to trah successfully!"
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
  async deleteUser(req,res){
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
      await UserModel.findByIdAndDelete(user_id);
      res.send(
        {
          flag:1,
          message:"User deleted successfully!"
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
};

module.exports = UserController;
