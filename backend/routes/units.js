const express = require("express");
const Unit = require("../models/Unit");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/getall", auth, async (req, res) => {
  try {
    const units = await Unit.find({ is_active: true })
      .sort({ createdAt: -1 })
      .lean();
    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: units || [],
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.post("/insert", auth, async (req, res) => {
  try {
    const { name, symbol, description } = req.body || {};
    if (!name || !symbol) {
      return res.send({ status: 0, message: "Unit name and symbol are required.", data: "" });
    }

    const unit = await Unit.create({
      name: String(name).trim(),
      symbol: String(symbol).trim(),
      description: description ? String(description).trim() : undefined,
    });

    return res.send({
      status: 1,
      message: "Unit created successfully.",
      data: unit,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { unit_id } = req.body || {};
    if (!unit_id) {
      return res.send({ status: 0, message: "Invalid unit.", data: "" });
    }

    const update = {};
    if (req.body.name !== undefined) update.name = req.body.name;
    if (req.body.symbol !== undefined) update.symbol = req.body.symbol;
    if (req.body.description !== undefined) update.description = req.body.description;

    const unit = await Unit.findByIdAndUpdate(unit_id, update, { new: true });
    if (!unit) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Unit updated successfully.",
      data: unit,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const { unit_id } = req.body || {};
    if (!unit_id) {
      return res.send({ status: 0, message: "Invalid unit.", data: "" });
    }

    const unit = await Unit.findByIdAndDelete(unit_id);
    if (!unit) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Unit deleted successfully.",
      data: "",
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

module.exports = router;
