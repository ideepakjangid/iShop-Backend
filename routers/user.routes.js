const express = require("express");
const UserController = require("../controllers/user.controller");
const generateOtp = require("../nodemailer");
const UserRoutes = express.Router();
const fileUploader = require("express-fileupload");
const adminAuth = require("../middleware/adminAuth");

UserRoutes.get('/',UserController.read)
UserRoutes.post("/login", UserController.login);
UserRoutes.post("/register", UserController.register);
UserRoutes.put("/update-user/:id", adminAuth, UserController.updateUser);
UserRoutes.patch("/change-password/:id", UserController.chagePassword);
UserRoutes.post(
  "/upload-photo/:user_id",
  fileUploader({ createParentPath: true }),
  UserController.uploadPhoto
);
UserRoutes.post("/set-forgotton-password", UserController.setForgottonPassword);
UserRoutes.patch("/add-address/:id", UserController.addAddress);
UserRoutes.patch("/edit-address/:id", UserController.editAddress);
UserRoutes.patch("/set-default-address/:id", UserController.setDefaultAddress);
UserRoutes.patch("/delete-address/:id", UserController.deleteAddress);
UserRoutes.post("/send-otp", generateOtp);
UserRoutes.put('/toggle-status/:user_id/:status',UserController.toggleStatus)
UserRoutes.get('/move-to-trash/:user_id',UserController.moveToTrash)
UserRoutes.delete(
  "/delete/:user_id",UserController.deleteUser
)

module.exports = UserRoutes;
