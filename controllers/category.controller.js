const CategoryModel = require("../models/categories.model");
const ProductModel = require("../models/products.model");

const getTrashCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ deletedAt: {$ne:null} }).sort({
      createdAt: -1,
    });
    res.send({
      flag: 1,
      categories,
    });
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};

const read = async (req, res) => {
  const { id } = req.params;
  const {page,limit} = req.query;
  let skip = 0;
  let Limit = limit ? Number(limit) : null; // If limit is not provided, keep it as null
  if(page && Limit){
    skip = Limit * (Number(page)-1)
  }
  try {
    if (id) {
      const category = await CategoryModel.findById(id);
      res.send({
        flag: 1,
        category,
      });
    } else {
      const totalProducts = await CategoryModel.countDocuments();
      const categories = await CategoryModel.find({ deletedAt: null }).sort({
        createdAt: -1,
      }).skip(skip).limit(Limit);
      const data=[];
      const allPromisses = categories.map(
        async (category)=>{
         const productCount = await ProductModel.find({category:category._id}).countDocuments();
         data.push({
          ...category.toJSON(),productCount
         })
        }
      )
      await Promise.all(allPromisses);

      res.send({
        flag: 1,
        categories:data,
        totalProducts,
        Limit
      });
    }
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};

const readOne = async (req, res) => {
  const { name } = req.params;
  try {
    const category = await CategoryModel.findOne({ name: name });
    if (category) {
      res.send({
        flag: 1,
        message: "Category already exists.",
      });
    } else {
      res.send({
        flag: 0,
        message: "Category does not exists.",
      });
    }
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};

const create = async (req, res) => {
  const { name, slug } = req.body;
  const CategoryExisting = await CategoryModel.findOne({ name: name });
  if (CategoryExisting) {
    res.send({
      flag: 0,
      message: "Category already exists.",
    });
  } else {
    const category = await CategoryModel({ name, slug });
    category
      .save()
      .then((success) => {
        res.send({
          flag: 1,
          message: "Category created successfully.",
        });
      })
      .catch((err) => {
        console.log(err.message);
        res.send({
          flag: 0,
          message: "Unable to create Category.",
        });
      });
  }
};

const toggleStatus = (req, res) => {
  const { id, status } = req.params;
  try {
    CategoryModel.updateOne({ _id: id }, { status: status })
      .then((success) => {
        res.send({
          flag: 1,
          message: "Category status updated successfully.",
        });
      })
      .catch((err) => {
        res.send({
          flag: 0,
          message: "Unable to update Category status.",
        });
      });
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};

const editCategory = async (req, res) => {
  const { id } = req.params;
  try {
    CategoryModel.updateOne({ _id: id }, { ...req.body })
    .then((success) => {
      res.send({
        flag: 1,
        message: "Category updated successfully.",
      });
    })
    .catch((err) => {
      res.send({
        flag: 0,
        message: "Unable to update Category.",
      });
    });
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
}

const restoreCategory = (req, res) => {
  const { id } = req.params;
  try {
    CategoryModel.updateOne({ _id: id }, { deletedAt: null })
      .then(() => {
        res.send({
          flag: 1,
          message: "Category restored successfully.",
        });
      })
      .catch(() => {
        res.send({
          flag: 0,
          message: "Unable to restore Category.",
        });
      });
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};
const moveToTrash = (req, res) => {
  const { id } = req.params;
  try {
    CategoryModel.findByIdAndUpdate({ _id: id }, { deletedAt: Date.now() })
      .then(() => {
        res.send({
          flag: 1,
          message: "Category trashed.",
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
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await CategoryModel.findByIdAndDelete(id);
  if (category) {
    res.send({
      flag: 1,
      message: "Category deleted successfully.",
    });
  } else {
    res.send({
      flag: 0,
      message: "Unable to delete Category.",
    });
  }
};

module.exports = {
  read,
  create,
  deleteCategory,
  toggleStatus,
  readOne,
  moveToTrash,
  getTrashCategories,
  restoreCategory,
  editCategory,
};
