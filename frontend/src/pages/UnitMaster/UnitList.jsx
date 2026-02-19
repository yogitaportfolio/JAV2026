import { withTranslation } from "react-i18next"
import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, Spinner, Button } from "reactstrap"
import PropTypes from "prop-types"
import React, { useEffect, useState, useRef } from 'react'
import { postSubmitForm, putSubmitForm, deleteSubmitForm, getSubmitForm } from '../../helpers/forms_helper'
import showToast from "../../helpers/show_toast"
import { DataGrid } from '@mui/x-data-grid'
import Swal from 'sweetalert2'
import exportFromJSON from 'export-from-json'
import UnitModal from './UnitModal'
import preloader from "../../helpers/preloader"
import { CustomToolbar } from "../../helpers/table_helpers"
import { useDispatch } from 'react-redux'
import { fetchUnits } from '../../store/units/actions'

const UnitList = (props) => {
    document.title = 'Unit Master'
    const componentRef = useRef()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [allData, setAllData] = useState([])
    const [unitModal, setUnitModal] = useState(false)
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [modalMode, setModalMode] = useState('create')
    const [sortModel, setSortModel] = useState([])
    useEffect(() => {
        // dispatch(fetchUnits())
        fetch_data()
    }, [])

    const fetch_data = async () => {
        try {
            preloader(true)
            let url = import.meta.env.VITE_APP_BASEURL + "units/getall"
            let response = await getSubmitForm(url)
            if (response && response.status === 1) {
                setAllData(response.data)
                dispatch(fetchUnits())
            } else {
                showToast(response.message || "Failed to fetch units", "error")
            }
        } catch (err) {
            console.log(err)
            showToast("Error fetching units", "error")
        } finally {
            preloader(false)
        }
    }

    const handleAddUnit = () => {
        setModalMode('create')
        setSelectedUnit(null)
        setUnitModal(true)
    }

    const handleEditUnit = (unit) => {
        setModalMode('edit')
        setSelectedUnit(unit)
        setUnitModal(true)
    }

    const handleDeleteUnit = async (unitId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this unit!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        })

        if (result.isConfirmed) {
            try {
                const payload = { unit_id: unitId }
                let url = import.meta.env.VITE_APP_BASEURL + "units/delete"
                const response = await deleteSubmitForm(url, payload)
                if (response && response.status === 1) {
                    fetch_data()
                    showToast(response.message || 'Unit deleted successfully', 'success')
                } else {
                    showToast(response.error || 'Failed to delete unit', 'error')
                }
            } catch (err) {
                console.log(err)
                showToast('Error deleting unit', 'error')
            }
        }
    }

    const handleExport = () => {
        if (!allData || allData.length === 0) {
            showToast('No data to export', 'warning')
            return
        }

        const exportData = allData.map((unit, index) => ({
            'S.No': index + 1,
            'Unit Name': unit.name || unit.name,
            'Symbol': unit.symbol,
            // 'Description': unit.description || 'N/A',
        }))

        exportFromJSON({
            data: exportData,
            fileName: `All Units`,
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
        { 
            field: 'name', 
            headerName: 'Unit Name', 
            flex: 1, 
            filterable: true, 
            minWidth: 150,
        },
        { 
            field: 'symbol', 
            headerName: 'Symbol', 
            flex: 1, 
            filterable: true,
            minWidth: 120
        },
        // { 
        //     field: 'description', 
        //     headerName: 'Description', 
        //     flex: 2, 
        //     minWidth: 200,
        //     filterable: false 
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
                                onClick={() => handleEditUnit(params.row)}
                                title="Edit Unit"
                            ></i>
                        </div>
                        <div>
                            <i className="bx bxs-trash text-danger"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDeleteUnit(params.row._id)}
                                title="Delete Unit"
                            ></i>
                        </div>
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
                                            <CardTitle>{props.t("Unit Master")}</CardTitle>
                                            <CardSubtitle>
                                                {props.t("Manage measurement units")}
                                            </CardSubtitle>
                                        </Col>
                                        <Col md={6} className="text-end">
                                            <Button 
                                                color="success" 
                                                className="btn-rounded"
                                                onClick={handleAddUnit}
                                            >
                                                <i className="bx bx-plus-circle me-1"></i>
                                                Add Unit
                                            </Button>
                                        </Col>
                                    </Row>
                                    <hr />
                                    {loading ? (
                                        <Row>
                                            <Col md={12} className="text-center py-5">
                                                <Spinner color="primary" />
                                                <p className="mt-3 text-muted">Loading units...</p>
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
                                                            toolbar: { exportdata: handleExport, componentRef, title: "Units" },
                                                        }}
                                                        autoHeight
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row>
                                            <Col md={12} className="text-center py-5">
                                                <h4>No units found</h4>
                                                <p className="text-muted">Click "Add Unit" to create your first unit</p>
                                            </Col>
                                        </Row>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Unit Modal */}
            <UnitModal
                isOpen={unitModal}
                toggle={() => setUnitModal(!unitModal)}
                mode={modalMode}
                unit={selectedUnit}
                refreshData={fetch_data}
            />
        </>
    )
}

UnitList.propTypes = {
    t: PropTypes.any,
}

export default withTranslation()(UnitList)
