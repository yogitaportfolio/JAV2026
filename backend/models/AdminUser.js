const mongoose = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { String } = require("core-js");
require("dotenv").config();

const adminuserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    pwd: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      enum: [
        "Operator",
        "Admin",
        "Receptionist",
        "Reviewer",
        "Counsellor",
        "Hematology Lab Operator",
        "Andrology Lab Operator",
      ],
      set: (value) => {
        if (!value) return value;
        const normalized = String(value).trim().toLowerCase();
        if (normalized === "operator") return "Operator";
        if (normalized === "admin") return "Admin";
        if (normalized === "receptionist") return "Receptionist";
        if (normalized === "reviewer") return "Reviewer";
        if (normalized === "counsellor") return "Counsellor";
        if (normalized === "hematology lab operator") return "Hematology Lab Operator";
        if (normalized === "andrology lab operator") return "Andrology Lab Operator";
        return value;
      },
    },
    name: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    // location: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "locations",
    // },
    specialization: {
      type: String,
      trim: true,
    },
    opd_location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "locations",
    },
    opd_doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminusers",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    tokens: [
      {
        _id: false,
        token: { type: String, required: true },
        token_expiry: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
  { bufferTimeoutMS: 30000 }
);
adminuserSchema.index({ username: 1 });

adminuserSchema.pre("save", async function () {
  // Hash the password before saving the user model
  const adminuser = this;
  if (adminuser.isModified("pwd")) {
    adminuser.pwd = await bcrypt.hash(adminuser.pwd, 9);
  }
});


adminuserSchema.methods.generateAuthToken = async function () {
  // Generate an auth token for the user
  const adminuser = this;
  const token = jwt.sign({ _id: adminuser._id }, process.env.JWT_KEY);
  const token_expiry = moment().add(1, "day");
  adminuser.tokens = adminuser.tokens.concat({ token, token_expiry });
  await adminuser.save();
  return token;
};

adminuserSchema.statics.login = async (username, pwd) => {
  const adminuser = await AdminUser.findOne({ username }).maxTimeMS(30000).allowDiskUse(true);

  if (!adminuser) {
    throw new Error("Invalid credentials.");
  }
  if (!adminuser.is_active) {
    throw new Error("Your account has been deactivated.");
  }
  const isPasswordMatch = await bcrypt.compare(pwd, adminuser.pwd);
  if (!isPasswordMatch) {
    throw new Error("Invalid credentials.");
  }
  return adminuser;
};


adminuserSchema.statics.changepassword = async (
  adminuser_id,
  oldpwd,
  newpwd
) => {
  let adminuser = await AdminUser.findOne({
    _id: new mongoose.Types.ObjectId(adminuser_id),
  });
  if (!adminuser) {
    throw new Error("Invalid user.");
  }
  const isPasswordMatch = await bcrypt.compare(oldpwd, adminuser.pwd);
  if (!isPasswordMatch) {
    throw new Error("Invalid old password.");
  } else {
    adminuser = await AdminUser.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(adminuser_id) },
      { pwd: await bcrypt.hash(newpwd, 9) },
      { new: true }
    );
  }

  return adminuser;
};

adminuserSchema.statics.resetpassword = async (adminuser_id, newpwd) => {
  const adminuser = await AdminUser.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(adminuser_id) },
    { pwd: await bcrypt.hash(newpwd, 9) },
    { new: true }
  );

  if (!adminuser) {
    throw new Error("Invalid user.");
  }

  return adminuser;
};
const AdminUser = mongoose.model("adminusers", adminuserSchema);

module.exports = AdminUser;
