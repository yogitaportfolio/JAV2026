const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || "";
    const isResetPassword =
      req.method === "POST" &&
      req.path === "/resetpassword";

    let token = "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    } else {
      token = authHeader.trim();
    }

    if (!token) {
      if (isResetPassword) {
        const resetKey =
          req.body?.reset_key ||
          req.header("x-reset-key") ||
          "";
        if (resetKey && process.env.RESET_KEY && resetKey === process.env.RESET_KEY) {
          return next();
        }
      }
      return res.status(401).send({ status: 0, message: "Missing token.", data: "" });
    }
    const data = jwt.verify(token, process.env.JWT_KEY);
  
    const adminuser = await AdminUser.findOne({
      _id: data._id,
      "tokens.token": token,
    });

    if (!adminuser) {
      throw new Error("invalid token");
    }

    req.adminuser = adminuser;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ status: 0, message: error.message, data: "" });
  }
};
module.exports = auth;
