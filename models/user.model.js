const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
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
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    address: [
      {
        name: {
          type: String,
        },
        phone: {
          type: String,
        },
        house: {
          type: String,
        },
        pin: {
          type: String,
        },
        area: {
          type: String,
        },
        block: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserModel = new mongoose.model("User", UserSchema);
module.exports = UserModel;
