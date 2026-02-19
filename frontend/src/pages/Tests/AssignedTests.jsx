import React, { useEffect, useState, useRef } from 'react'
import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, Button, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, Input } from "reactstrap"
import { postSubmitForm, deleteSubmitForm } from '../../helpers/forms_helper'
import showToast from "../../helpers/show_toast"
import { DataGrid } from '@mui/x-data-grid'
import preloader from "../../helpers/preloader"
import { CustomToolbar } from "../../helpers/table_helpers"
import moment from 'moment'
import LetterHead from '../../components/Reports/LetterHead'
import pdf_logo from "../../assets/images/pdf_logo.png";
import exportFromJSON from 'export-from-json'
import AssignedTestsViewer from '../../components/Common/AssignedTestsViewer'
import AssignTestModal from '../Patients/AssignTestModal'
import Swal from 'sweetalert2'

const AssignedTests = () => {
    document.title = 'Tests'
    const componentRef = useRef()
    const [loading, setLoading] = useState(false)
    const [allData, setAllData] = useState([])
    const [modal, setModal] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const [fromDate, setFromDate] = useState(moment().subtract(1, 'months').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [sortModel, setSortModel] = useState([])
    const [assignModal, setAssignModal] = useState(false)

    useEffect(() => {
        // fetch_data()
    }, [])

    useEffect(() => {
        fetchTableData();
    }, [fromDate, toDate, selectedStatus]);


    const fetchTableData = async () => {
        // Validate date range (max 1 month)
        const start = moment(fromDate);
        const end = moment(toDate);

        if (end.isBefore(start)) {
            showToast("End date cannot be before start date", "warning");
            return;
        }

        if (end.diff(start, 'months', true) > 1) {
            showToast("Please select a date range within 1 month", "warning");
            return;
        }

        try {
            preloader(true);
            // Fetch Table Data
            const tableUrl = import.meta.env.VITE_APP_BASEURL + "reports/getBy_status";
            const tablePayload = {
                from_date: fromDate,
                to_date: toDate,
            };

            if (selectedStatus !== "All") {
                tablePayload.status = [selectedStatus];
            } else {
                tablePayload.status = ["In Review", "Assigned", "Approved", "Rejected", "Closed"];
            }

            const tableResponse = await postSubmitForm(tableUrl, tablePayload);
            if (tableResponse && tableResponse.status === 1) {
                const patients = tableResponse.data || [];
                setAllData(patients);
            }
        } catch (err) {
            console.log(err);
            showToast("Error fetching dashboard data", "error");
        } finally {
            preloader(false);
        }
    };


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

    const columns = [
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
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                let color = "secondary";
                if (params.value === "In Review") color = "info";
                if (params.value === "Approved") color = "success";
                if (params.value === "Rejected") color = "danger";
                if (params.value === "Closed") color = "dark";
                return (
                    <div className="d-flex flex-column align-items-center py-2" style={{ lineHeight: '1.2' }}>
                        <span className={`badge bg-${color}`}>
                            {params.value || 'Assigned'}
                        </span>
                        {params.row.remark && (
                            <small
                                className="text-danger mt-1 text-center"
                                style={{
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => Swal.fire({
                                    title: 'Advice/Remark',
                                    html: `<div style="text-align: left; white-space: pre-wrap;">${params.row.remark}</div>`,
                                    icon: 'info',
                                    confirmButtonText: 'Close',
                                    confirmButtonColor: '#3085d6'
                                })}
                            >
                                Advice
                            </small>
                        )}
                    </div>
                )
            }
        },
        {
            field: 'action',
            headerName: 'Action',
            felx: 0.5,
            renderCell: (params) => (
                <div className="d-flex gap-3 mt-1 justify-content-start align-items-center" style={{ fontSize: "20px" }}>
                    {(params.row.status || "Assigned") !== "Assigned" && (
                        <img
                            src={pdf_logo}
                            alt="PDF"
                            style={{ cursor: 'pointer', width: '22px', height: '22px' }}
                            onClick={() => openPrintPopup(params.row)}
                            title="View Report Preview"
                        />
                    )}
                    {params.row.pdf_url && (params.row.status || "Assigned") !== "Assigned" && (
                        <i className="bx bxs-file-pdf text-danger"
                            style={{ cursor: 'pointer' }}
                            onClick={() => window.open(params.row.pdf_url, '_blank')}
                            title="View Uploaded PDF"
                        ></i>
                    )}
                </div>
            )
        }
    ]

    const renderReport = () => {
        if (!selectedAssignment) return null;
        return <LetterHead data={selectedAssignment} />;
    }

    const handleExport = () => {
        const exportData = allData.map((item, index) => ({
            'S.No': index + 1,
            'Date': moment(item.createdAt).format('DD-MM-YYYY'),
            'Patient ID': item.patient_id?.registration_no || 'N/A',
            'Patient Name': item.patient_id?.wife?.name || item.patient_id?.name || 'N/A',
            'Husband Name': item.patient_id?.husband?.name || 'N/A',
            'Wife Tests': (item.wife_tests || []).map(t => t.test_code).join(', '),
            'Husband Tests': (item.husband_tests || []).map(t => t.test_code).join(', '),
            'Status': item.status || 'Pending'
        }))
        exportFromJSON({
            data: exportData,
            fileName: `All_Reports_${moment(fromDate).format('DD-MM-YYYY')}_to_${moment(toDate).format('DD-MM-YYYY')}`,
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
                                    <div className="d-flex justify-content-between align-items-center">
                                        <CardTitle className="mb-0">Test Requests & Status</CardTitle>
                                    </div>
                                    <Row>
                                        <Col lg={9} md={9} sm={9}>
                                            <div className="d-flex gap-2 flex-wrap align-items-center mt-2">
                                                <FormGroup className="mb-0 d-flex align-items-center gap-2">
                                                    <Label className="mb-0 text-nowrap">From</Label>
                                                    <Input
                                                        type="date"
                                                        bsSize="sm"
                                                        value={fromDate}
                                                        onChange={(e) => setFromDate(e.target.value)}
                                                        style={{ width: '130px' }}
                                                    />
                                                </FormGroup>
                                                <FormGroup className="mb-0 d-flex align-items-center gap-2">
                                                    <Label className="mb-0 text-nowrap">To</Label>
                                                    <Input
                                                        type="date"
                                                        bsSize="sm"
                                                        value={toDate}
                                                        min={fromDate}
                                                        onChange={(e) => setToDate(e.target.value)}
                                                        style={{ width: '130px' }}
                                                    />
                                                </FormGroup>
                                                <FormGroup className="mb-0 d-flex align-items-center gap-2">
                                                    <Label className="mb-0 text-nowrap">Status</Label>
                                                    <Input
                                                        type="select"
                                                        bsSize="sm"
                                                        value={selectedStatus}
                                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                                        style={{ width: '130px' }}
                                                    >
                                                        <option value="All">All Status</option>
                                                        <option value="Assigned">Assigned</option>
                                                        <option value="In Review">In Review</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Closed">Closed</option>
                                                    </Input>
                                                </FormGroup>

                                            </div>
                                        </Col>
                                        <Col lg={3} md={3} sm={3} className="d-flex justify-content-end align-items-start"
                                        >
                                            <Button
                                                color="primary"
                                                className="btn-rounded m-0"
                                                onClick={() => {
                                                    setAssignModal(true)
                                                }}
                                            >
                                                <i className="bx bx-list-check  me-1"></i>
                                                Assign Test
                                            </Button>
                                        </Col>
                                    </Row>

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
                                                toolbar: { exportdata: () => { handleExport() }, componentRef, title: "Reports List" },
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

            <AssignTestModal
                isOpen={assignModal}
                toggle={() => setAssignModal(!assignModal)}
                refreshData={fetchTableData}
            />
        </React.Fragment>
    )
}

export default AssignedTests
