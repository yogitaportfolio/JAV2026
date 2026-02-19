const mongoose = require("mongoose");

const testSchema = mongoose.Schema(
  {
    procedure_name: {
      type: String,
      required: true,
      trim: true,
    },
    test_name: {
      type: String,
      trim: true,
    },
    test_code: {
      type: String,
      trim: true,
    },
    sample_type: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

testSchema.index({ procedure_name: 1 });

const Test = mongoose.model("tests", testSchema);

module.exports = Test;
