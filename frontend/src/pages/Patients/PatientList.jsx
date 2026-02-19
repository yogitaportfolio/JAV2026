import { withTranslation } from "react-i18next"
import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, Spinner, Button, Badge } from "reactstrap"
import PropTypes from "prop-types"
import React, { useEffect, useState, useRef } from 'react'
import { deleteSubmitForm, getSubmitForm } from '../../helpers/forms_helper'
import showToast from "../../helpers/show_toast"
import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import exportFromJSON from 'export-from-json'
import PatientModal from './PatientModal'
import AssignTestModal from './AssignTestModal'
import preloader from "../../helpers/preloader"
import { CustomToolbar } from "../../helpers/table_helpers"

const PatientList = (props) => {
    document.title = 'Patient Management'
    const componentRef = useRef()
    const role = localStorage.getItem("role")
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [allData, setAllData] = useState([])
    const [patientModal, setPatientModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [modalMode, setModalMode] = useState('create')
    const [sortModel, setSortModel] = useState([])

    useEffect(() => {
        fetch_data()
    }, [])

    const fetch_data = async () => {
        try {
            preloader(true)
            let url = import.meta.env.VITE_APP_BASEURL + "patients/getall"
            let response = await getSubmitForm(url, {})
            if (response && response.status === 1) {
                setAllData(response.data)
            } else {
                showToast(response.message || "Failed to fetch patients", "error")
            }
        } catch (err) {
            console.log(err)
            showToast("Error fetching patients", "error")
        } finally {
            preloader(false)
        }
    }

    const handleAddPatient = () => {
        navigate("/patients/new")
    }

    const handleEditPatient = (patient) => {
        setModalMode('edit')
        setSelectedPatient(patient)
        setPatientModal(true)
    }

    const handleDeletePatient = async (patientId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this patient!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        })

        if (result.isConfirmed) {
            try {
                const payload = { patient_id: patientId }
                let url = import.meta.env.VITE_APP_BASEURL + "patients/delete"
                const response = await deleteSubmitForm(url, payload)
                if (response && response.status === 1) {
                    fetch_data()
                    showToast(response.message || 'Patient deleted successfully', 'success')
                } else {
                    showToast(response.error || 'Failed to delete patient', 'error')
                }
            } catch (err) {
                console.log(err)
                showToast('Error deleting patient', 'error')
            }
        }
    }

    const handleExport = () => {
        if (!allData || allData.length === 0) {
            showToast('No data to export', 'warning')
            return
        }

        const exportData = allData.map((patient, index) => ({
            'S.No': index + 1,
            'Patient ID': patient.registration_no || '-',
            'Patient Name': `${patient.wife?.name || '-'} / ${patient.husband?.name || '-'}`,
            'Age (W/H)': `${patient.wife?.age || '-'}/${patient.husband?.age || '-'}`,
            'Mobile': patient.mobile || '-',
            'Email': patient.email || '-',
        }))

        exportFromJSON({
            data: exportData,
            fileName: `patients_${new Date().toISOString().split('T')[0]}`,
            exportType: exportFromJSON.types.xls
        })
        showToast('Data exported successfully', 'success')
    }

    const [assignTestModal, setAssignTestModal] = useState(false)
    const [selectedPatientForTest, setSelectedPatientForTest] = useState(null)

    const handleAssignTest = (patient) => {
        setSelectedPatientForTest(patient)
        setAssignTestModal(true)
    }

    const formatPatientId = (id) => {
        if (!id) return 'N/A'
        const value = String(id)
        if (!value.startsWith('JV01') || value.length < 17) return value
        const tsPart = value.slice(4, 17)
        const randPart = value.slice(17)
        const ts = Number(tsPart)
        if (!Number.isFinite(ts)) return value
        const date = new Date(ts)
        if (isNaN(date.getTime())) return value
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        const suffix = randPart ? `-${randPart}` : ''
        return `JV01-${y}${m}${d}${suffix}`
    }

    const columns = [
        {
            field: 'sn', 
            headerName: '#', 
            flex: 0.5,
            minWidth: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const rowIds = params.api.getSortedRowIds()
                return rowIds.indexOf(params.id) + 1
            }
        },
        { 
            field: 'registration_no', 
            headerName: 'Patient ID', 
            flex: 1, 
            minWidth: 100,
            renderCell: (params) => {
                const rawId = params.row.registration_no || 'N/A'
                const formatted = formatPatientId(rawId)
                return (
                    <span title={rawId} style={{ fontFamily: 'monospace' }}>
                        {formatted}
                    </span>
                )
            }
        },
        { 
            field: 'wife_name', 
            headerName: 'Wife Name', 
            flex: 1.5, 
            minWidth: 150,
            valueGetter: (value, row) => row.wife?.name || '-'
        },
        { 
            field: 'husband_name', 
            headerName: 'Husband Name', 
            flex: 1.5, 
            minWidth: 150,
            valueGetter: (value, row) => row.husband?.name || '-'
        },
        { 
            field: 'mobile', 
            headerName: 'Mobile', 
            flex:1,
            minWidth: 100,
            // renderCell: (params) => {
            //     return `+91 ${params.row.mobile}`
            // }
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            flex:1,
            minWidth: 150,
        },
        { 
            field: 'ages', 
            headerName: 'W/H Age', 
            flex:0.5,
            minWidth: 100,
            renderCell: (params) => (
                <div className="d-flex align-items-center justify-content-between w-100">
                    <span>{params.row.wife?.age || '-'}/{params.row.husband?.age || '-'}</span>
                    {/* <Button 
                        color="link" 
                        size="sm" 
                        className="p-0 ms-2"
                        onClick={() => handleAssignTest(params.row)}
                        title="Assign Test"
                    >
                        <i className="bx bx-plus-circle text-primary font-size-18"></i>
                    </Button> */}
                </div>
            )
        },
        // {
        //     field: 'wife_tests',
        //     headerName: 'Wife Tests',
        //     flex: 1,
        //     minWidth: 150,
        //     renderCell: (params) => {
        //         const tests = params.row.wife_tests || []
        //         return (
        //             <div className="d-flex flex-wrap gap-1">
        //                 {tests.map((test, idx) => (
        //                     <Badge key={idx} color="info" pill className="me-1">
        //                         {test.test_name}
        //                     </Badge>
        //                 ))}
        //             </div>
        //         )
        //     }
        // },
        // {
        //     field: 'husband_tests',
        //     headerName: 'Husband Tests',
        //     flex: 1,
        //     minWidth: 150,
        //     renderCell: (params) => {
        //         const tests = params.row.husband_tests || []
        //         return (
        //             <div className="d-flex flex-wrap gap-1">
        //                 {tests.map((test, idx) => (
        //                     <Badge key={idx} color="secondary" pill className="me-1">
        //                         {test.test_name}
        //                     </Badge>
        //                 ))}
        //             </div>
        //         )
        //     }
        // },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                return (
                    <div style={{ fontSize: "20px" }} className="d-flex justify-content-around align-items-center w-100">
                        <i className="bx bxs-edit text-primary cursor-pointer"
                            onClick={() => handleEditPatient(params.row)}
                            title="Edit Patient"
                        ></i>
                        {role === "admin" && (
                            <i className="bx bxs-trash text-danger cursor-pointer"
                                onClick={() => handleDeletePatient(params.row._id)}
                                title="Delete Patient"
                            ></i>
                        )}
                    </div>
                )
            }
        },
    ]

    return (
        <>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col md={12}>
                            <Card>
                                <CardBody>
                                    <Row className="mb-2 px-2">
                                        <Col md={6}>
                                            <CardTitle>{props.t("Patient Management")}</CardTitle>
                                            <CardSubtitle>
                                                {props.t("Manage patients and procedure assignments")}
                                            </CardSubtitle>
                                        </Col>
                                        <Col md={6} className="text-end">
                                         <Button 
                                                color="success" 
                                                className="btn-rounded  me-2"
                                                onClick={handleAddPatient}
                                            >
                                                <i className="bx bx-plus-circle me-1"></i>
                                                Add Patient
                                            </Button>
                                            {/* <Button 
                                                color="primary" 
                                                className="btn-rounded"
                                                onClick={() => {
                                                    setSelectedPatientForTest(null)
                                                    setAssignTestModal(true)
                                                }}
                                            >
                                                <i className="bx bx-list-check me-1"></i>
                                                Assign Test
                                            </Button> */}
                                        </Col>
                                    </Row>
                                    <hr />
                                    {loading ? (
                                        <Row>
                                            <Col md={12} className="text-center py-5">
                                                <Spinner />
                                            </Col>
                                        </Row>
                                    ) : allData && allData.length > 0 ? (
                                        <Row className="mt-2">
                                            <Col md={12}>
                                                <div ref={componentRef} style={{width:"100%"}}>
                                                    <DataGrid
                                                        getRowId={(row) => row._id}
                                                        rows={allData}
                                                        columnVisibilityModel={{
                                                            action: (role === "Receptionist" || role === "Reviewer") ? false : true,
                                                        }}
                                                        getRowHeight={() => 'auto'}
                                                        columns={columns}
                                                        loading={false}
                                                        density="compact"
                                                        initialState={{
                                                            pagination: {
                                                                paginationModel: { pageSize: 100 }
                                                            }
                                                        }}
                                                        onSortModelChange={(newSortModel) => {
                                                            setSortModel(newSortModel)
                                                        }}
                                                        pageSizeOptions={[10, 25, 50, 100]}
                                                        disableSelectionOnClick
                                                        disableRowSelectionOnClick
                                                        checkboxSelection={false}
                                                        slots={{ toolbar: CustomToolbar }}
                                                        slotProps={{
                                                            toolbar: { exportdata: handleExport, componentRef, title: "All Patients" },
                                                        }}
                                                        // autoHeight
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row>
                                            <Col md={12} className="text-center py-5">
                                                <h4>No patients found</h4>
                                                <p className="text-muted">Click "Add Patient" to create your first patient</p>
                                            </Col>
                                        </Row>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Patient Modal */}
            <PatientModal
                isOpen={patientModal}
                toggle={() => setPatientModal(!patientModal)}
                mode={modalMode}
                patient={selectedPatient}
                refreshData={fetch_data}
            />

            <AssignTestModal
                isOpen={assignTestModal}
                toggle={() => setAssignTestModal(!assignTestModal)}
                refreshData={fetch_data}
                patient={selectedPatientForTest}
            />
        </>
    )
}

PatientList.propTypes = {
    t: PropTypes.any,
}

export default withTranslation()(PatientList)
