const ColorModel = require("../models/colors.model");

const read = async (req, res) => {
  const { id } = req.params;
  try {
    if (id) {
      const color = await ColorModel.findById(id);
      res.send({
        flag: 1,
        color,
      });
    } else {
      const colors = await ColorModel.find({deletedAt:null}).sort({createAt:-1});
      res.send({
        flag: 1,
        colors,
      });
    }
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};
const readOne = (req,res)=>{
  const {name} = req.params;
  ColorModel.findOne({name:name})
  .then(
    (color)=>{
      if(color){
        res.send(
          {
            flag:1,
            message:"Color name alread exists."
          }
        )
      }else{
        res.send(
          {
            flag:0,
            message:"Colorn name not found."
          }
        )
      }
    }
  ).catch(
    (error)=>{
      console.log("Error in fetching color name",error.message);
      res.send(
        {
          flag:0,
          message:"Internal server problem."
        }
      )
    }
  
  )
}

const trashColors = async (req,res)=>{
try {
    const colors = await ColorModel.find({deletedAt:{$ne:null}}).sort({createAt:-1});
    res.send({
      flag: 1,
      colors,
    });
} catch (error) {
    res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
}
}

const create = async (req, res) => {
  const { name, hxcode,slug } = req.body;
  console.log(req.body)
  try {
    const existingHxCode = await ColorModel.findOne({ hxcode: hxcode });
    if (existingHxCode) {
      res.send({
        flag: 0,
        message: "Color name already exists.",
      });
    } else {
      const color = ColorModel({ name: name, hxcode: hxcode,slug:slug });
      color
        .save()
        .then(() => {
          res.send({
            flag: 1,
            message: "Color added successfully",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.send({
            flag: 0,
            message: "Unable to add color.",
          });
        });
    }
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};

const moveToTrashed = (req, res) => {
  const { id } = req.params;
  try {
    ColorModel.findByIdAndUpdate({ _id: id }, { deletedAt: Date.now() })
    .then(
        ()=>{
            res.send(
                {
                    flag:1,
                    message:"Color moved to trash."
                }
            )
        }
    ).catch(
        (err)=>{
            console.log(err.message)
            res.send(
                {
                    flag:0,
                    message:"Unable to trash color"
                }
            )
        }
    )
  } catch (error) {
    res.send({
      flag: 0,
      message: "Internal Server Problem.",
    });
  }
};

const entireUpdate = (req,res)=>{
    const {id}=req.params;
    try {
        if(id){
            ColorModel.findByIdAndUpdate({_id:id},{...req.body})
            .then(
                ()=>{
                    res.send(
                        {
                            flag:1,
                            message:"Color updated successfully."
                        }
                    )
                }
            ).catch(
                (err)=>{
                    console.log(err.message)
                    res.send(
                        {
                            flag:0,
                            message:"Unable to update color."
                        }
                    )
                }
            )
        }
    } catch (error) {
        res.send({
            flag: 0,
            message: "Internal Server Problem.",
          });
    }
}

const restoreColor = (req, res) => {
    const { id } = req.params;
    try {
      ColorModel.updateOne({ _id: id }, { deletedAt: null })
        .then(() => {
          res.send({
            flag: 1,
            message: "Color restored successfully.",
          });
        })
        .catch(() => {
          res.send({
            flag: 0,
            message: "Unable to restore Color.",
          });
        });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  };

  const toggleStatus = (req, res) => {
    const { id, status } = req.params;
    try {
      ColorModel.updateOne({ _id: id }, { status: status })
        .then((success) => {
          res.send({
            flag: 1,
            message: "Color status updated successfully.",
          });
        })
        .catch((err) => {
          res.send({
            flag: 0,
            message: "Unable to update Color status.",
          });
        });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal Server Problem.",
      });
    }
  };

const deleteColor = async (req, res) => {
    const { id } = req.params;
    const color = await ColorModel.findByIdAndDelete(id);
    if (color) {
      res.send({
        flag: 1,
        message: "Color deleted successfully.",
      });
    } else {
      res.send({
        flag: 0,
        message: "Unable to delete Color.",
      });
    }
  };

module.exports = { read,readOne, create, moveToTrashed, entireUpdate,toggleStatus, trashColors, deleteColor,restoreColor };
