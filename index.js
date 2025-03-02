const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CategoryRoutes = require('./routers/category.routes');
const ColorRoutes = require("./routers/color.routes");
const ProductRoutes = require('./routers/products.routes');
const AccessoryRoutes = require('./routers/accessory.routes');
const UserRoutes = require('./routers/user.routes')
const AdminRoutes = require('./routers/admin.routes')
const CartRoutes = require('./routers/cart.routes')
const OrderRoutes = require('./routers/order.routes')
const TransactionRoutes = require('./routers/transaction.routes')

const app = express();
app.use(express.static("public"));

app.use(cors({origin:"*"}));
app.use(express.json());



const PORT = 5000;
const DATA_BASE_URL ="mongodb://localhost:27017/";


app.use('/accessory',AccessoryRoutes)
app.use("/category",CategoryRoutes)
app.use("/color",ColorRoutes)
app.use("/product",ProductRoutes)
app.use("/user",UserRoutes)
app.use("/admin",AdminRoutes)
app.use('/cart',CartRoutes)
app.use('/order',OrderRoutes)
app.use('/transaction',TransactionRoutes)




try {
    mongoose.connect(
        DATA_BASE_URL,
        {dbName:"ecommerce"}
    ).then(
        (success)=>{
            console.log("DB connected...")
            app.listen(
                PORT,
                ()=>{
                    console.log("Server Started...")
                }
            )
        }
    ).catch(
        (err)=>{
            console.log("DB not connected Error: ",err.message)
        }
    )
} catch (error) {
    console.log("Error : ",error.message)
}