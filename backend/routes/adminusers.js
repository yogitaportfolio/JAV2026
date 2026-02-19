const express = require("express");
const AdminUser = require("../models/AdminUser");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/insert", async (req, res) => {
  // Create a new user
  try {
    const { username, pwd, role, name } = req.body;
    const location = req.body?.locationId || req.body?.location;

    const adminuser = new AdminUser({
      username,
      pwd,
      role,
      name,
      location
    });

    await adminuser.save();
    const { token, token_expiry } = await adminuser.generateAuthToken();
    const response = { username: adminuser.username, token, token_expiry };
    return res.send({
      status: 1,
      message: "User registered successfully.",
      data: response,
    });
  } catch (error) {
    if (error.message.includes("duplicate key")) {
      if (error.message.includes("username:")) {
        return res.send({
          status: 0,
          message: "Username already exists.",
          data: "",
        });
      }
    } else {
      console.log(error, 'error')
      return res.send({
        status: 0,
        message: error.message,
        data: "",
      });
    }
  }
});
router.post("/login", async (req, res) => {
  try {
    const username = (req.body?.username || "").trim().toLowerCase();
    const pwd = req.body?.pwd || "";

    if (!username || !pwd) {
      return res.send({
        status: 0,
        message: "Username and password are required.",
        data: "",
      });
    }

    const adminuser = await AdminUser.login(username, pwd);
    if (!adminuser) {
      return res.send({
        status: 0,
        message: "Login failed! Check authentication credentials",
        data: "",
      });
    }
    const token = await adminuser.generateAuthToken();
 
    const response = {
      _id: adminuser._id,
      username: adminuser.username,
      role: String(adminuser.role || "").toLowerCase(),
      token
    };

    return res.send({
      status: 1,
      message: "Login successful.",
      data: response,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});
router.post("/logout", auth, async (req, res) => {
  // Log user out of the application
  try {
    req.adminuser.tokens = req.adminuser.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.adminuser.save();
    return res.send({ status: 1, message: "Logout successfully.", data: "" });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.post("/getall", async (req, res) => {
  try {
    const adminusers = await AdminUser.find({ username: { $ne: "admin" } })
      .select("-pwd -tokens")
      .sort({ createdAt: -1 })
      .lean();

    if (!adminusers) {
      return res.send({
        status: 0,
        message: "Query execution error.",
        data: "",
      });
    }

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: adminusers,
    });
  } catch (error) {
    console.log(error)
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});
router.post("/activate_deactivate", auth, async (req, res) => {
  try {
    const { adminuser_id, is_active } = req.body;

    const adminuser = await AdminUser.findByIdAndUpdate(
      adminuser_id,
      { is_active },
      { new: true }
    );

    if (!adminuser) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    } else {
      return res.send({
        status: 1,
        message: "User updated successfully.",
        data: "",
      });
    }
  } catch (error) {
    return res.send({ status: 0, message: "Something went wrong.", data: "" });
  }
});

router.post("/changepassword", auth, async (req, res) => {
  try {
    const { oldpwd, newpwd } = req.body;
    const adminuser = await AdminUser.changepassword(
      req.adminuser._id,
      oldpwd,
      newpwd
    );

    if (!adminuser) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    } else {
      return res.send({
        status: 1,
        message: "Password updated successfully.",
        data: "",
      });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.post("/resetpassword", auth, async (req, res) => {
  try {
    const { adminuser_id, username, newpwd } = req.body;
    let targetId = adminuser_id;

    if (!targetId && username) {
      const adminuserByName = await AdminUser.findOne({
        username: username.toLowerCase().trim(),
      })
        .select("_id")
        .lean();
      if (!adminuserByName) {
        return res.send({
          status: 0,
          message: "Invalid user.",
          data: "",
        });
      }
      targetId = adminuserByName._id;
    }

    if (!targetId) {
      return res.send({
        status: 0,
        message: "Invalid user.",
        data: "",
      });
    }

    const adminuser = await AdminUser.resetpassword(targetId, newpwd);

    if (!adminuser) {
      return res.send({
        status: 0,
        message: "Something went wrong.",
        data: "",
      });
    } else {
      return res.send({
        status: 1,
        message: "Password updated successfully.",
        data: "",
      });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { adminuser_id } = req.body || {};
    if (!adminuser_id) {
      return res.send({ status: 0, message: "Invalid user.", data: "" });
    }

    const update = {};
    const fields = [
      "username",
      "role",
      "name",
      "gender",
      "mobile",
      "email",
      "specialization",
      "opd_location",
      "opd_doctor",
      "is_active",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const adminuser = await AdminUser.findByIdAndUpdate(adminuser_id, update, { new: true });

    if (!adminuser) {
      return res.send({
        status: 0,
        message: "Data does not exist.",
        data: "",
      });
    }

    return res.send({
      status: 1,
      message: "User updated successfully.",
      data: "",
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});



module.exports = router;
