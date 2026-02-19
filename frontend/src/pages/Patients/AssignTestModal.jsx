import React, { useEffect, useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col, Badge } from 'reactstrap'
import Select from 'react-select'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTests } from '../../store/tests/actions'
import { putSubmitForm, getSubmitForm, postSubmitForm } from '../../helpers/forms_helper'
import showToast from '../../helpers/show_toast'
import preloader from '../../helpers/preloader'

const AssignTestModal = ({ isOpen, toggle, refreshData, patient }) => {
    const dispatch = useDispatch()
    const tests = useSelector(state => state.Tests.tests)
    const [patients, setPatients] = useState([])
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [wifeTests, setWifeTests] = useState([])
    const [husbandTests, setHusbandTests] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (tests.length === 0) dispatch(fetchTests())
            fetchPatients()
            if (patient) {
                setSelectedPatient(patient)
                setWifeTests((patient.wife_tests || []).map(t => t._id || t))
                setHusbandTests((patient.husband_tests || []).map(t => t._id || t))
            } else {
                setSelectedPatient(null)
                setWifeTests([])
                setHusbandTests([])
            }
        }
    }, [isOpen, patient])

    const fetchPatients = async () => {
        try {
            const url = import.meta.env.VITE_APP_BASEURL + "patients/getall"
            const response = await getSubmitForm(url, {})
            if (response && response.status === 1) {
                const options = response.data.map(p => ({
                    value: p._id,
                    label: `${p.wife?.name || 'Unknown'}  ${p.husband?.name ? `/${p.husband?.name}` : ''} (${p.mobile})`,
                    data: p
                }))
                setPatients(options)
            }
        } catch (err) {
            console.error(err)
        }
    }


    const handlePatientChange = (selectedOption) => {
        setSelectedPatient(selectedOption ? selectedOption.data : null)
        if (selectedOption) {
            const p = selectedOption.data
            setWifeTests((p.wife_tests || []).map(t => t._id || t))
            setHusbandTests((p.husband_tests || []).map(t => t._id || t))
        } else {
            setWifeTests([])
            setHusbandTests([])
        }
    }

    const handleSubmit = async () => {
        if (!selectedPatient) {
            showToast("Please select a patient first", "warning")
            return
        }

        try {
            setLoading(true)
            preloader(true)
            const payload = {
                patient_id: selectedPatient._id,
                wife_tests: wifeTests,
                husband_tests: husbandTests
            }
            const url = import.meta.env.VITE_APP_BASEURL + "reports/assign_tests"
            const response = await postSubmitForm(url, payload)

            if (response && response.status === 1) {
                showToast("Procedure assigned successfully", "success")
                toggle()
                refreshData()
            } else {
                showToast(response.message || "Failed to assign procedures", "error")
            }
        } catch (err) {
            console.error(err)
            showToast("Error assigning procedures", "error")
        } finally {
            preloader(false)
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Assign Procedure to Patient</ModalHeader>
            <ModalBody>
                {!patient && (
                    <FormGroup>
                        <Label>Search Patient (Wife/Husband Name or Mobile)</Label>
                        <Select
                            options={patients}
                            placeholder="Search for patient..."
                            onChange={handlePatientChange}
                            isClearable
                        />
                    </FormGroup>
                )}

                {selectedPatient && (
                    <div className="mt-4 p-3 border rounded bg-light">
                        <h5>Patient Details</h5>
                        <Row>
                            <Col md={6}>
                                <p><strong>Wife:</strong> {selectedPatient.wife?.name} ({selectedPatient.wife?.age} yrs)</p>
                                <p><strong>Husband:</strong> {selectedPatient.husband?.name} </p>
                            </Col>
                            <Col md={6}>
                                <p><strong>Mobile:</strong> {selectedPatient.mobile}</p>
                            </Col>
                        </Row>

                        <hr />
                        <Row>
                            <Col md={6}>
                                <Label className="fw-bold mb-2">Assign Procedures to Wife</Label>
                                <div className="p-2 border rounded" style={{ maxHeight: '350px', overflowY: 'auto', backgroundColor: '#fff', fontSize: '13px' }}>
                                    {tests.filter(t => t.sample_type !== 'Semen').map(test => (
                                        <div key={test._id} className="d-flex align-items-center mb-1">
                                            <input
                                                type="checkbox"
                                                id={`wife-test-${test._id}`}
                                                checked={wifeTests.includes(test._id)}
                                                onChange={() => {
                                                    if (wifeTests.includes(test._id)) {
                                                        setWifeTests(wifeTests.filter(id => id !== test._id))
                                                    } else {
                                                        setWifeTests([...wifeTests, test._id])
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label
                                                className="ms-2 mb-0 cursor-pointer"
                                                htmlFor={`wife-test-${test._id}`}
                                                style={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            >
                                                {test.test_name}({test.test_code})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </Col>
                            {selectedPatient.husband?.name && (
                                <Col md={6}>
                                    <Label className="fw-bold mb-2">Assign Procedures to Husband</Label>
                                    <div className="p-2 border rounded" style={{ maxHeight: '350px', overflowY: 'auto', backgroundColor: '#fff', fontSize: '13px' }}>
                                        {tests.map(test => (
                                            <div key={test._id} className="d-flex align-items-center mb-1">
                                                <input
                                                    type="checkbox"
                                                    id={`husband-test-${test._id}`}
                                                    checked={husbandTests.includes(test._id)}
                                                    onChange={() => {
                                                        if (husbandTests.includes(test._id)) {
                                                            setHusbandTests(husbandTests.filter(id => id !== test._id))
                                                        } else {
                                                            setHusbandTests([...husbandTests, test._id])
                                                        }
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <label
                                                    className="ms-2 mb-0 cursor-pointer"
                                                    htmlFor={`husband-test-${test._id}`}
                                                    style={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                >
                                                    {test.test_name}({test.test_code})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Cancel</Button>
                <Button color="primary" onClick={handleSubmit} disabled={!selectedPatient || loading}>
                    {loading ? <i className="bx bx-loader bx-spin font-size-16 align-middle me-2"></i> : null}
                    {loading ? 'Saving...' : 'Save Assignments'}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default AssignTestModal
