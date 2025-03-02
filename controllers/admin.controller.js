const bcrypt = require("bcrypt");
const AdminModel = require("../models/admin.model");
const { generateToken } = require("../helper");

const AdminController = {
  async checkAdminByEmail(req, res) {
    try {
      const { email } = req.params;
      if (!email) {
        return res.send({
          flag: 0,
          message: "Admin Email required!",
        });
      }
      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        return res.send({
          flag: 0,
          message: "Admin email not exists!",
        });
      }
      res.send({
        flag: 1,
        message: "Admin email exists",
      });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal server problem!",
      });
    }
  },
  async read(req, res) {
    try {
      const { id } = req.params;
      if (id) {
        const admin = await AdminModel.findOne({ _id: id });
        if (!admin) {
          return res.send({
            flag: 0,
            message: "No Admin Found",
          });
        }
        return res.send({
          flag: 1,
          message: "Admin Found",
          admin: { ...admin._doc, password: "" },
        });
      }
      const adminList = await AdminModel.find({ deletedAt: null });
      if (!adminList) {
        return res.send({
          flag: 0,
          message: "No Admin User.",
        });
      }
      admins = adminList.map((admin) => ({ ...admin._doc, password: "" }));
      res.send({
        flag: 1,
        message: "All Admins",
        admins,
      });
    } catch (error) {
      console.log("Error", error.message);
      res.send({
        flag: 0,
        message: "Internal server problem.",
      });
    }
  },
  async getTrash(req, res) {
    try {
      const admins = await AdminModel.find({ deletedAt: { $ne: null } });
      if (!admins) {
        return res.send({
          flag: 0,
          message: "No admins!",
        });
      }
      res.send({
        flag: 1,
        admins,
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem!",
      });
    }
  },
  async register(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.send({
          flag: 0,
          message: "Email and password are required",
        });
      }
      const existingEmail = await AdminModel.findOne({ email: email });
      if (existingEmail) {
        return res.send({
          flag: 0,
          message: "Email already exists",
        });
      }
      const hash = await bcrypt.hash(password, 13);
      const admin = new AdminModel({ ...req.body, password: hash });
      const newAdmin = await admin.save();
      res.send({
        flag: 1,
        message: "Admin registered successfully",
        admin: { ...newAdmin._doc, password: "" },
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.send({
          flag: 0,
          message: "Email and password are required",
        });
      }
      const admin = await AdminModel.findOne({ email: email });
      if (!admin) {
        return res.send({
          flag: 0,
          message: "Email not found",
        });
      }
      if (!admin.status) {
        return res.send({
          flag: 0,
          message: "Email is blocked",
        });
      }
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.send({
          flag: 0,
          message: "Invalid password",
        });
      }
      res.send({
        flag: 1,
        message: "Admin login successfully",
        admin: { ...admin._doc, password: "" },
        token: generateToken(admin.toJSON()),
      });
    } catch (error) {
      console.log(error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async toggleStatus(req, res) {
    try {
      const { id, status } = req.params;
      if (!id) {
        return res.send({
          flag: 0,
          message: "Admin id is required",
        });
      }
      const admin = await AdminModel.findOne({ _id: id });
      if (!admin) {
        return res.send({
          flag: 0,
          message: "No Admin Found.",
        });
      }
      admin.status = status;
      const updatedAdmin = await admin.save();
      res.send({
        flag: 1,
        message: "Status changed successfully.",
        updatedAdmin: { ...updatedAdmin._doc, password: "" },
      });
    } catch (error) {
      console.log("Error", error.message);
      res.send({
        flag: 0,
        message: "Internal server problem",
      });
    }
  },
  async moveToTrash(req, res) {
    try {
      const { admin_id } = req.params;
      const admin = await AdminModel.findOne({ _id: admin_id });
      if (!admin) {
        return res.send({
          flag: 0,
          message: "No admin found!",
        });
      }
      admin.deletedAt = Date.now();
      await admin.save();
      res.send({
        flag: 1,
        message: "Moved to trash!",
      });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal server problem!",
      });
    }
  },
  async restoreAdmin(req, res) {
    try {
      const { admin_id } = req.params;
      const admin = await AdminModel.findOne({ _id: admin_id });
      if (!admin) {
        return res.send({
          flag: 0,
          message: "No admin found!",
        });
      }
      admin.deletedAt = null;
      await admin.save();
      res.send({
        flag: 1,
        message: "Admin restore!",
      });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal server problem!",
      });
    }
  },
  async updateAdmin(req, res) {
    try {
      const { admin_id } = req.params;
      if (!admin_id) {
        return res.send({
          flag: 0,
          message: "Admin is is required!",
        });
      }
      const admin = await AdminModel.findByIdAndUpdate(
        { _id: admin_id },
        { ...req.body }
      );
      if (!admin) {
        return res.send({
          flag: 0,
          message: "No admin found!",
        });
      }
      res.send({
        flag: 1,
        message: "Admin updated successfully!",
      });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal server problem!",
      });
    }
  },
  async changePassword(req, res) {
    try {
      const { admin_email } = req.params;
      const { password } = req.body;
      const admin = await AdminModel.findOne({ email: admin_email });
      if (!admin) {
        return res.send({
          flag: 0,
          message: "No Admin found!",
        });
      }
      if (!password) {
        return res.send({
          flag: 0,
          message: "Password is required!",
        });
      }
      const passwordHash = await bcrypt.hash(password, 13);
      admin.password = passwordHash;
      await admin.save();
      res.send({
        flag: 1,
        message: "Password changed successfully!",
      });
    } catch (error) {
      res.send({
        flag: 0,
        message: "Internal server problem!",
      });
    }
  },
};
module.exports = AdminController;
