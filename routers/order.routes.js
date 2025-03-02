const express = require('express');
const OrderController = require('../controllers/order.controller')
const OrderRoutes = express.Router();

OrderRoutes.get(
    '/',
    OrderController.getOrders
)
OrderRoutes.get(
    '/:user_id',
    OrderController.getOrderByUserId
)

OrderRoutes.post(
    '/create',
    OrderController.create
)
OrderRoutes.post(
    '/delete-order/:order_id',
    OrderController.deleteOrder
)

OrderRoutes.post(
    '/payment-success',
    OrderController.paymentSuccess
)
OrderRoutes.post(
    '/payment-failed',
    OrderController.paymentFailed
)

module.exports = OrderRoutes