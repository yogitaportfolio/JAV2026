const mongoose = require("mongoose");

const procedureSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
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

procedureSchema.index({ name: 1 }, { unique: true });

const Procedure = mongoose.model("procedures", procedureSchema);

module.exports = Procedure;
