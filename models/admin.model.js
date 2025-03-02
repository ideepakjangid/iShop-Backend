const mongoose = require("mongoose");
const AdminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      dufault: null,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    address: {
      type: String,
      default: null,
    },
    deletedAt:{
      type:Date,
      default:null
    },
    status:{
      type:Boolean,
      default:null
    }
  },
  {
    timestamps: true,
  }
);

const AdminModel = mongoose.model("admin", AdminSchema);
module.exports = AdminModel;
