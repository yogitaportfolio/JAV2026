const mongoose = require("mongoose");
const Counter = require("./Counter");

const spouseSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    age: { type: Number, required: true },
  },
  { _id: false }
);

const packageSchema = mongoose.Schema(
  {
    procedure_id: { type: mongoose.Schema.Types.ObjectId, ref: "tests" },
    procedure_name: { type: String, trim: true },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const patientSchema = mongoose.Schema(
  {
    registration_no: {
      type: String,
      trim: true,
      unique: true,
    },
    wife: { type: spouseSchema, required: true },
    husband: { type: spouseSchema, required: true },
    mobile: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    wife_tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "tests" }],
    husband_tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "tests" }],
    packages: {
      type: [packageSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one package is required.",
      },
      required: true,
    },
    charges_paid: { type: Number, default: 0 },
    remark: { type: String, trim: true },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

patientSchema.pre("save", async function () {
  if (!this.registration_no && this.isNew) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateStr = `${y}${m}${d}`;
    const key = `patient-${dateStr}`;

    const counter = await Counter.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seq = String(counter.seq).padStart(3, "0");
    this.registration_no = `JV01-${dateStr}-${seq}`;
  }
});

const Patient = mongoose.model("patients", patientSchema);

module.exports = Patient;
