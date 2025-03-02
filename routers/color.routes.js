const express = require('express')
const ColorController = require('../controllers/color.controller')

const ColorRoutes = express.Router();

ColorRoutes.get(
    "/get-color/:name",ColorController.readOne
)

ColorRoutes.get(
    "/trash-colors",ColorController.trashColors
)

ColorRoutes.get(
    "/color-trash/:id",ColorController.moveToTrashed
)

ColorRoutes.get(
    "/:id?",ColorController.read
)

ColorRoutes.post(
    "/create", ColorController.create
)
ColorRoutes.patch(
    "/edit-color/:id",ColorController.entireUpdate
)
ColorRoutes.put(
    "/toggle-status/:id/:status",ColorController.toggleStatus
)
ColorRoutes.put(
    "/restore/:id/",ColorController.restoreColor
)
ColorRoutes.delete(
    "/delete/:id",ColorController.deleteColor
)

module.exports=ColorRoutes