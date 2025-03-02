const express = require('express');
const TransactionController = require('../controllers/transactioin.controller');
const TransactionRoutes = express.Router();

TransactionRoutes.get(
    '/', TransactionController.read
)

module.exports = TransactionRoutes