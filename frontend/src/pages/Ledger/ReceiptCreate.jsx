import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getSubmitForm, postSubmitForm } from "../../helpers/forms_helper";
import showToast from "../../helpers/show_toast";
import preventValueChangeOnScroll from "../../helpers/PreventValueOnScroll";
import preloader from "../../helpers/preloader";

const ReceiptCreate = () => {
  document.title = "Create Receipt";
  const { id: patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(location.state?.patient || null);
  const [procedures, setProcedures] = useState([]);
  const [charges, setCharges] = useState([{ serviceId: "", serviceName: "", qty: 1, unitPrice: 0, amount: 0 }]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [payment, setPayment] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const fetchProcedures = async () => {
    try {
      const url = import.meta.env.VITE_APP_BASEURL + "procedures/getall";
      const response = await getSubmitForm(url, {});
      if (response && response.status === 1) {
        setProcedures(response.data || []);
      } else {
        showToast(response?.message || "Failed to fetch procedures", "error");
      }
    } catch (err) {
      showToast("Error fetching procedures", "error");
    }
  };

  const fetchPatient = async () => {
    if (patient) return;
    try {
      const url = import.meta.env.VITE_APP_BASEURL + "patients/getall";
      const response = await getSubmitForm(url, {});
      if (response && response.status === 1) {
        const found = (response.data || []).find((p) => p._id === patientId);
        setPatient(found || null);
      } else {
        showToast(response?.message || "Failed to fetch patient", "error");
      }
    } catch (err) {
      showToast("Error fetching patient", "error");
    }
  };

  const fetchOpeningBalance = async () => {
    try {
      const url = import.meta.env.VITE_APP_BASEURL + `patients/${patientId}/ledger`;
      const response = await getSubmitForm(url, {});
      if (response && response.status === 1) {
        const due = Number(response?.data?.summary?.currentDue || 0);
        setOpeningBalance(due);
      } else {
        showToast(response?.message || "Failed to fetch opening balance", "error");
      }
    } catch (err) {
      showToast("Error fetching opening balance", "error");
    }
  };

  useEffect(() => {
    const load = async () => {
      preloader(true);
      await Promise.all([fetchProcedures(), fetchPatient(), fetchOpeningBalance()]);
      preloader(false);
    };
    load();
  }, [patientId]);

  const procedureOptions = useMemo(() => {
    return procedures.map((procedure) => ({
      id: procedure._id || procedure.id,
      name: procedure.name || procedure.procedure_name || procedure.title || "Procedure",
      amount: Number(procedure.amount || 0),
    }));
  }, [procedures]);

  const getAmount = (qty, unitPrice) => {
    const q = Number(qty || 0);
    const p = Number(unitPrice || 0);
    return Number((q * p).toFixed(2));
  };

  const updateCharge = (index, updates) => {
    setCharges((prev) => {
      const next = [...prev];
      const current = { ...next[index], ...updates };
      current.amount = getAmount(current.qty, current.unitPrice);
      next[index] = current;
      return next;
    });
  };

  const handleProcedureSelect = (index, procedureId) => {
    const selected = procedureOptions.find((p) => p.id === procedureId);
    updateCharge(index, {
      serviceId: selected?.id || "",
      serviceName: selected?.name || "",
      unitPrice: selected?.amount || 0,
      qty: Number(charges[index]?.qty || 1),
    });
  };

  const addRow = () => {
    setCharges((prev) => [...prev, { serviceId: "", serviceName: "", qty: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeRow = (index) => {
    setCharges((prev) => prev.filter((_, idx) => idx !== index));
  };

  const chargesTotal = charges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const closingBalance = Number((openingBalance + chargesTotal - Number(payment || 0)).toFixed(2));

  const handleGenerateReceipt = async (e) => {
    e.preventDefault();
    const normalizedCharges = charges
      .filter((c) => c.serviceId && c.serviceName)
      .map((c) => ({
        serviceId: c.serviceId,
        serviceName: c.serviceName,
        qty: Number(c.qty || 1),
        unitPrice: Number(c.unitPrice || 0),
        amount: Number(getAmount(c.qty, c.unitPrice)),
      }));

    if (normalizedCharges.length === 0) {
      showToast("Add at least one procedure", "warning");
      return;
    }

    try {
      setSaving(true);
      const url = import.meta.env.VITE_APP_BASEURL + `patients/${patientId}/txns`;
      const payload = {
        charges: normalizedCharges,
        payment: Number(payment || 0),
        note: note || "",
      };
      const response = await postSubmitForm(url, payload);
      if (response && response.status === 1) {
        setReceipt(response.data);
        showToast(response.message || "Receipt generated", "success");
      } else {
        showToast(response?.message || "Failed to generate receipt", "error");
      }
    } catch (err) {
      showToast("Error generating receipt", "error");
    } finally {
      setSaving(false);
    }
  };

  const patientName = patient
    ? `${patient.wife?.name || "-"} / ${patient.husband?.name || "-"}`
    : "Loading...";

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <Row className="mb-2 px-2 align-items-center">
                  <Col md={8}>
                    <CardTitle>Create Receipt</CardTitle>
                    <CardSubtitle>New visit receipt for selected patient</CardSubtitle>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button color="light" onClick={() => navigate("/patients")}>
                      Back to Patients
                    </Button>
                  </Col>
                </Row>
                <hr />

                <Card className="mb-3">
                  <CardBody>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Patient Name</Label>
                          <Input type="text" value={patientName} disabled />
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label>Mobile</Label>
                          <Input type="text" value={patient?.mobile || "-"} disabled />
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label>Patient ID</Label>
                          <Input type="text" value={patient?.registration_no || "-"} disabled />
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                <Form onSubmit={handleGenerateReceipt}>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Opening Balance</Label>
                        <Input type="number" value={openingBalance} disabled />
                      </FormGroup>
                    </Col>
                  </Row>

                  <hr />
                  <Row className="mb-2">
                    <Col md={6}>
                      <CardTitle className="mb-0">Procedures</CardTitle>
                      <CardSubtitle>Add services for this visit</CardSubtitle>
                    </Col>
                    <Col md={6} className="text-end">
                      <Button color="primary" type="button" onClick={addRow}>
                        Add Procedure
                      </Button>
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th style={{ width: "45%" }}>Procedure</th>
                          <th style={{ width: "15%" }}>Qty</th>
                          <th style={{ width: "15%" }}>Unit Price</th>
                          <th style={{ width: "15%" }}>Amount</th>
                          <th style={{ width: "10%" }} className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {charges.map((row, index) => (
                          <tr key={`charge-${index}`}>
                            <td>
                              <Input
                                type="select"
                                value={row.serviceId}
                                onChange={(e) => handleProcedureSelect(index, e.target.value)}
                              >
                                <option value="">Select Procedure</option>
                                {procedureOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.name}
                                  </option>
                                ))}
                              </Input>
                            </td>
                            <td>
                              <Input
                                type="number"
                                value={row.qty}
                                min="1"
                                onWheel={preventValueChangeOnScroll}
                                onChange={(e) => updateCharge(index, { qty: e.target.value })}
                              />
                            </td>
                            <td>
                              <Input type="number" value={row.unitPrice} disabled />
                            </td>
                            <td>
                              <Input type="number" value={row.amount} disabled />
                            </td>
                            <td className="text-end">
                              <Button
                                color="link"
                                className="p-0"
                                type="button"
                                onClick={() => removeRow(index)}
                                title="Remove"
                                disabled={charges.length === 1}
                              >
                                <i className="bx bxs-trash text-danger"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Row className="mt-3">
                    <Col md={4}>
                      <FormGroup>
                        <Label>Payment Received Today</Label>
                        <Input
                          type="number"
                          value={payment}
                          onWheel={preventValueChangeOnScroll}
                          onChange={(e) => setPayment(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Charges Total</Label>
                        <Input type="number" value={chargesTotal.toFixed(2)} disabled />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Closing Balance</Label>
                        <Input type="number" value={closingBalance.toFixed(2)} disabled />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={8}>
                      <FormGroup>
                        <Label>Note</Label>
                        <Input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Optional note"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  {receipt?.receiptNo ? (
                    <div className="alert alert-success">
                      Receipt generated: <strong>{receipt.receiptNo}</strong>
                    </div>
                  ) : null}

                  <div className="text-end">
                    <Button color="success" type="submit" disabled={saving}>
                      {saving ? "Generating..." : "Generate Receipt"}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReceiptCreate;
