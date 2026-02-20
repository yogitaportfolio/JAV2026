import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Badge,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { getSubmitForm, postSubmitForm } from "../../helpers/forms_helper";
import showToast from "../../helpers/show_toast";
import preventValueChangeOnScroll from "../../helpers/PreventValueOnScroll";
import preloader from "../../helpers/preloader";
import OPDReceipt from "../../components/Reports/OPDReceipt";
import moment from "moment";

const PatientEntry = () => {
  document.title = "Patient Entry";
  const navigate = useNavigate();
  const [procedures, setProcedures] = useState([]);
  const [packageForm, setPackageForm] = useState({ procedureId: "", amount: "" });
  const [packageError, setPackageError] = useState("");
  const [printReceipt, setPrintReceipt] = useState(null);

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

  useEffect(() => {
    fetchProcedures();
  }, []);

  useEffect(() => {
    if (!printReceipt) return;
    const handleAfterPrint = () => setPrintReceipt(null);
    window.addEventListener("afterprint", handleAfterPrint);
    const timeout = setTimeout(() => {
      window.print();
    }, 300);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printReceipt]);

  const validationSchema = Yup.object({
    wife_name: Yup.string().required("Wife name is required"),
    husband_name: Yup.string().required("Husband name is required"),
    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^\+91-[0-9]{10}$/, "Mobile number must be +91- followed by 10 digits"),
    email: Yup.string().email("Invalid email format"),
    wife_age: Yup.number().required("Wife age is required"),
    husband_age: Yup.number().required("Husband age is required"),
    packages: Yup.array().min(1, "At least one package is required"),
    charges_paid: Yup.number().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      wife_name: "",
      husband_name: "",
      mobile: "+91-",
      email: "",
      wife_age: "",
      husband_age: "",
      packages: [],
      charges_paid: "",
      remark: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        preloader(true);
        const payload = {
          wife: { name: values.wife_name, age: values.wife_age },
          husband: { name: values.husband_name, age: values.husband_age },
          mobile: values.mobile,
          email: values.email,
          packages: values.packages,
          charges_paid: values.charges_paid,
          remark: values.remark,
        };

        const url = import.meta.env.VITE_APP_BASEURL + "patients/insert";
        const response = await postSubmitForm(url, payload);
        if (response && response.status === 1) {
          const patientData = response?.data || {};
          const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
          const receiptPayload = {
            receiptNo: patientData.registration_no || patientData._id || "",
            jhdNo: "",
            patientName: `${patientData.wife?.name || ""} / ${patientData.husband?.name || ""}`.trim(),
            consultantName: "",
            dateTime: moment().format("DD/MMM/YYYY  HH:mm"),
            opdNo: patientData.registration_no || "",
            ageSex: `W:${patientData.wife?.age || "-"} H:${patientData.husband?.age || "-"}`,
            validUpto: "",
            serialNo: "",
            charges: (values.packages || []).map((pkg) => ({
              name: pkg.procedure_name || "Procedure",
              amount: Number(pkg.amount || 0),
            })),
            paymentMode: "",
            preparedBy: authUser?.username || authUser?.name || authUser?.role || "",
            printedOn: moment().format("DD/MMM/YYYY  HH:mm"),
            authorizedSignatoryText: "Authorized Signatory",
          };

          setPrintReceipt(receiptPayload);
          resetForm();
        } else {
          showToast(response?.message || "Failed to create patient", "error");
        }
      } catch (err) {
        showToast("Error creating patient", "error");
      } finally {
        preloader(false);
        setSubmitting(false);
      }
    },
  });

  const handleProcedureChange = (procedureId) => {
    const selected = procedures.find((p) => (p._id || p.id) === procedureId);
    const defaultAmount = selected?.amount ?? "";
    setPackageForm((prev) => ({ ...prev, procedureId, amount: defaultAmount }));
  };

  const addPackage = () => {
    setPackageError("");
    if (!packageForm.procedureId) {
      setPackageError("Procedure is required");
      return;
    }
    const amountValue = String(packageForm.amount ?? "").trim();
    if (amountValue === "" || Number.isNaN(Number(amountValue))) {
      setPackageError("Amount is required");
      return;
    }

    const selected = procedures.find((p) => (p._id || p.id) === packageForm.procedureId);
    const procedureName = selected?.name || selected?.procedure_name || selected?.title || "Procedure";

    const nextPackages = [...formik.values.packages];
    nextPackages.push({
      procedure_id: selected?._id || selected?.id || packageForm.procedureId,
      procedure_name: procedureName,
      amount: Number(amountValue),
    });
    formik.setFieldValue("packages", nextPackages);
    setPackageForm({ procedureId: "", amount: "" });
  };

  const removePackage = (index) => {
    const nextPackages = [...formik.values.packages];
    nextPackages.splice(index, 1);
    formik.setFieldValue("packages", nextPackages);
  };

  const packagesTotal = (formik.values.packages || []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const paidToday = Number(formik.values.charges_paid || 0);
  const balanceDue = Number((packagesTotal - paidToday).toFixed(2));

  return (
    <>
      <div className="page-content d-print-none">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "18px" }}>
                <CardBody>
                <Row className="align-items-center mb-3">
                  <Col md={8}>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: "#e8f1ff",
                          color: "#0b57d0",
                          fontSize: "20px",
                        }}
                      >
                        <i className="bx bx-user-plus"></i>
                      </div>
                      <div>
                        <CardTitle className="mb-0">Create Patient</CardTitle>
                        <CardSubtitle className="text-muted">
                          New patient registration details
                        </CardSubtitle>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button color="light" onClick={() => navigate("/patients")}>
                      <i className="bx bx-left-arrow-alt me-1"></i>
                      Back to Patients
                    </Button>
                  </Col>
                </Row>

                <Form onSubmit={formik.handleSubmit}>
                  <Card className="border-0 mb-4" style={{ borderRadius: "16px", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
                    <CardBody>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="bx bx-id-card text-primary"></i>
                        <h6 className="mb-0 fw-bold">Patient Information</h6>
                      </div>

                      <Row>
                        <Col md={6} lg={4}>
                          <FormGroup>
                            <Label for="wife_name" className="text-uppercase small text-muted">
                              Wife Name <span className="text-danger">*</span>
                            </Label>
                            <InputGroup>
                              <InputGroupText className="bg-light border-end-0">
                                <i className="bx bx-user text-muted"></i>
                              </InputGroupText>
                              <Input
                                type="text"
                                name="wife_name"
                                id="wife_name"
                                placeholder="Enter wife's name"
                                value={formik.values.wife_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                invalid={formik.touched.wife_name && formik.errors.wife_name ? true : false}
                                className="border-start-0"
                              />
                              {formik.touched.wife_name && formik.errors.wife_name ? (
                                <FormFeedback>{formik.errors.wife_name}</FormFeedback>
                              ) : null}
                            </InputGroup>
                          </FormGroup>
                        </Col>

                        <Col md={6} lg={2}>
                          <FormGroup>
                            <Label for="wife_age" className="text-uppercase small text-muted">
                              Wife Age <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="number"
                              name="wife_age"
                              id="wife_age"
                              placeholder="Age"
                              value={formik.values.wife_age}
                              onWheel={preventValueChangeOnScroll}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              invalid={formik.touched.wife_age && formik.errors.wife_age ? true : false}
                            />
                            {formik.touched.wife_age && formik.errors.wife_age ? (
                              <FormFeedback>{formik.errors.wife_age}</FormFeedback>
                            ) : null}
                          </FormGroup>
                        </Col>

                        <Col md={6} lg={4}>
                          <FormGroup>
                            <Label for="husband_name" className="text-uppercase small text-muted">
                              Husband Name <span className="text-danger">*</span>
                            </Label>
                            <InputGroup>
                              <InputGroupText className="bg-light border-end-0">
                                <i className="bx bx-user text-muted"></i>
                              </InputGroupText>
                              <Input
                                type="text"
                                name="husband_name"
                                id="husband_name"
                                placeholder="Enter husband's name"
                                value={formik.values.husband_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                invalid={formik.touched.husband_name && formik.errors.husband_name ? true : false}
                                className="border-start-0"
                              />
                              {formik.touched.husband_name && formik.errors.husband_name ? (
                                <FormFeedback>{formik.errors.husband_name}</FormFeedback>
                              ) : null}
                            </InputGroup>
                          </FormGroup>
                        </Col>

                        <Col md={6} lg={2}>
                          <FormGroup>
                            <Label for="husband_age" className="text-uppercase small text-muted">
                              Husband Age <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="number"
                              name="husband_age"
                              id="husband_age"
                              placeholder="Age"
                              value={formik.values.husband_age}
                              onWheel={preventValueChangeOnScroll}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              invalid={formik.touched.husband_age && formik.errors.husband_age ? true : false}
                            />
                            {formik.touched.husband_age && formik.errors.husband_age ? (
                              <FormFeedback>{formik.errors.husband_age}</FormFeedback>
                            ) : null}
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={8}>
                          <FormGroup>
                            <Label for="email" className="text-uppercase small text-muted">
                              Email
                            </Label>
                            <InputGroup>
                              <InputGroupText className="bg-light border-end-0">
                                <i className="bx bx-envelope text-muted"></i>
                              </InputGroupText>
                              <Input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Enter patient email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                invalid={formik.touched.email && formik.errors.email ? true : false}
                                className="border-start-0"
                              />
                              {formik.touched.email && formik.errors.email ? (
                                <FormFeedback>{formik.errors.email}</FormFeedback>
                              ) : null}
                            </InputGroup>
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="mobile" className="text-uppercase small text-muted">
                              Mobile Number <span className="text-danger">*</span>
                            </Label>
                            <InputGroup>
                              <InputGroupText className="bg-light border-end-0">
                                <i className="bx bx-phone text-muted"></i>
                              </InputGroupText>
                              <Input
                                type="text"
                                name="mobile"
                                id="mobile"
                                placeholder="Enter 10-digit mobile number"
                                value={formik.values.mobile}
                                onChange={(e) => {
                                  const input = e.target.value;
                                  const prefix = "+91-";
                                  let digits = input;
                                  if (digits.startsWith(prefix)) {
                                    digits = digits.slice(prefix.length);
                                  } else {
                                    digits = digits.replace(/^\+?91-?/, "").replace(/\D/g, "");
                                  }
                                  const finalDigits = digits.replace(/\D/g, "").slice(0, 10);
                                  formik.setFieldValue("mobile", prefix + finalDigits);
                                }}
                                onBlur={formik.handleBlur}
                                invalid={formik.touched.mobile && formik.errors.mobile ? true : false}
                                maxLength="14"
                                className="border-start-0"
                              />
                              {formik.touched.mobile && formik.errors.mobile ? (
                                <FormFeedback>{formik.errors.mobile}</FormFeedback>
                              ) : null}
                            </InputGroup>
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>

                  <Card className="border-0 mb-4" style={{ borderRadius: "16px", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
                    <CardBody>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bx bx-test-tube text-primary"></i>
                            <h6 className="mb-0 fw-bold">
                              Procedures{" "}
                              <Badge color="primary" pill className="ms-1">
                                {formik.values.packages.length}
                              </Badge>
                            </h6>
                          </div>
                          <small className="text-muted">Add services for this visit</small>
                        </div>
                        <Button color="primary" type="button" onClick={addPackage}>
                          <i className="bx bx-plus-circle me-1"></i>
                          Add Procedure
                        </Button>
                      </div>

                  <Row className="align-items-end">
                    <Col md={7}>
                      <FormGroup>
                        <Label for="package_procedure">
                          Procedure <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="select"
                          name="package_procedure"
                          id="package_procedure"
                          value={packageForm.procedureId}
                          onChange={(e) => handleProcedureChange(e.target.value)}
                        >
                          <option value="">Select Procedure</option>
                          {procedures.map((procedure) => (
                            <option key={procedure._id || procedure.id} value={procedure._id || procedure.id}>
                              {procedure.name || procedure.procedure_name || procedure.title || "Procedure"}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={5}>
                      <FormGroup>
                        <Label for="package_amount">
                          Amount <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="number"
                          name="package_amount"
                          id="package_amount"
                          placeholder="Amount"
                          value={packageForm.amount}
                          onWheel={preventValueChangeOnScroll}
                          onChange={(e) => setPackageForm((prev) => ({ ...prev, amount: e.target.value }))}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  {packageError ? <div className="text-danger small mb-2">{packageError}</div> : null}

                  {formik.values.packages && formik.values.packages.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead style={{ background: "#0b57d0", color: "#fff" }}>
                          <tr>
                            <th style={{ width: "60%" }} className="text-uppercase small">Procedure</th>
                            <th style={{ width: "25%" }} className="text-uppercase small">Amount</th>
                            <th style={{ width: "15%" }} className="text-end text-uppercase small">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formik.values.packages.map((pkg, index) => (
                            <tr key={`${pkg.procedure_id || index}-${index}`}>
                              <td>{pkg.procedure_name || "-"}</td>
                              <td>{pkg.amount ?? "-"}</td>
                              <td className="text-end">
                                <Button
                                  color="link"
                                  className="p-0"
                                  type="button"
                                  onClick={() => removePackage(index)}
                                  title="Remove"
                                >
                                  <i className="bx bxs-trash text-danger"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr style={{ background: "#f3f6fb" }}>
                            <td className="fw-semibold text-uppercase small">Charges Total</td>
                            <td className="fw-bold text-primary">{packagesTotal.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No packages added</p>
                  )}

                  {formik.errors.packages && formik.submitCount > 0 ? (
                    <div className="text-danger small mt-2">{formik.errors.packages}</div>
                  ) : null}

                    </CardBody>
                  </Card>

                  <Card className="border-0 mb-4" style={{ borderRadius: "16px", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
                    <CardBody>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="bx bx-credit-card text-primary"></i>
                        <h6 className="mb-0 fw-bold">Payment Summary</h6>
                      </div>
                      <Row>
                        <Col md={4}>
                          <FormGroup>
                            <Label className="text-uppercase small text-muted">Payment Received Today</Label>
                            <Input
                              type="number"
                              name="charges_paid"
                              placeholder="Enter amount"
                              value={formik.values.charges_paid}
                              onWheel={preventValueChangeOnScroll}
                              onChange={formik.handleChange}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label className="text-uppercase small text-muted">Charges Total</Label>
                            <Input type="number" value={packagesTotal.toFixed(2)} disabled />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label className="text-uppercase small text-muted">Balance Due</Label>
                            <Input
                              type="number"
                              value={balanceDue.toFixed(2)}
                              disabled
                              className={balanceDue > 0 ? "text-danger fw-bold" : "text-success fw-bold"}
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={12}>
                          <FormGroup>
                            <Label for="remark" className="text-uppercase small text-muted">
                              Note (Optional)
                            </Label>
                            <Input
                              type="text"
                              name="remark"
                              id="remark"
                              placeholder="Add any additional notes about this visit..."
                              value={formik.values.remark}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              invalid={formik.touched.remark && formik.errors.remark ? true : false}
                            />
                            {formik.touched.remark && formik.errors.remark ? (
                              <FormFeedback>{formik.errors.remark}</FormFeedback>
                            ) : null}
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>

                  <div className="text-end">
                    <Button color="primary" type="submit" disabled={formik.isSubmitting}>
                      {formik.isSubmitting ? "Saving..." : "Save & Create Receipt"}
                    </Button>
                  </div>
                </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {printReceipt && (
        <div className="d-none d-print-block">
          <OPDReceipt receipt={printReceipt} />
        </div>
      )}
    </>
  );
};

export default PatientEntry;
