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
  Label,
  Row,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { getSubmitForm, postSubmitForm } from "../../helpers/forms_helper";
import showToast from "../../helpers/show_toast";
import preventValueChangeOnScroll from "../../helpers/PreventValueOnScroll";
import preloader from "../../helpers/preloader";

const PatientEntry = () => {
  document.title = "Patient Entry";
  const navigate = useNavigate();
  const [procedures, setProcedures] = useState([]);
  const [packageForm, setPackageForm] = useState({ procedureId: "", amount: "" });
  const [packageError, setPackageError] = useState("");

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
          remark: values.remark,
        };

        const url = import.meta.env.VITE_APP_BASEURL + "patients/insert";
        const response = await postSubmitForm(url, payload);
        if (response && response.status === 1) {
          showToast(response.message || "Patient created successfully", "success");
          const patientId = response?.data?._id;
          resetForm();
          if (patientId) {
            navigate(`/patients/${patientId}/receipt/new`, {
              state: { patient: response.data },
            });
          }
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

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <Row className="mb-2 px-2">
                  <Col md={6}>
                    <CardTitle>Patient Entry</CardTitle>
                    <CardSubtitle>Enter patient details and continue to receipt</CardSubtitle>
                  </Col>
                </Row>
                <hr />
                <Form onSubmit={formik.handleSubmit}>
                  <Row>
                    <Col md={8}>
                      <FormGroup>
                        <Label for="wife_name">
                          Wife Name <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="wife_name"
                          id="wife_name"
                          placeholder="Enter wife's name"
                          value={formik.values.wife_name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.wife_name && formik.errors.wife_name ? true : false}
                        />
                        {formik.touched.wife_name && formik.errors.wife_name ? (
                          <FormFeedback>{formik.errors.wife_name}</FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>

                    <Col md={4}>
                      <FormGroup>
                        <Label for="wife_age">
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
                  </Row>

                  <Row>
                    <Col md={8}>
                      <FormGroup>
                        <Label for="husband_name">
                          Husband Name <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="husband_name"
                          id="husband_name"
                          placeholder="Enter husband's name"
                          value={formik.values.husband_name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.husband_name && formik.errors.husband_name ? true : false}
                        />
                        {formik.touched.husband_name && formik.errors.husband_name ? (
                          <FormFeedback>{formik.errors.husband_name}</FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="husband_age">
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
                        <Label for="email">Email</Label>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="Enter patient email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={formik.touched.email && formik.errors.email ? true : false}
                        />
                        {formik.touched.email && formik.errors.email ? (
                          <FormFeedback>{formik.errors.email}</FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="mobile">
                          Mobile Number <span className="text-danger">*</span>
                        </Label>
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
                        />
                        {formik.touched.mobile && formik.errors.mobile ? (
                          <FormFeedback>{formik.errors.mobile}</FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                  </Row>

                  <hr />
                  <Row className="mb-2">
                    <Col md={6}>
                      <CardTitle className="mb-0">Packages</CardTitle>
                      <CardSubtitle>Required to create patient</CardSubtitle>
                    </Col>
                  </Row>

                  <Row className="align-items-end">
                    <Col md={6}>
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
                    <Col md={4}>
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
                    <Col md={2}>
                      <Button color="primary" type="button" onClick={addPackage} className="w-100">
                        Add
                      </Button>
                    </Col>
                  </Row>

                  {packageError ? <div className="text-danger small mb-2">{packageError}</div> : null}

                  {formik.values.packages && formik.values.packages.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th style={{ width: "60%" }}>Procedure Name</th>
                            <th style={{ width: "25%" }}>Amount</th>
                            <th style={{ width: "15%" }} className="text-end">Action</th>
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
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No packages added</p>
                  )}

                  {formik.errors.packages && formik.submitCount > 0 ? (
                    <div className="text-danger small mt-2">{formik.errors.packages}</div>
                  ) : null}

                  <Row className="mt-3">
                    <Col md={8}>
                      <FormGroup>
                        <Label for="remark">Remark</Label>
                        <Input
                          type="text"
                          name="remark"
                          id="remark"
                          placeholder="Enter remark"
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
  );
};

export default PatientEntry;
