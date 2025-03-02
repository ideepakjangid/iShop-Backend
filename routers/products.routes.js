const express = require("express");
const ProductController = require("../controllers/products.controller");
const fileUpload = require("express-fileupload");

const ProductRoutes = express.Router();

ProductRoutes.get(
    "/get-product/:name",ProductController.readOne
)

ProductRoutes.get("/get-trash", ProductController.getTrashProducts);
ProductRoutes.get("/:id?", ProductController.read);
ProductRoutes.post(
    "/upload-otherImages/:id",
    fileUpload({ createParentPath: true }),
    ProductController.uploadOtherImages
  );
ProductRoutes.post(
  "/create",
  fileUpload({
    createParentPath: true,
  }),
  ProductController.create
);
ProductRoutes.put(
  "/edit/:id",
  fileUpload({
    createParentPath: true,
  }),
  ProductController.edit
);


// ProductRoutes.patch("/edit/:id", ProductController.editProduct);
ProductRoutes.get("/move-to-trash/:id", ProductController.moveToTrash);
ProductRoutes.put(
  '/removeOtherPhoto/:id', ProductController.removeOtherPhoto
)
ProductRoutes.put("/toggle-status/:id/:status", ProductController.toggleStatus);
ProductRoutes.delete("/delete/:id", ProductController.deleteCategory);
ProductRoutes.put("/restore/:id/", ProductController.restoreCategory);
module.exports = ProductRoutes;
