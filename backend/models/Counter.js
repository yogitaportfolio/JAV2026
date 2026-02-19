const mongoose = require("mongoose");

const counterSchema = mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Counter = mongoose.model("counters", counterSchema);

module.exports = Counter;
