const express = require('express');
const AdminController = require('../controllers/admin.controller');
const AdminRoutes = express.Router();

AdminRoutes.get(
    '/get-trash',
    AdminController.getTrash
)
AdminRoutes.get(
    '/check-admin/:email',
    AdminController.checkAdminByEmail
)
AdminRoutes.get(
    '/:id?',
    AdminController.read
)
AdminRoutes.post(
    '/login',
    AdminController.login
)
AdminRoutes.post(
    '/register',
    AdminController.register
)
AdminRoutes.post(
    '/update-admin/:admin_id',
    AdminController.updateAdmin
)
AdminRoutes.post(
    '/change-password/:admin_email',
    AdminController.changePassword
)
AdminRoutes.put(
    '/toggle-status/:id/:status',
    AdminController.toggleStatus
)
AdminRoutes.get(
    '/move-to-trash/:admin_id',
    AdminController.moveToTrash
)
AdminRoutes.put(
    '/restore/:admin_id',
    AdminController.restoreAdmin
)

module.exports = AdminRoutes;