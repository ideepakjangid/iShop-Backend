const TransactionModel = require("../models/transaction.model");
const OrderModel = require("../models/order.model");
const UserModel = require("../models/user.model");

const TransactionController = {
  async read(req, res) {
    try {
      const { order_id, transaction_id, email, status, name, startDate,endDate } = req.query;
      console.log("Value of query is",req.query)

      let filterQuery = {};
      console.log(req.query)
      if(startDate && endDate){
        const from =new Date(startDate);
        const to = new  Date(endDate);
        to.setHours(23, 59, 59, 999)
        filterQuery.createdAt = {$gte:from,$lte:to}
      }
      if (transaction_id) {
        filterQuery._id = transaction_id;
      }
      if (name && email) {
        const user = await UserModel.findOne({ email });
        if (user) {
          user.name != name;
          return res.send({
            flag: 0,
            message: "No transactions!",
            transactions: [],
          });
        }
      }
      if (name) {
        filterQuery.user_id = name;
        const user = await UserModel.findOne({ name });
        if (user) {
          filterQuery.user_id = user._id;
        }else{
          return res.send(
            {
              flag:0,
              transactions:[],
              message:"No customer found!"
            }
          )
        }
      }
      if (email) {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return res.send({
            flag: 1,
            transactions: [],
          });
        }
        filterQuery.user_id = user._id;
      }
    
      if (order_id) {
        filterQuery.order_id = order_id;
      }
      if (status) {
        const orders = await OrderModel.find({
          payment_status: Number(status),
        });
        let orderArray;
        if (orders.length > 0) {
          orderArray = orders.map((order) => {
            return order._id;
          });
        }
        filterQuery.order_id = { $in: orderArray };
      }
      if (order_id && status) {
        const order = await OrderModel.findOne({ _id: order_id });
        if (order) {
          console.log("Hai");
          console.log("Payment status", order.payment_status, Number(status));
          if (order.payment_status != Number(status)) {
            return res.send({
              flag: 0,
              message: "No transactioins!",
              transactions: [],
            });
          }
          filterQuery.order_id = order._id
        }
      }

      // Populate user_id and order_id fields
      const transactions = await TransactionModel.find(filterQuery)
        .populate({
          path: "order_id",
          select:
            "final_total original_total payment_method payment_status order_status",
        })
        .populate({ path: "user_id", select: "name email contact" });

      // Check if transactions array is empty
      if (transactions.length === 0) {
        return res.send({
          flag: 0,
          message: "No transactions found!",
          transactions: [],
        });
      }

      // Send success response
      res.send({
        flag: 1,
        message: "All transactions retrieved successfully",
        transactions,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).send({
        flag: 0,
        message: "Internal server error!",
        error: error.message,
      });
    }
  },
};

module.exports = TransactionController;
