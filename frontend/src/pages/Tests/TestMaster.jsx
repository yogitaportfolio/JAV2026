import { withTranslation } from "react-i18next"
import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, Spinner, Button } from "reactstrap"
import PropTypes from "prop-types"
import React, { useEffect, useState, useRef } from 'react'
import { postSubmitForm, putSubmitForm, deleteSubmitForm, getSubmitForm } from '../../helpers/forms_helper'
import showToast from "../../helpers/show_toast"
import { DataGrid } from '@mui/x-data-grid'
import Swal from 'sweetalert2'
import exportFromJSON from 'export-from-json'
import TestModal from './TestModal'
import preloader from "../../helpers/preloader"
import { CustomToolbar } from "../../helpers/table_helpers"
import { useDispatch } from 'react-redux'
import { fetchTests } from '../../store/tests/actions'

const TestMaster = (props) => {
    document.title = 'Test Master'
    const componentRef = useRef()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [allData, setAllData] = useState([])
    const [testModal, setTestModal] = useState(false)
    const [selectedTest, setSelectedTest] = useState(null)
    const [modalMode, setModalMode] = useState('create')
    const [sortModel, setSortModel] = useState([])

    useEffect(() => {
        fetch_data()
    }, [])

    const fetch_data = async () => {
        try {
            preloader(true)
            let url = import.meta.env.VITE_APP_BASEURL + "tests/getall"
            let response = await getSubmitForm(url)
            if (response && response.status === 1) {
                setAllData(response.data)
                dispatch(fetchTests()) // Update Redux store
            } else {
                showToast(response.message || "Failed to fetch tests", "error")
            }
        } catch (err) {
            console.log(err)
            showToast("Error fetching tests", "error")
        } finally {
            preloader(false)
        }
    }

    const handleAddTest = () => {
        setModalMode('create')
        setSelectedTest(null)
        setTestModal(true)
    }

    const handleEditTest = (test) => {
        setModalMode('edit')
        setSelectedTest(test)
        setTestModal(true)
    }

    const handleDeleteTest = async (testId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this test!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        })

        if (result.isConfirmed) {
            try {
                const payload = { test_id: testId }
                let url = import.meta.env.VITE_APP_BASEURL + "tests/delete"
                const response = await deleteSubmitForm(url, payload)
                if (response && response.status === 1) {
                    fetch_data()
                    showToast(response.message || 'Procedure deleted successfully', 'success')
                } else {
                    showToast(response.error || 'Failed to delete procedure', 'error')
                }
            } catch (err) {
                console.log(err)
                showToast('Error deleting procedure', 'error')
            }
        }
    }

    const handleExport = () => {
        if (!allData || allData.length === 0) {
            showToast('No data to export', 'warning')
            return
        }

        const exportData = allData.map((test, index) => ({
            'S.No': index + 1,
            'Test Code': test.test_code || 'N/A',
            'Test Name': test.test_name || test.name,
            'Category': test.category || 'N/A',
            'Amount': test.amount ?? 'N/A',
            // 'Unit': test.unit?.unit_name || test.unit?.name || 'N/A',
            'Description': test.description || 'N/A',
        }))

        exportFromJSON({
            data: exportData,
            fileName: `tests_${new Date().toISOString().split('T')[0]}`,
            exportType: exportFromJSON.types.xls
        })
        showToast('Data exported successfully', 'success')
    }

    const columns = [
        {
            field: 'sn', 
            headerName: '#', 
            width: 70,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                const rowIds = params.api.getSortedRowIds()
                return rowIds.indexOf(params.id) + 1
            }
        },
        // { 
        //     field: 'test_code', 
        //     headerName: 'Test Code', 
        //     width: 120, 
        //     filterable: true,
        // },
        { 
            field: 'procedure_name', 
            headerName: 'Procedure Name', 
            flex: 1, 
            filterable: true, 
            minWidth: 180,
            valueGetter: (value,row) =>{
            if (!value) {
                    return value;
                }
                return value || row?.test_name || 'N/A' 
            }
        },
        // { 
        //     field: 'sample_type', 
        //     headerName: 'Sample Type', 
        //     flex: 1, 
        //     filterable: true, 
        //     minWidth: 180,
        //     valueGetter: (value,row) =>{
        //     if (!value) {
        //             return value;
        //         }
        //         return value || row?.sample_type || 'N/A' 
        //     }
        // },
        // { 
        //     field: 'category', 
        //     headerName: 'Category', 
        //     flex: 1, 
        //     filterable: true,
        //     minWidth: 130
        // },
        { 
            field: 'amount', 
            headerName: 'Amount', 
            flex: 1, 
            filterable: true,
            minWidth: 130,
            valueGetter: (value, row) => {
                if (value !== undefined && value !== null && value !== '') return value
                return row?.amount ?? 'N/A'
            }
        },
        // { 
        //     field: 'unit', 
        //     headerName: 'Unit', 
        //     width: 120, 
        //     filterable: false,
        //     valueGetter: (params,value) =>{
        //     if (!value) {
        //             return value;
        //         }
        //         return params.name || params.name || 'N/A'
        //     }
        // },
        {
            field: 'action',
            headerName: 'Action',
            minWidth: 120,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                return (
                    <div style={{ fontSize: "20px" }} className="d-flex justify-content-around align-items-center">
                        <div>
                            <i className="bx bxs-edit text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleEditTest(params.row)}
                                title="Edit Test"
                            ></i>
                        </div>
                        {/* <div>
                            <i className="bx bxs-trash text-danger"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDeleteTest(params.row._id)}
                                title="Delete Test"
                            ></i>
                        </div> */}
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
                                            <CardTitle>{props.t("Procedure Master")}</CardTitle>
                                            <CardSubtitle>
                                                {props.t("Manage procedures")}
                                            </CardSubtitle>
                                        </Col>
                                        <Col md={6} className="text-end">
                                            <Button 
                                                color="success" 
                                                className="btn-rounded"
                                                onClick={handleAddTest}
                                            >
                                                <i className="bx bx-plus-circle me-1"></i>
                                                Add 
                                            </Button>
                                        </Col>
                                    </Row>
                                    <hr />
                                    {loading ? (
                                        <Row>
                                            <Col md={12} className="text-center py-5">
                                                <Spinner color="primary" />
                                                <p className="mt-3 text-muted">Loading tests...</p>
                                            </Col>
                                        </Row>
                                    ) : allData && allData.length > 0 ? (
                                        <Row className="mt-2">
                                            <Col md={12}>
                                                <div ref={componentRef}>
                                                    <DataGrid
                                                        getRowId={(row) => row._id}
                                                        rows={allData}
                                                        columns={columns}
                                                        loading={false}
                                                        density="compact"
                                                        initialState={{
                                                            pagination: {
                                                                paginationModel: { pageSize: 10 }
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
                                                            toolbar: { exportdata: handleExport, componentRef, title: "Tests" },
                                                        }}
                                                        autoHeight
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row>
                                            <Col md={12} className="text-center py-5">
                                                <h4>No procedures found</h4>
                                                <p className="text-muted">Click "Add Procedure" to create your first procedure</p>
                                            </Col>
                                        </Row>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Test Modal */}
            <TestModal
                isOpen={testModal}
                toggle={() => setTestModal(!testModal)}
                mode={modalMode}
                test={selectedTest}
                refreshData={fetch_data}
            />
        </>
    )
}

TestMaster.propTypes = {
    t: PropTypes.any,
}

export default withTranslation()(TestMaster)
