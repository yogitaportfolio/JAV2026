const express = require("express");
const Test = require("../models/Test");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/getall", auth, async (req, res) => {
  try {
    const tests = await Test.find({ is_active: true })
      .sort({ createdAt: -1 })
      .lean();
    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: tests || [],
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.post("/insert", auth, async (req, res) => {
  try {
    const {
      procedure_name,
      test_name,
      test_code,
      sample_type,
      category,
      amount,
      description,
    } = req.body || {};

    if (!procedure_name) {
      return res.send({ status: 0, message: "Procedure name is required.", data: "" });
    }

    const payload = {
      procedure_name: String(procedure_name).trim(),
      test_name: test_name ? String(test_name).trim() : String(procedure_name).trim(),
      test_code: test_code ? String(test_code).trim() : undefined,
      sample_type: sample_type ? String(sample_type).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      amount: Number.isFinite(Number(amount)) ? Number(amount) : 0,
      description: description ? String(description).trim() : undefined,
    };

    const test = await Test.create(payload);
    return res.send({
      status: 1,
      message: "Procedure created successfully.",
      data: test,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { test_id } = req.body || {};
    if (!test_id) {
      return res.send({ status: 0, message: "Invalid test.", data: "" });
    }

    const update = {};
    const fields = [
      "procedure_name",
      "test_name",
      "test_code",
      "sample_type",
      "category",
      "amount",
      "description",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });
    if (update.procedure_name && !update.test_name) {
      update.test_name = update.procedure_name;
    }
    if (update.amount !== undefined) {
      update.amount = Number.isFinite(Number(update.amount)) ? Number(update.amount) : 0;
    }

    const test = await Test.findByIdAndUpdate(test_id, update, { new: true });
    if (!test) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Procedure updated successfully.",
      data: test,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const { test_id } = req.body || {};
    if (!test_id) {
      return res.send({ status: 0, message: "Invalid test.", data: "" });
    }

    const test = await Test.findByIdAndDelete(test_id);
    if (!test) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }
    return res.send({
      status: 1,
      message: "Procedure deleted successfully.",
      data: "",
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

module.exports = router;
