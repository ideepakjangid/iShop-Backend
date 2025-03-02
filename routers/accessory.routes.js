const express = require('express');
const fileUplaod = require('express-fileupload')
const AccessoryController = require('../controllers/accessory.controller');
const AccessoryRoutes = express.Router();

AccessoryRoutes.get(
    "/get-accessory/:name",AccessoryController.readOne
)
AccessoryRoutes.get(
    "/get-trash",AccessoryController.getTrashAccessory
);
AccessoryRoutes.get(
    '/:id?',AccessoryController.read
);
AccessoryRoutes.post(
    '/create',
    fileUplaod({
        createParentPath:true
    }),
    AccessoryController.create
);
AccessoryRoutes.put(
    "/toggle-status/:id/:status",AccessoryController.toggleStatus
);

AccessoryRoutes.get(
    "/move-to-trash/:id",AccessoryController.moveToTrash
);
AccessoryRoutes.put(
    '/edit-accessory/:id',
    fileUplaod({createParentPath:true}),
    AccessoryController.editAccessory
)
AccessoryRoutes.put(
    "/restore/:id/",AccessoryController.restoreCategory
);
AccessoryRoutes.delete(
    "/delete/:id",AccessoryController.deleteCategory
)
module.exports = AccessoryRoutes;