import React from "react";

export default function OPDReceipt({
  hospital = {
    name: "Javitri Hospital & Test Tube Baby Centre",
    line1: "Raibareilly Road, Telibagh",
    line2: "Lucknow-226029 (UP).",
    tel: "0522-321xxxx",
    email: "info@javitrihospital.co",
  },
  receipt = {
    receiptNo: "JV01-20260221-001",
    patientId: "JV01-20260221-001",
    patientName: "Baby KRISHIKA",
    dateTime: "12/Feb/2026  13:29",
    ageSex: "W:30 H:34",

    charges: [
      { name: "Admission Charges", amount: 400.0 },
    ],
    authorizedSignatoryText: "Authorized Signatory",
  },
}) {
  const chargesTotal = receipt.charges.reduce((s, c) => s + Number(c.amount || 0), 0);
  const fmt = (n) => Number(n || 0).toFixed(2);

  return (
    <div className="opd-receipt-wrap">
      <style>{css}</style>

      <div className="opd-receipt-paper">
        <div className="opd-header">
          <div className="opd-header-left"></div>

          <div className="opd-header-center">
            <div className="opd-hosp-name">{hospital.name}</div>
            <div className="opd-hosp-sub">{hospital.line1}</div>
            <div className="opd-hosp-sub">{hospital.line2}</div>
            <div className="opd-title">OPD Receipt</div>
          </div>

          <div className="opd-header-right">
            <div>Tel No. : {hospital.tel}</div>
            <div>E-Mail : {hospital.email}</div>
          </div>
        </div>

        <div className="opd-line" />

        <div className="opd-top-grid">
          <div className="opd-col">
            <Row label="Receipt No" value={receipt.receiptNo} />
            <Row label="Patient Name" value={receipt.patientName} />
          </div>

          <div className="opd-col">
            <Row label="Date & Time" value={receipt.dateTime} />
            <Row label="Patient ID" value={receipt.patientId} />
            <Row label="Age/Sex" value={receipt.ageSex} />
          </div>
        </div>

        <div className="opd-line" />

        <div className="opd-charges">
          <div className="opd-charges-head">
            <div className="opd-charges-col-name">Charge Name</div>
            <div className="opd-charges-col-amt">Amount</div>
          </div>

          <div className="opd-charges-body">
            {receipt.charges.length === 0 ? (
              <div className="opd-charge-row">
                <div className="opd-charges-col-name">&nbsp;</div>
                <div className="opd-charges-col-amt">&nbsp;</div>
              </div>
            ) : (
              receipt.charges.map((c, idx) => (
                <div className="opd-charge-row" key={idx}>
                  <div className="opd-charges-col-name">{c.name}</div>
                  <div className="opd-charges-col-amt">{fmt(c.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="opd-line" />

        <div className="payment-grid">
          <div className="opd-payment-right">
            <div className="opd-payment-totals">
              <div className="opd-payment-row">
                <div className="opd-payment-label">Gross Total</div>
                <div className="opd-payment-sep">:</div>
                <div className="opd-payment-val amt">{fmt(chargesTotal)}</div>
              </div>
              <div className="opd-payment-row">
                <div className="opd-payment-label">Net Amount</div>
                <div className="opd-payment-sep">:</div>
                <div className="opd-payment-val amt">{fmt(chargesTotal)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="opd-line faint" />
      </div>

      <div className="opd-actions">
        <button onClick={() => window.print()}>Print</button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="opd-row">
      <div className="opd-label">{label}</div>
      <div className="opd-sep">:</div>
      <div className="opd-value">{value || "\u00A0"}</div>
    </div>
  );
}

const css = `
.opd-receipt-wrap{
  font-family: Arial, Helvetica, sans-serif;
  color:#000;
}

.opd-receipt-wrap .opd-receipt-paper{
  width: 1000px;
  margin: 10px auto;
  padding: 14px 18px;
  border: 1px solid #000;
}

.opd-receipt-wrap .opd-header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
}
.opd-receipt-wrap .opd-header-left{ width: 80px; }
.opd-receipt-wrap .opd-header-center{ flex: 1; text-align:center; }
.opd-receipt-wrap .opd-header-right{ width: 240px; font-size: 13px; text-align:right; }

.opd-receipt-wrap .opd-hosp-name{ font-weight:700; font-size: 22px; }
.opd-receipt-wrap .opd-hosp-sub{ font-size: 14px; margin-top: 2px; }
.opd-receipt-wrap .opd-title{ font-weight:700; margin-top: 8px; font-size: 16px; }

.opd-receipt-wrap .opd-line{
  border-top: 1px solid #000;
  margin: 10px 0;
}
.opd-receipt-wrap .opd-line.faint{ border-top: 1px solid #777; }

.opd-receipt-wrap .opd-top-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  font-size: 13px;
}
.opd-receipt-wrap .opd-row{
  display:grid;
  grid-template-columns: 130px 10px 1fr;
  padding: 3px 0;
}
.opd-receipt-wrap .opd-sep{ text-align:center; }

.opd-receipt-wrap .opd-charges{
  font-size: 13px;
}
.opd-receipt-wrap .opd-charges-head{
  display:grid;
  grid-template-columns: 1fr 140px;
  font-weight:700;
  padding: 2px 0 6px 0;
}
.opd-receipt-wrap .opd-charge-row{
  display:grid;
  grid-template-columns: 1fr 140px;
  padding: 6px 0;
}
.opd-receipt-wrap .opd-charges-col-amt{
  text-align:right;
}

.opd-receipt-wrap .payment-grid{
  display:grid;
  grid-template-columns: 1fr;
  gap: 20px;
  font-size: 13px;
}
.opd-receipt-wrap .opd-payment-right{
  display:flex;
  justify-content:flex-end;
}
.opd-receipt-wrap .opd-payment-totals{
  width: 320px;
}
.opd-receipt-wrap .opd-payment-row{
  display:grid;
  grid-template-columns: 110px 10px 1fr;
  padding: 3px 0;
}
.opd-receipt-wrap .opd-payment-sep{
  text-align:center;
}
.opd-receipt-wrap .opd-payment-val{
  text-align:left;
}
.opd-receipt-wrap .opd-payment-val.amt{
  text-align:right;
  font-weight:700;
}

.opd-receipt-wrap .opd-actions{
  width: 1000px;
  margin: 10px auto;
  text-align:right;
}
@media print{
  .opd-receipt-wrap .opd-actions{ display:none; }
  .opd-receipt-wrap .opd-receipt-paper{
    border: none;
    margin: 0;
    width: auto;
  }
  .page-content{ display:none !important; }
}
`;
