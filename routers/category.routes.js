const express =  require('express');
const CategoryController = require('../controllers/category.controller');

const CategoryRoutes=express.Router();

CategoryRoutes.get(
    "/get-category/:name",CategoryController.readOne
)
CategoryRoutes.get(
    "/get-trash",CategoryController.getTrashCategories
)
CategoryRoutes.get(
    "/move-to-trash/:id",CategoryController.moveToTrash
)
CategoryRoutes.get(
    "/:id?",CategoryController.read
)
CategoryRoutes.post(
    "/create",CategoryController.create
)
CategoryRoutes.put(
    "/toggle-status/:id/:status",CategoryController.toggleStatus
)
CategoryRoutes.put(
    "/restore/:id/",CategoryController.restoreCategory
)
CategoryRoutes.patch(
    "/edit/:id",CategoryController.editCategory
)
CategoryRoutes.delete(
    "/delete/:id",CategoryController.deleteCategory
)

module.exports = CategoryRoutes;