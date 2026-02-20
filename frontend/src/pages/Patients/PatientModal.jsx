import React, { useEffect, useRef, useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback, Row, Col } from 'reactstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { getSubmitForm, postSubmitForm, putSubmitForm } from '../../helpers/forms_helper'
import showToast from '../../helpers/show_toast'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTests } from '../../store/tests/actions'
import preventValueChangeOnScroll from '../../helpers/PreventValueOnScroll'
import OPDReceipt from '../../components/Reports/OPDReceipt'
import moment from 'moment'

const PatientModal = ({ isOpen, toggle, mode, patient, refreshData }) => {
    const dispatch = useDispatch()
    const tests = useSelector(state => state.Tests.tests)
    const [availableTests, setAvailableTests] = useState([])
    const [procedures, setProcedures] = useState([])
    const [procedureOptions, setProcedureOptions] = useState([])
    const [packageModalOpen, setPackageModalOpen] = useState(false)
    const [packageEditingIndex, setPackageEditingIndex] = useState(null)
    const [packageForm, setPackageForm] = useState({ procedureId: '', amount: '' })
    const [packageError, setPackageError] = useState('')
    const [printReceipt, setPrintReceipt] = useState(null)
    const originalPackagesRef = useRef([])

    // Fetch tests from Redux store when modal opens
    useEffect(() => {
        if (isOpen && tests.length === 0) {
            dispatch(fetchTests())
        }
    }, [isOpen, dispatch])

    useEffect(() => {
        if (tests && tests.length > 0) {
            const testsOptions = tests.map(test => ({
                value: test._id || test.id,
                label: test.test_name || test.name
            }))
            setAvailableTests(testsOptions)
        }
    }, [tests])

    useEffect(() => {
        if (isOpen) {
            fetchProcedures()
        }
    }, [isOpen])

    const fetchProcedures = async () => {
        try {
            const url = import.meta.env.VITE_APP_BASEURL + "procedures/getall"
            const response = await getSubmitForm(url, {})
            if (response && response.status === 1) {
                const data = response.data || []
                setProcedures(data)
                setProcedureOptions(
                    data.map((procedure) => ({
                        value: procedure._id || procedure.id,
                        label: procedure.name || procedure.procedure_name || procedure.title || 'Procedure'
                    }))
                )
            } else {
                showToast(response?.message || "Failed to fetch procedures", "error")
            }
        } catch (err) {
            showToast("Error fetching procedures", "error")
        }
    }

    const validationSchema = Yup.object({
        wife_name: Yup.string().required('Wife name is required'),
        husband_name: Yup.string().required('Husband name is required'),
        mobile: Yup.string()
            .required('Mobile number is required')
            .matches(/^\+91-[0-9]{10}$/, 'Mobile number must be +91- followed by 10 digits'),
        email: Yup.string().email('Invalid email format'),
        // .required('Email is required'),
        wife_age: Yup.number().required('Wife age is required'),
        husband_age: Yup.number().required('Husband age is required'),
        wife_tests: Yup.array(),
        husband_tests: Yup.array(),
        packages: Yup.array().min(1, 'At least one package is required'),
        charges_paid: Yup.number().nullable(),
        remark: Yup.string().nullable()
    })

    const formik = useFormik({
        initialValues: {
            wife_name: '',
            husband_name: '',
            mobile: '+91-',
            email: '',
            wife_age: '',
            husband_age: '',
            wife_tests: [],
            husband_tests: [],
            packages: [],
            charges_paid: '',
            remark: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const payload = {
                    wife: {
                        name: values.wife_name,
                        age: values.wife_age
                    },
                    husband: {
                        name: values.husband_name,
                        age: values.husband_age
                    },
                    mobile: values.mobile,
                    email: values.email,
                    wife_tests: values.wife_tests,
                    husband_tests: values.husband_tests,
                    packages: values.packages,
                    charges_paid: values.charges_paid,
                    remark: values.remark
                }

                let url = import.meta.env.VITE_APP_BASEURL
                let response

                if (mode === 'create') {
                    url += "patients/insert"
                    response = await postSubmitForm(url, payload)
                } else {
                    url += "patients/update"
                    payload.patient_id = patient._id
                    response = await putSubmitForm(url, payload)
                }

                if (response && response.status === 1) {
                    const updatedPatient = response.data || patient
                    let shouldPrint = false

                    if (mode === 'edit') {
                        const getPkgId = (pkg) => String(pkg?.procedure_id || pkg?.procedure?._id || pkg?.procedureId || '')
                        const prevIds = new Set(
                            (originalPackagesRef.current || []).map((pkg) => getPkgId(pkg)).filter(Boolean)
                        )
                        const addedPackages = (values.packages || []).filter((pkg) => {
                            const id = getPkgId(pkg)
                            return id && !prevIds.has(id)
                        })
                        const paymentOnly = Number(values.charges_paid || 0) > 0

                        if (addedPackages.length > 0 || paymentOnly) {
                            shouldPrint = true
                            const charges = addedPackages.map((pkg) => ({
                                serviceId: pkg.procedure_id || pkg.procedure?._id || pkg.procedureId || null,
                                serviceName: pkg.procedure_name || pkg.procedure?.name || 'Procedure',
                                qty: 1,
                                unitPrice: Number(pkg.amount || 0),
                                amount: Number(pkg.amount || 0),
                            }))

                            try {
                                const ledgerUrl = import.meta.env.VITE_APP_BASEURL + `patients/${updatedPatient._id}/txns`
                                const ledgerPayload = {
                                    charges,
                                    payment: Number(values.charges_paid || 0),
                                    note: values.remark || '',
                                }
                                const ledgerRes = await postSubmitForm(ledgerUrl, ledgerPayload)
                                if (ledgerRes && ledgerRes.status === 1) {
                                    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}")
                                    const receiptCharges = charges.length > 0
                                        ? charges.map((c) => ({ name: c.serviceName, amount: c.amount }))
                                        : [{ name: "Payment Received", amount: Number(values.charges_paid || 0) }]
                                    const receiptPayload = {
                                        receiptNo: ledgerRes.data?.receiptNo || updatedPatient.registration_no || updatedPatient._id || '',
                                        jhdNo: '',
                                        patientName: `${updatedPatient.wife?.name || ''} / ${updatedPatient.husband?.name || ''}`.trim(),
                                        consultantName: '',
                                        dateTime: moment().format("DD/MMM/YYYY  HH:mm"),
                                        opdNo: updatedPatient.registration_no || '',
                                        ageSex: `W:${updatedPatient.wife?.age || "-"} H:${updatedPatient.husband?.age || "-"}`,
                                        validUpto: '',
                                        serialNo: '',
                                        charges: receiptCharges,
                                        paymentMode: '',
                                        preparedBy: authUser?.username || authUser?.name || authUser?.role || '',
                                        printedOn: moment().format("DD/MMM/YYYY  HH:mm"),
                                        authorizedSignatoryText: "Authorized Signatory",
                                    }
                                    setPrintReceipt(receiptPayload)
                                } else {
                                    showToast(ledgerRes?.message || "Failed to create receipt", "error")
                                }
                            } catch (err) {
                                showToast("Error creating receipt", "error")
                            }
                        }
                    }

                    if (!shouldPrint) {
                        showToast(response.message || `Patient ${mode === 'create' ? 'created' : 'updated'} successfully`, 'success')
                    }

                    resetForm()
                    toggle()
                    refreshData()
                } else {
                    showToast(response.error || `Failed to ${mode} patient`, 'error')
                }
            } catch (err) {
                console.log(err)
                showToast(`Error ${mode === 'create' ? 'creating' : 'updating'} patient`, 'error')
            } finally {
                setSubmitting(false)
            }
        }
    })


    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && patient) {
                originalPackagesRef.current = patient.packages || []
                const wifeTests = (patient.wife_tests || []).map(test => test._id || test)
                const husbandTests = (patient.husband_tests || []).map(test => test._id || test)
                formik.setValues({
                    wife_name: patient.wife?.name || '',
                    husband_name: patient.husband?.name || '',
                    mobile: patient.mobile?.startsWith('+91-') ? patient.mobile : `+91-${patient.mobile || ''}`,
                    email: patient.email || '',
                    wife_age: patient.wife?.age || '',
                    husband_age: patient.husband?.age || '',
                    wife_tests: wifeTests,
                    husband_tests: husbandTests,
                    packages: patient.packages || [],
                    charges_paid: patient.charges_paid ?? '',
                    remark: patient.remark || ''
                })
            } else {
                formik.resetForm()
            }
        }
    }, [isOpen, mode, patient])

    useEffect(() => {
        if (!printReceipt) return
        const handleAfterPrint = () => setPrintReceipt(null)
        window.addEventListener("afterprint", handleAfterPrint)
        const timeout = setTimeout(() => {
            window.print()
        }, 300)
        return () => {
            clearTimeout(timeout)
            window.removeEventListener("afterprint", handleAfterPrint)
        }
    }, [printReceipt])

    const handleClose = () => {
        formik.resetForm()
        toggle()
    }

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
    ]

    const openPackageModal = (pkgIndex = null) => {
        setPackageError('')
        setPackageEditingIndex(pkgIndex)
        if (pkgIndex !== null) {
            const existing = formik.values.packages[pkgIndex]
            setPackageForm({
                procedureId: existing?.procedure_id || existing?.procedure?._id || existing?.procedureId || '',
                amount: existing?.amount ?? ''
            })
        } else {
            setPackageForm({ procedureId: '', amount: '' })
        }
        setPackageModalOpen(true)
    }

    const handleProcedureChange = (procedureId) => {
        const selected = procedures.find((p) => (p._id || p.id) === procedureId)
        const defaultAmount = selected?.amount ?? ''
        setPackageForm((prev) => ({ ...prev, procedureId, amount: defaultAmount }))
    }

    const savePackage = () => {
        if (!packageForm.procedureId) {
            setPackageError('Procedure is required')
            return
        }
        const amountValue = String(packageForm.amount ?? '').trim()
        if (amountValue === '' || Number.isNaN(Number(amountValue))) {
            setPackageError('Amount is required')
            return
        }

        const selected = procedures.find((p) => (p._id || p.id) === packageForm.procedureId)
        const procedureName = selected?.name || selected?.procedure_name || selected?.title || 'Procedure'
        const nextPackages = [...formik.values.packages]
        const newItem = {
            procedure_id: selected?._id || selected?.id || packageForm.procedureId,
            procedure_name: procedureName,
            amount: Number(amountValue)
        }

        if (packageEditingIndex !== null) {
            nextPackages[packageEditingIndex] = newItem
        } else {
            const existingIndex = nextPackages.findIndex(
                (pkg) => (pkg.procedure_id || pkg.procedure?._id || pkg.procedureId) === newItem.procedure_id
            )
            if (existingIndex >= 0) {
                nextPackages[existingIndex] = newItem
            } else {
                nextPackages.push(newItem)
            }
        }

        formik.setFieldValue('packages', nextPackages)
        setPackageModalOpen(false)
        setPackageEditingIndex(null)
        setPackageForm({ procedureId: '', amount: '' })
    }

    const removePackage = (index) => {
        const nextPackages = [...formik.values.packages]
        nextPackages.splice(index, 1)
        formik.setFieldValue('packages', nextPackages)
    }

    // console.log(availableTests,"availableTests");
    // console.log(formik.values.assigned_tests,"astes");
    
    

    return (
        <>
        <Modal isOpen={isOpen} toggle={handleClose} size="lg" className="d-print-none">
            <ModalHeader toggle={handleClose}>
                {mode === 'create' ? 'Add New Patient' : 'Edit Patient'}
            </ModalHeader>
            <Form onSubmit={formik.handleSubmit}>
                <ModalBody>
                    <Row>
                        <Col md={8} lg={8}>
                            <FormGroup>
                                <Label for="wife_name">Wife Name <span className="text-danger">*</span></Label>
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

                                                <Col md={4} lg={4}>
                            <FormGroup>
                                <Label for="wife_age">Wife Age <span className="text-danger">*</span></Label>
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

                    {/* <Row>

                        <Col md={6}>
                            <FormGroup>
                                <Label>Wife Gender</Label>
                                <Input type="text" value="Female" disabled />
                            </FormGroup>
                        </Col>
                    </Row> */}
                    <Row>
                                                <Col md={8} lg={8}>
                            <FormGroup>
                                <Label for="husband_name">Husband Name </Label>
                                <Input
                                    type="text"
                                    name="husband_name"
                                    id="husband_name"
                                    placeholder="Enter husband's name"
                                    value={formik.values.husband_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    // invalid={formik.touched.husband_name && formik.errors.husband_name ? true : false}
                                />
                                {formik.touched.husband_name && formik.errors.husband_name ? (
                                    <FormFeedback>{formik.errors.husband_name}</FormFeedback>
                                ) : null}
                            </FormGroup>
                        </Col>
                        <Col md={4} lg={4}>
                            <FormGroup>
                                <Label for="husband_age">Husband Age </Label>
                                <Input
                                    type="number"
                                    name="husband_age"
                                    id="husband_age"
                                    placeholder="Age"
                                    value={formik.values.husband_age}
                                    onWheel={preventValueChangeOnScroll}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    // invalid={formik.touched.husband_age && formik.errors.husband_age ? true : false}
                                />
                                {formik.touched.husband_age && formik.errors.husband_age ? (
                                    <FormFeedback>{formik.errors.husband_age}</FormFeedback>
                                ) : null}
                            </FormGroup>
                        </Col>
                        {/* <Col md={6}>
                            <FormGroup>
                                <Label>Husband Gender</Label>
                                <Input type="text" value="Male" disabled />
                            </FormGroup>
                        </Col> */}
                    </Row>
                    <Row>
                        <Col md={8} lg={8}>
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
                        <Col md={4} lg={4}>
                            <FormGroup>
                                <Label for="mobile">Mobile Number <span className="text-danger">*</span></Label>
                                <Input
                                    type="text"
                                    name="mobile"
                                    id="mobile"
                                    placeholder="Enter 10-digit mobile number"
                                    value={formik.values.mobile}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        const prefix = '+91-';
                                        
                                        // Handle input more flexibly: extract digits and re-attach prefix
                                        let digits = input;
                                        if (digits.startsWith(prefix)) {
                                            digits = digits.slice(prefix.length);
                                        } else {
                                            // Fallback if prefix is deleted or modified
                                            digits = digits.replace(/^\+?91-?/, '').replace(/\D/g, '');
                                        }
                                        
                                        // Keep only digits and limit to 10
                                        const finalDigits = digits.replace(/\D/g, '').slice(0, 10);
                                        formik.setFieldValue('mobile', prefix + finalDigits);
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

                    {/* <hr />
                    <h5 className="mb-3">Assign Tests</h5>
                    
                    <FormGroup>
                        <Label for="wife_tests">Wife Tests</Label>
                        <Select
                            isMulti
                            name="wife_tests"
                            options={availableTests}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select tests for wife..."
                            value={availableTests.filter(test => 
                                formik.values.wife_tests.includes(test.value)
                            )}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(opt => opt.value) : []
                                formik.setFieldValue('wife_tests', values)
                            }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="husband_tests">Husband Tests</Label>
                        <Select
                            isMulti
                            name="husband_tests"
                            options={availableTests}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select tests for husband..."
                            value={availableTests.filter(test => 
                                formik.values.husband_tests.includes(test.value)
                            )}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(opt => opt.value) : []
                                formik.setFieldValue('husband_tests', values)
                            }}
                        />
                    </FormGroup> */}

                    <hr />
                    <div className="d-flex align-items-center justify-content-start mb-3">
                        <h5 className="mb-0">Packages</h5>
                        <Button
                            color="light"
                            className="btn-rounded ms-2"
                            type="button"
                            onClick={() => openPackageModal()}
                            title="Add Package"
                        >
                            <i className="bx bx-plus"></i>
                        </Button>
                    </div>

                    {formik.values.packages && formik.values.packages.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr>
                                        <th style={{ width: "55%" }}>Procedure Name</th>
                                        <th style={{ width: "25%" }}>Amount</th>
                                        <th style={{ width: "20%" }} className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formik.values.packages.map((pkg, index) => (
                                        <tr key={`${pkg.procedure_id || pkg.procedureId || index}-${index}`}>
                                            <td>{pkg.procedure_name || pkg.procedure?.name || '-'}</td>
                                            <td>{pkg.amount ?? '-'}</td>
                                            <td className="text-end">
                                                <Button
                                                    color="link"
                                                    className="p-0 me-2"
                                                    type="button"
                                                    onClick={() => openPackageModal(index)}
                                                    title="Edit"
                                                >
                                                    <i className="bx bxs-edit text-primary"></i>
                                                </Button>
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
                        <Col md={4} lg={4}>
                            <FormGroup>
                                <Label for="charges_paid">Charges paid (if any)</Label>
                                <Input
                                    type="number"
                                    name="charges_paid"
                                    id="charges_paid"
                                    placeholder="Enter amount"
                                    value={formik.values.charges_paid}
                                    onWheel={preventValueChangeOnScroll}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    invalid={formik.touched.charges_paid && formik.errors.charges_paid ? true : false}
                                />
                                {formik.touched.charges_paid && formik.errors.charges_paid ? (
                                    <FormFeedback>{formik.errors.charges_paid}</FormFeedback>
                                ) : null}
                            </FormGroup>
                        </Col>
                        <Col md={8} lg={8}>
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
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        type="submit" 
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Patient' : 'Update Patient')}
                    </Button>
                </ModalFooter>
            </Form>

            <Modal isOpen={packageModalOpen} toggle={() => setPackageModalOpen(false)} size="md" className="d-print-none">
                <ModalHeader toggle={() => setPackageModalOpen(false)}>
                    {packageEditingIndex !== null ? 'Edit Package' : 'Add Package'}
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="procedure">Procedure <span className="text-danger">*</span></Label>
                        <Input
                            type="select"
                            name="procedure"
                            id="procedure"
                            value={packageForm.procedureId}
                            onChange={(e) => handleProcedureChange(e.target.value)}
                        >
                            <option value="">Select Procedure</option>
                            {procedureOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="procedure_amount">Amount <span className="text-danger">*</span></Label>
                        <Input
                            type="number"
                            name="procedure_amount"
                            id="procedure_amount"
                            placeholder="Amount"
                            value={packageForm.amount}
                            onWheel={preventValueChangeOnScroll}
                            onChange={(e) => setPackageForm((prev) => ({ ...prev, amount: e.target.value }))}
                        />
                    </FormGroup>
                    {packageError ? (
                        <div className="text-danger small">{packageError}</div>
                    ) : null}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setPackageModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={savePackage}>
                        {packageEditingIndex !== null ? 'Update' : 'Add'}
                    </Button>
                </ModalFooter>
            </Modal>
        </Modal>
        {printReceipt && (
            <div className="d-none d-print-block">
                <OPDReceipt receipt={printReceipt} />
            </div>
        )}
        </>
    )
}

PatientModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['create', 'edit']).isRequired,
    patient: PropTypes.object,
    refreshData: PropTypes.func.isRequired
}

export default PatientModal
