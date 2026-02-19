const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
      required: true,
    },
    wife_tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "tests" }],
    husband_tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "tests" }],
    status: {
      type: String,
      default: "Assigned",
    },
    remark: {
      type: String,
      trim: true,
    },
    pdf_url: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model("reports", reportSchema);

module.exports = Report;
