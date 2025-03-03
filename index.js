const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CategoryRoutes = require("./routers/category.routes");
const ColorRoutes = require("./routers/color.routes");
const ProductRoutes = require("./routers/products.routes");
const AccessoryRoutes = require("./routers/accessory.routes");
const UserRoutes = require("./routers/user.routes");
const AdminRoutes = require("./routers/admin.routes");
const CartRoutes = require("./routers/cart.routes");
const OrderRoutes = require("./routers/order.routes");
const TransactionRoutes = require("./routers/transaction.routes");

const app = express();
app.use(express.static("public"));

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

const PORT = 5000;

app.use("/accessory", AccessoryRoutes);
app.use("/category", CategoryRoutes);
app.use("/color", ColorRoutes);
app.use("/product", ProductRoutes);
app.use("/user", UserRoutes);
app.use("/admin", AdminRoutes);
app.use("/cart", CartRoutes);
app.use("/order", OrderRoutes);
app.use("/transaction", TransactionRoutes);

app.use("/*", (req, res) => {
  res.status(404).json({ message: "Not Found" });
});

try {
  mongoose
    .connect(process.env.MOONGO_URI, { dbName: "ecommerce" })
    .then((success) => {
      console.log("DB connected...");
      app.listen(PORT, () => {
        console.log("Server Started...");
      });
    })
    .catch((err) => {
      console.log("DB not connected Error: ", err.message);
    });
} catch (error) {
  console.log("Error : ", error.message);
}
