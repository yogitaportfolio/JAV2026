const express = require("express");
const Patient = require("../models/Patient");
const auth = require("../middleware/auth");
const router = express.Router();

const IST_OFFSET_MINUTES = 330;

const toUtcFromISTDate = (value, endOfDay = false) => {
  if (!value) return null;
  const raw = String(value).trim();
  const parts = raw.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;

  const hour = endOfDay ? 23 : 0;
  const min = endOfDay ? 59 : 0;
  const sec = endOfDay ? 59 : 0;
  const ms = endOfDay ? 999 : 0;

  const utcMs = Date.UTC(y, m - 1, d, hour, min, sec, ms) - IST_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs);
};

const buildDateRange = (fromDate, toDate) => {
  if (!fromDate && !toDate) return null;
  const range = {};
  if (fromDate) {
    const start = toUtcFromISTDate(fromDate, false);
    if (start && !isNaN(start)) range.$gte = start;
  }
  if (toDate) {
    const end = toUtcFromISTDate(toDate, true);
    if (end && !isNaN(end)) range.$lte = end;
  }
  if (!Object.keys(range).length) return null;
  return {
    $or: [
      { report_assigned_at: range },
      { report_assigned_at: { $exists: false }, createdAt: range },
      { report_assigned_at: null, createdAt: range },
    ],
  };
};

const testsAssignedFilter = {
  $or: [
    { wife_tests: { $exists: true, $ne: [] } },
    { husband_tests: { $exists: true, $ne: [] } },
  ],
};

const toReportDTO = (patient) => ({
  _id: patient._id,
  patient_id: patient,
  wife_tests: patient.wife_tests || [],
  husband_tests: patient.husband_tests || [],
  status: patient.report_status || "Assigned",
  remark: patient.report_remark || "",
  pdf_url: patient.report_pdf_url || "",
  createdAt: patient.report_assigned_at || patient.updatedAt || patient.createdAt,
  updatedAt: patient.updatedAt,
});

const buildQuery = ({ from_date, to_date, patient_id, status, require_tests }) => {
  const filters = [];
  if (require_tests) {
    filters.push(testsAssignedFilter);
  }
  const dateFilter = buildDateRange(from_date, to_date);
  if (dateFilter) filters.push(dateFilter);
  if (patient_id) filters.push({ _id: patient_id });

  if (Array.isArray(status) && status.length > 0) {
    const statusConditions = [];
    status.forEach((s) => {
      if (s === "Assigned") {
        statusConditions.push(
          { report_status: "Assigned" },
          { report_status: { $exists: false } },
          { report_status: null },
          { report_status: "" }
        );
      } else {
        statusConditions.push({ report_status: s });
      }
    });
    filters.push({ $or: statusConditions });
  }

  if (filters.length === 0) return {};
  return filters.length > 1 ? { $and: filters } : filters[0];
};

router.post("/assign_tests", auth, async (req, res) => {
  try {
    const { patient_id, wife_tests = [], husband_tests = [] } = req.body || {};
    if (!patient_id) {
      return res.send({ status: 0, message: "Patient is required.", data: "" });
    }
    const hasTests = (wife_tests || []).length > 0 || (husband_tests || []).length > 0;
    const update = {
      wife_tests,
      husband_tests,
      report_status: hasTests ? "Assigned" : null,
      report_remark: "",
      report_pdf_url: "",
      report_assigned_at: hasTests ? new Date() : null,
      report_verified_at: null,
    };

    const patient = await Patient.findByIdAndUpdate(patient_id, update, { new: true })
      .populate("wife_tests")
      .populate("husband_tests")
      .lean();
    if (!patient) {
      return res.send({ status: 0, message: "Patient not found.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Tests assigned successfully.",
      data: toReportDTO(patient),
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

router.post("/getall", auth, async (req, res) => {
  try {
    const { from_date, to_date, patient_id } = req.body || {};
    const filter = buildQuery({ from_date, to_date, patient_id, require_tests: false });
    const patients = await Patient.find(filter)
      .populate("wife_tests")
      .populate("husband_tests")
      .sort({ report_assigned_at: -1, createdAt: -1 })
      .lean();

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: (patients || []).map(toReportDTO),
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.post("/getBy_status", auth, async (req, res) => {
  try {
    const { from_date, to_date, status, patient_id } = req.body || {};
    const filter = buildQuery({ from_date, to_date, patient_id, status, require_tests: true });
    const patients = await Patient.find(filter)
      .populate("wife_tests")
      .populate("husband_tests")
      .sort({ report_assigned_at: -1, createdAt: -1 })
      .lean();

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: (patients || []).map(toReportDTO),
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

router.get("/get_data_count", auth, async (req, res) => {
  try {
    const { from_date, to_date } = req.query || {};
    const baseFilters = [testsAssignedFilter];
    const dateFilter = buildDateRange(from_date, to_date);
    if (dateFilter) baseFilters.push(dateFilter);

    const baseQuery = baseFilters.length > 1 ? { $and: baseFilters } : baseFilters[0];
    const assignedQuery = {
      $and: [
        baseQuery,
        {
          $or: [
            { report_status: "Assigned" },
            { report_status: { $exists: false } },
            { report_status: null },
            { report_status: "" },
          ],
        },
      ],
    };

    const [assigned, in_review, approved, rejected, closed] = await Promise.all([
      Patient.countDocuments(assignedQuery),
      Patient.countDocuments({ $and: [baseQuery, { report_status: "In Review" }] }),
      Patient.countDocuments({ $and: [baseQuery, { report_status: "Approved" }] }),
      Patient.countDocuments({ $and: [baseQuery, { report_status: "Rejected" }] }),
      Patient.countDocuments({ $and: [baseQuery, { report_status: "Closed" }] }),
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
    if (status) update.report_status = status;
    if (remark !== undefined) update.report_remark = remark;
    if (status) update.report_verified_at = new Date();

    const patient = await Patient.findByIdAndUpdate(report_id, update, { new: true })
      .populate("wife_tests")
      .populate("husband_tests")
      .lean();
    if (!patient) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    }

    return res.send({
      status: 1,
      message: "Report updated successfully.",
      data: toReportDTO(patient),
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

    const patient = await Patient.findByIdAndUpdate(
      report_id,
      {
        wife_tests: [],
        husband_tests: [],
        report_status: null,
        report_remark: "",
        report_pdf_url: "",
        report_assigned_at: null,
        report_verified_at: null,
      },
      { new: true }
    );
    if (!patient) {
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
