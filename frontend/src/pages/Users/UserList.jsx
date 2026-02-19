import { withTranslation } from "react-i18next"
import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, Spinner, Button, Badge } from "reactstrap"
import PropTypes from "prop-types"
import React, { useEffect, useState } from 'react'
import { postSubmitForm } from '../../helpers/forms_helper'
import showToast from "../../helpers/show_toast"
import { DataGrid } from '@mui/x-data-grid'
import exportFromJSON from 'export-from-json'
import UserModal from './UserModal'
import ResetPasswordModal from './ResetPasswordModal'
import { Switch } from "@mui/material"
import preloader  from "../../helpers/preloader"
import { useRef } from "react"
import { CustomToolbar } from "../../helpers/table_helpers"
import moment from "moment"

const UserList = (props) => {
    document.title = 'User Management'
    const componentRef = useRef();
    const [loading, setLoading] = useState(false)
    const [allData, setAllData] = useState([])
    const [userModal, setUserModal] = useState(false)
    const [sortModel, setSortModel] = useState([]);
    const [resetPasswordModal, setResetPasswordModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'

    useEffect(() => {
        fetch_data()
    }, [])

    const fetch_data = async () => {
        try {
            setLoading(true)
            let url = import.meta.env.VITE_APP_BASEURL + "adminusers/getall"
            let response = await postSubmitForm(url, {})
            if (response && response.status === 1) {
                setAllData(response.data)
                setLoading(false)
            } else {
                showToast(response.error || "Failed to fetch users", "error")
                setLoading(false)
            }
        } catch (err) {
            console.log(err)
            setLoading(false)
            showToast("Error fetching users", "error")
        }
    }

    const handleAddUser = () => {
        setModalMode('create')
        setSelectedUser(null)
        setUserModal(true)
    }

    const handleEditUser = (user) => {
        setModalMode('edit')
        setSelectedUser(user)
        setUserModal(true)
    }

    const handleResetPassword = (user) => {
        setSelectedUser(user)
        setResetPasswordModal(true)
    }

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            preloader(true)
            const payload = { 
                adminuser_id: userId,
                is_active: !currentStatus 
            }
            let url = import.meta.env.VITE_APP_BASEURL + "adminusers/activate_deactivate"
            const response = await postSubmitForm(url, payload)
            if (response && response.status === 1) {
                fetch_data()
                showToast(response.message || 'Status updated successfully', 'success')
            } else {
                showToast(response.error || 'Failed to update status', 'error')
            }
        } catch (err) {
            console.log(err)
            showToast('Error updating status', 'error')
        } finally {
           preloader(false)
        }
    }

    const handleExport = () => {
        if (!allData || allData.length === 0) {
            showToast('No data to export', 'warning')
            return
        }

        const exportData = allData.map((user, index) => ({
            'S.No': index + 1,
            'Name': user.name,
            'Username': user.username,
            'Role': user.role,
            'Status': user.is_active ? 'Active' : 'Inactive',
            'Created At': user.createdAt ? moment(user.createdAt).format('DD-MM-YYYY') : 'N/A'
        }))

        exportFromJSON({
            data: exportData,
            fileName: `users_${new Date().toISOString().split('T')[0]}`,
            exportType: exportFromJSON.types.xls
        })
        showToast('Data exported successfully', 'success')
    }

    const columns = [
        {
      field: 'sn', headerName: '#', width: 1,
         sortable:false,filterable: false,disableColumnMenu: true,
      renderCell: (params) => {
        const rowIds = params.api.getSortedRowIds();
        return rowIds.indexOf(params.id) + 1;
      }
    },
        { 
            field: 'name', 
            headerName: 'Name', 
            flex: 1, 
            filterable: true, 
            minWidth: 150 
        },
        { 
            field: 'username', 
            headerName: 'Username', 
            flex: 1, 
            filterable: true, 
            minWidth: 150 
        },
        { 
            field: 'role', 
            headerName: 'Role', 
            flex: 1, 
            filterable: true, 
            minWidth: 130 
        },
        {
            field: 'is_active',
            headerName: 'Status',
            minWidth: 120,
            filterable: true,
           renderCell: (params) => {
        return (

          <Badge color={`${params.row.is_active ? `success` : `danger`}`} className="mt-1" >
            {params.row.is_active ? 'Active' : 'Inactive'}
          </Badge>
        )
      }
        },
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
 <i className="fas fa-key text-dark fs-5 me-2" title="Change Password"
               onClick={() => handleResetPassword(params.row)}
              style={{ cursor: 'pointer' }}></i>
            </div>

            <div>
              <i className="bx bxs-edit text-primary"
                style={{ cursor: 'pointer' }}
               onClick={() => handleEditUser(params.row)}
              ></i>
            </div>
            <div>
              <Switch
                checked={params.row.is_active}
                            onChange={() => handleToggleStatus(params.row._id, params.row.is_active)}
                color="primary"
                size="small"
              />
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
                                            <CardTitle>{props.t("User Management")}</CardTitle>
                                            <CardSubtitle>
                                                {props.t("Manage system users and their roles")}
                                            </CardSubtitle>
                                        </Col>
                                        <Col md={6} className="text-end">
                                        <Button 
                                          color="success" 
                                          className="btn-rounded"
                                          onClick={handleAddUser}
                                        >
                                          <i className="bx bx-plus-circle me-1"></i>
                                          Add User
                                        </Button>
                                                {/* {allData && allData.length > 0 && (
                                                    <>
                                                        <Button 
                                                            color="warning" 
                                                            className="me-2"
                                                            onClick={handleExport}
                                                        >
                                                            <i className="bx bx-download me-1"></i>
                                                            Export
                                                        </Button>
                                                        <Button 
                                                            color="dark"
                                                            onClick={handlePrint}
                                                        >
                                                            <i className="bx bx-printer me-1"></i>
                                                            Print
                                                        </Button>
                                                    </>
                                                )} */}
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
                                         <div  ref={componentRef}>
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
                                                    setSortModel(newSortModel);
                                                }}
                                                pageSizeOptions={[10, 25, 50, 100]}
                                                disableSelectionOnClick
                                                disableRowSelectionOnClick
                                                checkboxSelection={false}
                                                slots={{ toolbar: CustomToolbar }}
                                                slotProps={{
                                                toolbar: { exportdata: handleExport, componentRef ,title:"Users"},
                                                }}
                                                autoHeight
                                            />
                                        </div>
                                            </Col>
                                        </Row>

                                    ) : (
                                        <Row>
                                            <Col md={12} className="text-center py-5">
                                                <h4>No users found</h4>
                                                <p className="text-muted">Click "Add User" to create your first user</p>
                                            </Col>
                                        </Row>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* User Modal */}
            <UserModal
                isOpen={userModal}
                toggle={() => setUserModal(!userModal)}
                mode={modalMode}
                user={selectedUser}
                refreshData={fetch_data}
            />

            {/* Reset Password Modal */}
            <ResetPasswordModal
                isOpen={resetPasswordModal}
                toggle={() => setResetPasswordModal(!resetPasswordModal)}
                user={selectedUser}
                refreshData={fetch_data}
            />
        </>
    )
}

UserList.propTypes = {
    t: PropTypes.any,
}

export default withTranslation()(UserList)
