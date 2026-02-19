const express = require("express");
const Report = require("../models/Report");
const Patient = require("../models/Patient");
const auth = require("../middleware/auth");
const router = express.Router();

const buildDateRange = (fromDate, toDate) => {
  if (!fromDate && !toDate) return {};
  const range = {};
  if (fromDate) {
    const start = new Date(fromDate);
    if (!isNaN(start)) range.$gte = start;
  }
  if (toDate) {
    const end = new Date(toDate);
    if (!isNaN(end)) {
      end.setHours(23, 59, 59, 999);
      range.$lte = end;
    }
  }
  return Object.keys(range).length ? { createdAt: range } : {};
};

router.post("/assign_tests", auth, async (req, res) => {
  try {
    const { patient_id, wife_tests = [], husband_tests = [] } = req.body || {};
    if (!patient_id) {
      return res.send({ status: 0, message: "Patient is required.", data: "" });
    }

    const report = await Report.create({
      patient_id,
      wife_tests,
      husband_tests,
      status: "Assigned",
    });

    await Patient.findByIdAndUpdate(patient_id, {
      wife_tests,
      husband_tests,
    });

    return res.send({
      status: 1,
      message: "Tests assigned successfully.",
      data: report,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.post("/getall", auth, async (req, res) => {
  try {
    const { from_date, to_date, patient_id } = req.body || {};
    const dateFilter = buildDateRange(from_date, to_date);
    const filter = { ...dateFilter };
    if (patient_id) {
      filter.patient_id = patient_id;
    }
    const reports = await Report.find(filter)
      .populate("patient_id")
      .populate("wife_tests")
      .populate("husband_tests")
      .sort({ createdAt: -1 })
      .lean();

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: reports || [],
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.post("/getBy_status", auth, async (req, res) => {
  try {
    const { from_date, to_date, status, patient_id } = req.body || {};
    const dateFilter = buildDateRange(from_date, to_date);
    const filter = { ...dateFilter };
    if (Array.isArray(status) && status.length > 0) {
      filter.status = { $in: status };
    }
    if (patient_id) {
      filter.patient_id = patient_id;
    }

    const reports = await Report.find(filter)
      .populate("patient_id")
      .populate("wife_tests")
      .populate("husband_tests")
      .sort({ createdAt: -1 })
      .lean();

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: reports || [],
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.get("/get_data_count", auth, async (req, res) => {
  try {
    const { from_date, to_date } = req.query || {};
    const dateFilter = buildDateRange(from_date, to_date);

    const [assigned, in_review, approved, rejected, closed] = await Promise.all([
      Report.countDocuments({ ...dateFilter, status: "Assigned" }),
      Report.countDocuments({ ...dateFilter, status: "In Review" }),
      Report.countDocuments({ ...dateFilter, status: "Approved" }),
      Report.countDocuments({ ...dateFilter, status: "Rejected" }),
      Report.countDocuments({ ...dateFilter, status: "Closed" }),
    ]);

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: {
        assigned,
        in_review,
        approved,
        rejected,
        closed,
        todayAppointment: 0,
        PendingInquiries: 0,
        balance_sms: 0,
      },
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.post("/verify_report", auth, async (req, res) => {
  try {
    const { report_id, status, remark } = req.body || {};
    if (!report_id) {
      return res.send({ status: 0, message: "Invalid report.", data: "" });
    }

    const update = {};
    if (status) update.status = status;
    if (remark !== undefined) update.remark = remark;

    const report = await Report.findByIdAndUpdate(report_id, update, { new: true });
    if (!report) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Report updated successfully.",
      data: report,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const { report_id } = req.body || {};
    if (!report_id) {
      return res.send({ status: 0, message: "Invalid report.", data: "" });
    }

    const report = await Report.findByIdAndDelete(report_id);
    if (!report) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Report deleted successfully.",
      data: "",
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

module.exports = router;
