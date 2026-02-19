// utils/ledger.js
const calcChargesTotal = (charges = []) =>
  charges.reduce((sum, it) => sum + Number(it.amount || 0), 0);

module.exports = { calcChargesTotal };
