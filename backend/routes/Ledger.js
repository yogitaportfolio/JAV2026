// routes/ledger.js
const express = require("express");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const LedgerTxn = require("../models/LedgerTxn");
const { calcChargesTotal } = require("../utils/Ledgers");

const router = express.Router();

// simple receipt generator (you can replace with better sequence later)
function genReceiptNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `RC-${y}${m}${day}-${rnd}`;
}

router.post("/patients/:patientId/txns", async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { patientId } = req.params;
    const { charges = [], payment = 0, note = "" } = req.body;

    session.startTransaction();

    const patient = await Patient.findById(patientId).session(session);
    if (!patient) return res.status(404).json({ status: 0, message: "Patient not found" });

    // get last closing balance
    const lastTxn = await LedgerTxn.findOne({ patientId })
      .sort({ createdAt: -1 })
      .session(session);

    const openingBalance = lastTxn ? Number(lastTxn.closingBalance) : 0;

    // validate & normalize charges
    const normalizedCharges = charges.map((c) => {
      const qty = Number(c.qty ?? 1);
      const unitPrice = Number(c.unitPrice);
      const amount = Number((qty * unitPrice).toFixed(2));
      return {
        serviceId: c.serviceId || null,
        serviceName: String(c.serviceName || ""),
        qty,
        unitPrice,
        amount,
      };
    });

    const chargesTotal = calcChargesTotal(normalizedCharges);
    const pay = Number(payment || 0);

    const closingBalance = Number((openingBalance + chargesTotal - pay).toFixed(2));

    const txn = await LedgerTxn.create(
      [
        {
          patientId,
          receiptNo: genReceiptNo(),
          charges: normalizedCharges,
          payment: pay,
          openingBalance,
          chargesTotal,
          closingBalance,
          note,
          // createdBy: req.user?._id
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return res.json({ status: 1, message: "Receipt created", data: txn[0] });
  } catch (e) {
    await session.abortTransaction();
    return res.status(500).json({ status: 0, message: e.message });
  } finally {
    session.endSession();
  }
});

router.get("/patients/:patientId/ledger", async (req, res) => {
  try {
    const { patientId } = req.params;

    const txns = await LedgerTxn.find({ patientId }).sort({ createdAt: 1 });

    const summary = txns.reduce(
      (acc, t) => {
        acc.totalCharges += Number(t.chargesTotal || 0);
        acc.totalPaid += Number(t.payment || 0);
        acc.currentDue = Number(t.closingBalance || 0);
        return acc;
      },
      { totalCharges: 0, totalPaid: 0, currentDue: 0 }
    );

    res.json({ status: 1, message: "Ledger fetched", data: { txns, summary } });
  } catch (e) {
    res.status(500).json({ status: 0, message: e.message });
  }
});

router.get("/receipts/:receiptNo", async (req, res) => {
  try {
    const { receiptNo } = req.params;
    const txn = await LedgerTxn.findOne({ receiptNo }).populate("patientId");
    if (!txn) return res.status(404).json({ status: 0, message: "Receipt not found" });

    res.json({ status: 1, message: "Receipt fetched", data: txn });
  } catch (e) {
    res.status(500).json({ status: 0, message: e.message });
  }
});

module.exports = router;
