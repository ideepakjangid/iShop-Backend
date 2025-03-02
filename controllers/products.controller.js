const { getName } = require("../helper");
const ProductModel = require("../models/products.model");
const CategoryModel = require("../models/categories.model");
const ColorModel = require("../models/colors.model");
const fs = require("fs");

const ProductController = {
  readOne(req, res) {
    const { name } = req.params;

    ProductModel.findOne({ name })
      .then((product) => {
        if (product) {
          res.send({
            flag: 1,
            message: "Product already exists.",
          });
        } else {
          res.send({
            flag: 0,
            message: "Product not found.",
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err.message);
        res.send({
          flag: 0,
          message: "Internal server problem.",
        });
      });
  },
  async getTrashProducts(req, res) {
    try {
      const products = await ProductModel.find({
        deletedAt: { $ne: null },
      })
        .populate(["category", "color"])
        .sort({
          createdAt: -1,
        });
      res.send({
        flag: 1,
        products,
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  },
  async read(req, res) {
    const { id } = req.params;
    const { category_slug, search, min, max, color, sortByName, page, limit } =
      req.query;

    let skip = 0;
    let Limit = limit ? Number(limit) : null; // If limit is not provided, keep it as null
    if (page && Limit) {
      skip = Limit * (page - 1);
    }

    let filterQuery = { deletedAt: null };
    let sortOption = { name: 1 };

    if (min > 0 && max > 0) {
      filterQuery.original_price = { $gte: min, $lte: max };
    }

    if (sortByName && sortByName === "decending") {
      sortOption.name = -1;
    }

    if(search){
      filterQuery.name = { $regex: new RegExp(search, "i") };
    }  
  

    if (color) {
      const colorId = [];
      const allPromises = color.split(",").map(async (col) => {
        const colorData = await ColorModel.findOne({ slug: col });
        if (colorData) {
          colorId.push(colorData._id);
        }
      });
      await Promise.all(allPromises);
      filterQuery.color = { $in: colorId };
    }

    try {
      if (category_slug) {
        const category = await CategoryModel.findOne({ slug: category_slug });
        if (category) {
          filterQuery.category = category._id;
        }
      }

      if (id) {
        const product = await ProductModel.findById(id).populate([
          "category",
          "color",
        ]);
        res.send({
          flag: 1,
          product,
        });
      } else {
        const totalProducts = await ProductModel.countDocuments(filterQuery);

        let query = ProductModel.find(filterQuery)
          .populate(["category", "color"])
          .sort(sortOption);

        if (Limit) {
          query = query.skip(skip).limit(Limit);
        }

        const products = await query;

        res.send({
          flag: 1,
          products,
          totalProducts,
          skip,
          Limit: Limit || totalProducts, // If limit is not provided, return total products count
        });
      }
    } catch (error) {
      console.log("Error", error.message);
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  },
  async create(req, res) {
    const data = {
      name: req.body.name,
      slug: req.body.slug,
      category: req.body.category,
      color: JSON.parse(req.body.colors),
      original_price: req.body.originalPrice,
      discounted_price: req.body.discountedPrice,
      discount_percent: req.body.discountPercent,
    };
    const file = req.files.image;
    const newFileName = getName(file.name);
    const destination = `./public/images/products/` + newFileName;
    file.mv(destination, async (err) => {
      if (err) {
        console.log(err);
      } else {
        data.image = newFileName;
        const product = await ProductModel({ ...data });
        product
          .save()
          .then(() => {
            res.send({
              flag: 1,
              message: "Product created successfully.",
            });
          })
          .catch((err) => {
            console.log(err.message);
            res.send({
              flag: 0,
              message: "Unable to create Product.",
            });
          });
      }
    });
  },
  async uploadOtherImages(req, res) {
    const { id } = req.params;

    try {
      // // Check if req.files exists
      // if (!req.files || !req.files.other_images) {
      //   return res.status(400).send({
      //     flag: 0,
      //     message: "No files uploaded.",
      //   });
      // }

      // Handle single or multiple file uploads
      const other_images = Array.isArray(req.files.other_images)
        ? req.files.other_images // Multiple files
        : [req.files.other_images]; // Single file converted to array

      for (let image of other_images) {
        const destination = `./public/other-images/products/${image.name}`;
        await image.mv(destination, async (err) => {
          if (err) {
            console.log("Error:", err.message);
          } else {
            const product = await ProductModel.findById(id);
            const existingImages = product.other_images;
            const finalImages = [...existingImages, image.name];
            const finalProuductImages = await ProductModel.findByIdAndUpdate(
              { _id: id },
              {
                other_images: finalImages,
              }
            );
            finalProuductImages
              .save()
              .then(() => {
                res.send({
                  flag: 1,
                  message: "Images uploaded successfully",
                  other_images: finalImages,
                });
              })
              .catch((err) => {
                res.send({
                  flag: 0,
                  message: "Something went wrong...",
                });
              });
          }
        });
      }
    } catch (error) {
      console.error("Error in uploading other images:", error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  async removeOtherPhoto(req, res) {
    const { image } = req.body;
    try {
      const product = await ProductModel.findById(req.params.id);
      const existingImages = product.other_images;
      const indexVal = existingImages.indexOf(image);
      existingImages.splice(indexVal, 1);
      product.other_images = existingImages;
      product
        .save()
        .then(() => {
          fs.unlink(`../public/other-images/products/${image}`, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              return;
            }
          });
          res.send({
            flag: 1,
            message: "Image deleted successfully",
            other_images: existingImages,
          });
        })
        .catch((err) => {
          console.log(err);
          res.send({
            flag: 0,
            message: "Unable to delete Image...",
          });
        });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  },
  async edit(req, res) {
    const { id } = req.params;
    const image = req.files?.image;
    try {
      const product = await ProductModel.findById(id);

      const data = {
        name: req.body.name,
        slug: req.body.slug,
        category: req.body.category,
        color: JSON.parse(req.body.colors),
        original_price: req.body.originalPrice,
        discounted_price: req.body.discountedPrice,
        discount_percent: req.body.discountPercent,
      };
      if (image) {
        imageName = getName(image.name);
        const destination = `./public/images/products/` + imageName;
        await image.mv(destination);
        data.image = imageName;
      }
      await ProductModel.updateOne({ _id: id }, data);
      if (image) {
        fs.unlink(`./public/images/products/${product.image}`, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
        });
      }
      res.send({
        flag: 1,
        message: "Prduct updated successfully.",
      });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  },
  moveToTrash(req, res) {
    const { id } = req.params;
    try {
      ProductModel.findByIdAndUpdate({ _id: id }, { deletedAt: Date.now() })
        .then(() => {
          res.send({
            flag: 1,
            message: "Product trashed.",
          });
        })
        .catch(() => {
          res.send({
            flag: 0,
            message: "Unable to trashed.",
          });
        });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  },
  toggleStatus(req, res) {
    const { id, status } = req.params;
    try {
      ProductModel.updateOne({ _id: id }, { status: status })
        .then((success) => {
          res.send({
            flag: 1,
            message: "Product status updated successfully.",
          });
        })
        .catch((err) => {
          res.send({
            flag: 0,
            message: "Unable to update Product status.",
          });
        });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  },
  async deleteCategory(req, res) {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (product) {
      res.send({
        flag: 1,
        message: "Product deleted successfully.",
      });
    } else {
      res.send({
        flag: 0,
        message: "Unable to delete Product.",
      });
    }
  },
  async restoreCategory(req, res) {
    const { id } = req.params;
    try {
      ProductModel.updateOne({ _id: id }, { deletedAt: null })
        .then(() => {
          res.send({
            flag: 1,
            message: "Product restored successfully.",
          });
        })
        .catch(() => {
          res.send({
            flag: 0,
            message: "Unable to restore Product.",
          });
        });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  },
};
module.exports = ProductController;
