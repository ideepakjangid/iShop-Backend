const { getName } = require("../helper");
const AccessoryModel = require("../models/accessory.model");
const fs = require("fs");

const AccessoryController = {
  readOne(req, res) {
    const { name } = req.params;

    AccessoryModel.findOne({ name })
      .then((accessory) => {
        if (accessory) {
          res.send({
            flag: 1,
            message: "Accessory already exists.",
          });
        } else {
          res.send({
            flag: 0,
            message: "Accessory not found.",
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching accessory:", err.message);
        res.send({
          flag: 0,
          message: "Internal server problem.",
        });
      });
  },
  async read(req, res) {
    try {
      const { id } = req.params;
      if (id) {
        const accessory = await AccessoryModel.findById(id).populate("product");
        res.send({
          flag: 1,
          accessory,
        });
      } else {
        const accessories = await AccessoryModel.find({ deletedAt: null })
          .populate("product")
          .sort({ createAt: -1 });
        res.send({
          flag: 1,
          accessories,
        });
      }
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  async create(req, res) {
    try {
      const data = {
        name: req.body.name,
        slug: req.body.slug,
        product: req.body.product,
        original_price: req.body.originalPrice,
        discounted_price: req.body.discountedPrice,
        discount_percent: req.body.discountPercent,
      };
      const existName = await AccessoryModel.findOne({ name: data.name });
      if (existName) {
        res.send({
          flag: 0,
          message: "Accessory already exists.",
        });
      } else {
        const file = req.files.image;
        const newFileName = getName(file.name);
        const destination = "./public/images/accessory/" + newFileName;
        file.mv(destination, (err) => {
          if (err) {
            console.log(err.message);
          } else {
            data.image = newFileName;
            const accessory = new AccessoryModel({ ...data });
            accessory
              .save()
              .then(() => {
                res.send({
                  flag: 1,
                  message: "Accessory added successfully.",
                });
              })
              .catch((err) => {
                console.log(err.message);
                res.send({
                  flag: 0,
                  message: "Unable to add Accessory.",
                });
              });
          }
        });
      }
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  async editAccessory(req, res) {
    try {
      const id = req.params.id;
      const data = {
        name: req.body.name,
        slug: req.body.slug,
        product: req.body.product,
        original_price: req.body.originalPrice,
        discounted_price: req.body.discountedPrice,
        discount_percent: req.body.discount_percent,
      };
      if (id) {
        const accessory = await AccessoryModel.findOne({ _id: id });
        if (accessory) {
          const image = req.files?.image;
          if (image) {
            const newImageName = getName(image.name);
            const destination = "./public/images/accessory/" + newImageName;
            await image.mv(destination, async (err) => {
              if (err) {
                console.log("Image error", err.message);
              } else {
                data.image = newImageName;
                await AccessoryModel.updateOne({ _id: id }, { ...data });
                fs.unlink(`./public/images/accessory/${accessory.image}`,
                  (err)=>{
                    if(err){
                      console.log("Image Unlink Error",err.message);                      
                    }
                  });
                res.send({
                  flag: 1,
                  message: "Accessory updated successfully.",
                });
              }
            });
          } else {
            await AccessoryModel.updateOne({ _id: id }, { ...data });
            res.send({
              flag: 1,
              message: "Accessory updated successfully.",
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  toggleStatus(req, res) {
    try {
      const { id, status } = req.params;
      if (id) {
        AccessoryModel.findByIdAndUpdate({ _id: id }, { status: status })
          .then(() => {
            res.send({
              flag: 1,
              message: "Status updated successfully...",
            });
          })
          .catch((err) => {
            console.log(err.message);
            res.send({
              flag: 0,
              message: "Unable to update status...",
            });
          });
      }
    } catch (error) {
      console.log(err.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async getTrashAccessory(req, res) {
    try {
      const accessories = await AccessoryModel.find({
        deletedAt: { $ne: null },
      })
        .populate("product")
        .sort({ createAt: -1 });
      res.send({
        flag: 1,
        accessories,
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  moveToTrash(req, res) {
    try {
      AccessoryModel.findByIdAndUpdate(
        { _id: req.params.id },
        { deletedAt: Date.now() }
      )
        .then(() => {
          res.send({
            flag: 1,
            message: "Accessory trashed...",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.send({
            flag: 0,
            message: "Unable to trasd Accessory",
          });
        });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  restoreCategory(req, res) {
    AccessoryModel.findByIdAndUpdate(
      { _id: req.params.id },
      { deletedAt: null }
    )
      .then(() => {
        res.send({
          flag: 1,
          message: "Accessory restored...",
        });
      })
      .catch((err) => {
        console.log(err.message);
        message: "Unable to restore Accessory...";
      });
  },
  deleteCategory(req, res) {
    try {
      AccessoryModel.deleteOne({ _id: req.params.id })
        .then(() => {
          res.send({
            flag: 1,
            message: "Accessory deleted successfully.",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.send({
            flag: 0,
            message: "Unable to delete Accessory.",
          });
        });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
};

module.exports = AccessoryController;
