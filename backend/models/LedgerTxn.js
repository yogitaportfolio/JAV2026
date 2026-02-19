const mongoose = require("mongoose");

const ChargeItemSchema = new mongoose.Schema(
  {
    // Service master is in procedures (tests collection)
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "tests" },
    serviceName: { type: String, required: true }, // snapshot for history
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true }, // qty * unitPrice
  },
  { _id: false }
);

const LedgerTxnSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    receiptNo: { type: String, required: true, unique: true },

    charges: { type: [ChargeItemSchema], default: [] },

    // amount received in this visit (can be 0)
    payment: { type: Number, default: 0 },

    openingBalance: { type: Number, required: true }, // previous due
    chargesTotal: { type: Number, required: true },
    closingBalance: { type: Number, required: true }, // opening + chargesTotal - payment

    note: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" }, // optional
  },
  { timestamps: true }
);

LedgerTxnSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model("LedgerTxn", LedgerTxnSchema);
