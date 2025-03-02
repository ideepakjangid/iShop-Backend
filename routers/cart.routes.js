const express = require('express');
const CartController = require('../controllers/cart.controller')
const CartRoutes = express.Router();

CartRoutes.post(
    '/add-cart-item',
    CartController.addCartItem
)
CartRoutes.post(
    '/decrease-quantity',
    CartController.decQuantity
)
CartRoutes.delete(
    '/delete-cart-item',
    CartController.deleteCartItem
)
module.exports = CartRoutes;