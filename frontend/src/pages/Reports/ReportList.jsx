import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, Button, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, Input, Spinner } from "reactstrap"
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/themes/material_blue.css"
import { postSubmitForm, deleteSubmitForm, getSubmitForm } from '../../helpers/forms_helper'
import showToast from "../../helpers/show_toast"
import { DataGrid } from '@mui/x-data-grid'
import preloader from "../../helpers/preloader"
import { CustomToolbar } from "../../helpers/table_helpers"
import moment from 'moment'
import Swal from 'sweetalert2'
import LetterHead from '../../components/Reports/LetterHead'
import pdf_logo from "../../assets/images/pdf_logo.png";
import exportFromJSON from 'export-from-json'
import AssignedTestsViewer from '../../components/Common/AssignedTestsViewer'
import { useLocation } from 'react-router-dom'

const ReportList = () => {
    const location = useLocation()
    const reportMeta = useMemo(() => {
        switch (location.pathname) {
            case '/reports/day-wise':
                return { title: 'Day-wise Report', exportTitle: 'Daywise_Reports' }
            case '/reports/patient-history':
                return { title: 'Patient History', exportTitle: 'Patient_History' }
            case '/reports/tenure-wise':
                return { title: 'Tenure wise Report', exportTitle: 'Tenure_Reports' }
            default:
                return { title: 'Reports', exportTitle: 'All_Reports' }
        }
    }, [location.pathname])

    document.title = reportMeta.title
    const componentRef = useRef()
    const role = localStorage.getItem("role")
    const [loading, setLoading] = useState(false)
    const [allData, setAllData] = useState([])
    const [modal, setModal] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
    const [patients, setPatients] = useState([])
    const [selectedPatientId, setSelectedPatientId] = useState("")
    const [sortModel, setSortModel] = useState([])
    const isPatientHistory = location.pathname === '/reports/patient-history'
    const [historyModal, setHistoryModal] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyPatient, setHistoryPatient] = useState(null)
    const [historyTxns, setHistoryTxns] = useState([])

    const normalizeDateValue = (value) => {
        if (!value) return ""
        const raw = String(value).trim()
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
        const parsed = moment(raw, ["YYYY-MM-DD", "DD-MM-YYYY", "MM-DD-YYYY"], true)
        return parsed.isValid() ? parsed.format("YYYY-MM-DD") : ""
    }

    useEffect(() => {
        if (!isPatientHistory) {
            fetch_data()
        }
    }, [isPatientHistory])

    useEffect(() => {
        if (isPatientHistory) {
            const today = moment().format("YYYY-MM-DD")
            setFromDate(today)
            setToDate(today)
            fetchPatients()
        } else {
            setFromDate(moment().format("YYYY-MM-DD"))
            setToDate(moment().format("YYYY-MM-DD"))
            setSelectedPatientId("")
        }
    }, [isPatientHistory])

    useEffect(() => {
        if (isPatientHistory && selectedPatientId) {
            fetch_data()
        }
    }, [isPatientHistory, selectedPatientId])

    const fetchPatients = async () => {
        try {
            preloader(true)
            const url = import.meta.env.VITE_APP_BASEURL + "patients/getall"
            const response = await getSubmitForm(url, {})
            if (response && response.status === 1) {
                setPatients(response.data || [])
            } else {
                showToast(response?.message || "Failed to fetch patients", "error")
            }
        } catch (err) {
            console.log(err)
            showToast("Error fetching patients", "error")
        } finally {
            preloader(false)
        }
    }

    const fetch_data = async () => {
        try {
            setLoading(true)
            preloader(true)
            if (isPatientHistory && !selectedPatientId) {
                showToast("Select a patient to view history", "warning")
                setAllData([])
                setLoading(false)
                preloader(false)
                return
            }
            const payload = {}
            const normalizedFrom = normalizeDateValue(fromDate)
            const normalizedTo = normalizeDateValue(toDate)
            if (normalizedFrom) payload.from_date = normalizedFrom
            if (normalizedTo) payload.to_date = normalizedTo
            if (isPatientHistory && selectedPatientId) payload.patient_id = selectedPatientId
            let url = import.meta.env.VITE_APP_BASEURL + "reports/getall"
            let response = await postSubmitForm(url, payload)
            if (response && response.status === 1) {
                setAllData(response.data || [])
            } else {
                setAllData([])
                showToast(response.message || "Failed to fetch reports", "error")
            }
        } catch (err) {
            console.log(err)
            showToast("Error fetching reports", "error")
        } finally {
            setLoading(false)
            preloader(false)
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        })

        if (result.isConfirmed) {
            try {
                preloader(true)
                let url = import.meta.env.VITE_APP_BASEURL + "reports/delete"
                let response = await deleteSubmitForm(url, { report_id: id })
                if (response && response.status === 1) {
                    showToast("Report deleted successfully", "success")
                    fetch_data()
                } else {
                    showToast(response.message || "Failed to delete report", "error")
                }
            } catch (err) {
                console.log(err)
                showToast("Error deleting report", "error")
            } finally {
                preloader(false)
            }
        }
    }

    const handleView = (row) => {
        setSelectedAssignment(row)
        setModal(true)
    }

    const openPrintPopup = (data) => {
        const width = 1000;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const uniqueWindowName = `PrintWindow_${data._id}_${Date.now()}`;
        const printWindow = window.open(
            `/print_details?id=${data._id}`,
            uniqueWindowName,
            `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (printWindow) {
            const handleMessage = (event) => {
                if (event.data && event.data.type === 'PRINT_WINDOW_READY') {
                    printWindow.postMessage({
                        type: 'PRINT_APPDATA',
                        payload: {
                            testResults: data
                        }
                    }, '*');
                    window.removeEventListener('message', handleMessage);
                }
            };
            window.addEventListener('message', handleMessage);
        }
    };

    const handlePrint = () => {
        if (selectedAssignment) {
            openPrintPopup(selectedAssignment);
        }
    }

    const handleHistory = async (patient) => {
        if (!patient?._id) return
        try {
            setHistoryPatient(patient)
            setHistoryLoading(true)
            setHistoryTxns([])
            setHistoryModal(true)
            const url = import.meta.env.VITE_APP_BASEURL + `patients/${patient._id}/ledger`
            const response = await getSubmitForm(url, {})
            if (response && response.status === 1) {
                const txns = response.data?.txns || []
                if (txns.length === 0 && (patient.packages || []).length > 0) {
                    const seedUrl = import.meta.env.VITE_APP_BASEURL + `patients/${patient._id}/ledger/seed`
                    const seedRes = await postSubmitForm(seedUrl, {})
                    if (seedRes && seedRes.status === 1) {
                        const retry = await getSubmitForm(url, {})
                        if (retry && retry.status === 1) {
                            setHistoryTxns(retry.data?.txns || [])
                        } else {
                            setHistoryTxns(txns)
                            showToast(retry?.message || "Failed to fetch history after seeding", "error")
                        }
                    } else {
                        setHistoryTxns(txns)
                        showToast(seedRes?.message || "Failed to seed history", "error")
                    }
                } else {
                    setHistoryTxns(txns)
                }
            } else {
                showToast(response?.message || "Failed to fetch history", "error")
            }
        } catch (err) {
            console.log(err)
            showToast("Error fetching history", "error")
        } finally {
            setHistoryLoading(false)
        }
    }

    const baseColumns = [
        {
            field: 'sn',
            headerName: '#',
            width: 50,
            renderCell: (params) => {
                const rowIds = params.api.getSortedRowIds();
                return rowIds.indexOf(params.id) + 1;
            }
        },
        {
            field: 'patient_id.registration_no',
            headerName: 'Patient ID',
            flex: 1,
            minWidth: 100,
            valueGetter: (value, row) => row.patient_id?.registration_no || 'N/A'
        },
        {
            field: 'patient_name',
            headerName: 'Patient Name',
            flex: 1,
            minWidth: 100,
            valueGetter: (value, row) => row.patient_id?.wife?.name || row.patient_id?.name || 'N/A'
        },
        {
            field: 'husband_name',
            headerName: 'Husband Name',
            flex: 1,
            minWidth: 100,
            valueGetter: (value, row) => row.patient_id?.husband?.name || '-'
        },
        {
            field: 'ages',
            headerName: 'W/H Age',
            flex: 0.7,
            minWidth: 100,
            renderCell: (params) => (
                <div className="d-flex align-items-center justify-content-between w-100">
                    <span>{params.row.patient_id?.wife?.age || '-'}/{params.row.patient_id?.husband?.age || '-'}</span>
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
        {
            field: 'test_counts',
            headerName: 'Tests (W/H)',
            width: 140,
            renderCell: (params) => (
                <AssignedTestsViewer
                    wifeTests={params.row.wife_tests}
                    husbandTests={params.row.husband_tests}
                    id={params.row._id}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Test Time',
            flex: 1,
            minWidth: 100,
            valueGetter: (value) => moment(value).format('DD-MM-YYYY hh:mm')
        }
    ]

    const columns = isPatientHistory
        ? [
            ...baseColumns,
            {
                field: 'history_action',
                headerName: 'Action',
                width: 150,
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                    const patient = params.row.patient_id || params.row
                    return (
                        <Button
                            color="primary"
                            size="sm"
                            className="btn-rounded px-3"
                            onClick={() => handleHistory(patient)}
                        >
                            View History
                        </Button>
                    )
                }
            }
        ]
        : baseColumns

    const historyRows = (() => {
        let lastCharges = []
        return (historyTxns || []).map((txn) => {
            const charges = Array.isArray(txn.charges) ? txn.charges : []
            const displayCharges = charges.length > 0 ? charges : lastCharges
            if (charges.length > 0) {
                lastCharges = charges
            }
            const displayTotal = Number(txn.openingBalance || 0) + Number(txn.chargesTotal || 0)
            return { txn, displayCharges, displayTotal }
        })
    })()

    const formatVisitDate = (value) => {
        if (!value) return '-'
        const d = new Date(value)
        if (isNaN(d.getTime())) return '-'
        return d.toLocaleDateString()
    }

    const renderReport = () => {
        if (!selectedAssignment) return null;
        return <LetterHead data={selectedAssignment} />;
    }

    const handleExport = () => {
        const rangeLabel = (fromDate && toDate)
            ? `${moment(fromDate).format('DD-MM-YYYY')}_to_${moment(toDate).format('DD-MM-YYYY')}`
            : 'All_Dates'
        const exportData = allData.map((item, index) => ({
            'S.No': index + 1,
            'Date': moment(item.createdAt).format('DD-MM-YYYY'),
            'Patient ID': item.patient_id?.registration_no || 'N/A',
            'Patient Name': item.patient_id?.wife?.name || item.patient_id?.name || 'N/A',
            'Husband Name': item.patient_id?.husband?.name || 'N/A',
            'Wife Tests': (item.wife_tests || []).map(t => t.test_code).join(', '),
            'Husband Tests': (item.husband_tests || []).map(t => t.test_code).join(', ')
        }))
        exportFromJSON({
            data: exportData,
            fileName: `${reportMeta.exportTitle}_${rangeLabel}`,
            exportType: exportFromJSON.types.xls
        })
        showToast('Data exported successfully', 'success')
    }
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col md={12}>
                            <Card>
                                <CardBody>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <CardTitle>{reportMeta.title}</CardTitle>
                                            {/* <CardSubtitle>View all reports</CardSubtitle> */}
                                        </div>
                                    </div>

                                    <Form onSubmit={(e) => { e.preventDefault(); fetch_data(); }}>
                                        <div className="d-flex gap-2 flex-wrap align-items-center">
                                            {isPatientHistory && (
                                                <FormGroup className="mb-0 d-flex align-items-center gap-2">
                                                    <Label className="mb-0 text-nowrap">Patient</Label>
                                                    <Input
                                                        type="select"
                                                        bsSize="sm"
                                                        value={selectedPatientId}
                                                        onChange={(e) => setSelectedPatientId(e.target.value)}
                                                        style={{ width: '220px' }}
                                                    >
                                                        <option value="">Select Patient</option>
                                                        {patients.map((p) => (
                                                            <option key={p._id} value={p._id}>
                                                                {(p.registration_no ? `${p.registration_no} - ` : '')}
                                                                {p.wife?.name || p.name || 'Patient'}
                                                                {p.husband?.name ? ` / ${p.husband?.name}` : ''}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            )}
                                            <FormGroup className="mb-0 d-flex align-items-center gap-2">
                                                <Label className="mb-0 text-nowrap">From</Label>
                                                <Flatpickr
                                                    className="form-control form-control-sm"
                                                    value={fromDate || ""}
                                                    options={{
                                                        dateFormat: "Y-m-d",
                                                        maxDate: toDate || null
                                                    }}
                                                    onChange={(_, dateStr) => setFromDate(dateStr)}
                                                    style={{ width: '130px' }}
                                                />
                                            </FormGroup>
                                            <FormGroup className="mb-0 d-flex align-items-center gap-2">
                                                <Label className="mb-0 text-nowrap">To</Label>
                                                <Flatpickr
                                                    className="form-control form-control-sm"
                                                    value={toDate || ""}
                                                    options={{
                                                        dateFormat: "Y-m-d",
                                                        minDate: fromDate || null
                                                    }}
                                                    onChange={(_, dateStr) => setToDate(dateStr)}
                                                    style={{ width: '130px' }}
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-0">
                                                <Label></Label>
                                                <Button color="primary" size='sm' type="submit" className="ms-5">
                                                    Submit
                                                </Button>
                                            </FormGroup>
                                        </div>
                                    </Form>

                                    <div ref={componentRef}>
                                        <DataGrid
                                            getRowId={(row) => row._id}
                                            rows={allData}
                                            columns={columns}
                                            loading={loading}
                                            density="compact"
                                            initialState={{
                                                pagination: {
                                                    paginationModel: { pageSize: 100 }
                                                }
                                            }}
                                            pageSizeOptions={[10, 25, 50, 100]}
                                            disableRowSelectionOnClick
                                            slots={{ toolbar: CustomToolbar }}
                                            onSortModelChange={(newSortModel) => {
                                                setSortModel(newSortModel)
                                            }}
                                            slotProps={{
                                                toolbar: { exportdata: () => { handleExport() }, componentRef, title: reportMeta.title },
                                            }}
                                            getRowHeight={() => 'auto'}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={modal} toggle={() => setModal(!modal)} size="xl" className="report-modal">
                <ModalHeader toggle={() => setModal(!modal)} className="no-print">
                    Report Preview - {selectedAssignment?.patient_id?.wife?.name || selectedAssignment?.patient_id?.name}
                </ModalHeader>
                <ModalBody className="p-0">
                    <div className="report-container-modal">
                        {renderReport()}
                    </div>
                </ModalBody>
                <ModalFooter className="no-print">
                    <Button color="secondary" onClick={() => setModal(false)}>Close</Button>
                    <Button color="primary" onClick={handlePrint}>
                        <i className="bx bx-printer me-1"></i> Print
                    </Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={historyModal} toggle={() => setHistoryModal(!historyModal)} size="lg">
                <ModalHeader toggle={() => setHistoryModal(!historyModal)}>
                    {historyPatient?.wife?.name || '-'}&#39;s - Visit History
                </ModalHeader>
                <ModalBody>
                    {historyLoading ? (
                        <div className="text-center py-4">
                            <Spinner />
                        </div>
                    ) : historyTxns.length === 0 ? (
                        <div className="text-center text-muted py-4">No previous procedures found.</div>
                    ) : (
                        <div className="visit-timeline">
                            {historyRows.map(({ txn, displayCharges, displayTotal }) => (
                                <div className="visit-item" key={txn._id}>
                                    <div className="visit-card">
                                        <div className="visit-title">Receipt No: {txn.receiptNo || '-'}</div>
                                        <div className="visit-sub">
                                            {displayCharges.length === 0
                                                ? '-'
                                                : displayCharges
                                                    // .map((c) => `${c.serviceName || 'Procedure'} x${c.qty || 1}`)
                                                    .map((c) => `${c.serviceName || 'Procedure'}`)
                                                    .join(', ')
                                            }
                                        </div>
                                        <div className="visit-amounts">
                                            <span>Total: {Number(displayTotal || 0).toFixed(2)}</span>
                                            <span>Paid: {Number(txn.payment || 0).toFixed(2)}</span>
                                            <span>Closing: {Number(txn.closingBalance || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="visit-line">
                                        <span className="visit-dot"></span>
                                    </div>
                                    <div className="visit-date">
                                        <span className="visit-date-pill">
                                            <i className="bx bx-calendar"></i>
                                            {formatVisitDate(txn.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </React.Fragment>
    )
}

export default ReportList
