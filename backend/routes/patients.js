const express = require("express");
const Patient = require("../models/Patient");
const LedgerTxn = require("../models/LedgerTxn");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/getall", auth, async (req, res) => {
  try {
    const patients = await Patient.find({ is_active: true })
      .populate("wife_tests")
      .populate("husband_tests")
      .sort({ createdAt: -1 })
      .lean();

    const patientIds = (patients || []).map((p) => p._id).filter(Boolean);
    let ledgerPatientIds = [];
    if (patientIds.length > 0) {
      ledgerPatientIds = await LedgerTxn.distinct("patientId", {
        patientId: { $in: patientIds },
      });
    }
    const ledgerSet = new Set((ledgerPatientIds || []).map((id) => String(id)));
    const dataWithHistory = (patients || []).map((p) => ({
      ...p,
      has_procedure_history: ledgerSet.has(String(p._id)),
    }));

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: dataWithHistory,
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.post("/insert", auth, async (req, res) => {
  try {
    if (!req.body?.wife?.name || !req.body?.wife?.age) {
      return res.send({ status: 0, message: "Wife name and age are required.", data: "" });
    }
    if (!req.body?.husband?.name || !req.body?.husband?.age) {
      return res.send({ status: 0, message: "Husband name and age are required.", data: "" });
    }
    if (!req.body?.mobile) {
      return res.send({ status: 0, message: "Mobile number is required.", data: "" });
    }
    if (!Array.isArray(req.body?.packages) || req.body.packages.length === 0) {
      return res.send({ status: 0, message: "At least one package is required.", data: "" });
    }

    const payload = {
      wife: req.body?.wife || {},
      husband: req.body?.husband || {},
      mobile: req.body?.mobile || "",
      email: req.body?.email || "",
      wife_tests: req.body?.wife_tests || [],
      husband_tests: req.body?.husband_tests || [],
      packages: req.body?.packages || [],
      charges_paid: Number.isFinite(Number(req.body?.charges_paid)) ? Number(req.body?.charges_paid) : 0,
      remark: req.body?.remark || "",
    };

    const patient = await Patient.create(payload);
    return res.send({
      status: 1,
      message: "Patient created successfully.",
      data: patient,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { patient_id } = req.body || {};
    if (!patient_id) {
      return res.send({ status: 0, message: "Invalid patient.", data: "" });
    }

    if (!req.body?.wife?.name || !req.body?.wife?.age) {
      return res.send({ status: 0, message: "Wife name and age are required.", data: "" });
    }
    if (!req.body?.husband?.name || !req.body?.husband?.age) {
      return res.send({ status: 0, message: "Husband name and age are required.", data: "" });
    }
    if (!req.body?.mobile) {
      return res.send({ status: 0, message: "Mobile number is required.", data: "" });
    }
    if (!Array.isArray(req.body?.packages) || req.body.packages.length === 0) {
      return res.send({ status: 0, message: "At least one package is required.", data: "" });
    }

    const update = {};
    const fields = [
      "wife",
      "husband",
      "mobile",
      "email",
      "wife_tests",
      "husband_tests",
      "packages",
      "charges_paid",
      "remark",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });
    if (update.charges_paid !== undefined) {
      update.charges_paid = Number.isFinite(Number(update.charges_paid)) ? Number(update.charges_paid) : 0;
    }

    const patient = await Patient.findByIdAndUpdate(patient_id, update, { new: true });
    if (!patient) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Patient updated successfully.",
      data: patient,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const { patient_id } = req.body || {};
    if (!patient_id) {
      return res.send({ status: 0, message: "Invalid patient.", data: "" });
    }

    const patient = await Patient.findByIdAndDelete(patient_id);
    if (!patient) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Patient deleted successfully.",
      data: "",
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

module.exports = router;
