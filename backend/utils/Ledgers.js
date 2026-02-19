// utils/ledger.js
export function calcChargesTotal(charges = []) {
  return charges.reduce((sum, it) => sum + Number(it.amount || 0), 0);
}