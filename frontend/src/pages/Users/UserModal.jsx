import React, { useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { postSubmitForm, putSubmitForm } from '../../helpers/forms_helper'
import showToast from '../../helpers/show_toast'
import PropTypes from 'prop-types'

const UserModal = ({ isOpen, toggle, mode, user, refreshData }) => {
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        username: Yup.string().required('Username is required'),
        password: mode === 'create' 
            ? Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
            : Yup.string().min(6, 'Password must be at least 6 characters'),
        role: Yup.string()
    })

    const formik = useFormik({
        initialValues: {
            name: '',
            username: '',
            password: '',
            role: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
            const payload = {
                name: values.name,
                username: values.username
            }

            if (values.role) {
                payload.role = values.role
            }

                // Only include password if it's provided
                if (values.password) {
                    payload.pwd = values.password
                }

                let url = import.meta.env.VITE_APP_BASEURL
                let response

                if (mode === 'create') {
                    url += "adminusers/insert"
                    response = await postSubmitForm(url, payload)
                } else {
                    url += "adminusers/update"
                    payload.adminuser_id = user._id
                    response = await putSubmitForm(url, payload)
                }

                if (response && response.status === 1) {
                    showToast(response.message || `User ${mode === 'create' ? 'created' : 'updated'} successfully`, 'success')
                    resetForm()
                    toggle()
                    refreshData()
                } else {
                    showToast(response.error || `Failed to ${mode} user`, 'error')
                }
            } catch (err) {
                console.log(err)
                showToast(`Error ${mode === 'create' ? 'creating' : 'updating'} user`, 'error')
            } finally {
                setSubmitting(false)
            }
        }
    })

    // Reset form when modal opens/closes or mode changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && user) {
                formik.setValues({
                    name: user.name || '',
                    username: user.username || '',
                    password: '',
                    role: user.role || ''
                })
            } else {
                formik.resetForm()
            }
        }
    }, [isOpen, mode, user])

    const handleClose = () => {
        formik.resetForm()
        toggle()
    }

    const roleOptions = [
        { value: 'Counsellor', label: 'Counsellor' },
        { value: 'Hematology Lab Operator', label: 'Hematology Lab Operator' },
        { value: 'Andrology Lab Operator', label: 'Andrology Lab Operator' },
        { value: 'Reviewer', label: 'Reviewer' },
        { value: 'Receptionist', label: 'Receptionist' }
    ]

    return (
        <Modal isOpen={isOpen} toggle={handleClose} size="md">
            <ModalHeader toggle={handleClose}>
                {mode === 'create' ? 'Add New User' : 'Edit User'}
            </ModalHeader>
            <Form onSubmit={formik.handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label for="name">Name <span className="text-danger">*</span></Label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter full name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.name && formik.errors.name ? true : false}
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <FormFeedback>{formik.errors.name}</FormFeedback>
                        ) : null}
                    </FormGroup>

                    <FormGroup>
                        <Label for="username">Username <span className="text-danger">*</span></Label>
                        <Input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="Enter username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.username && formik.errors.username ? true : false}
                            // disabled={mode === 'edit'} // Disable username editing
                        />
                        {formik.touched.username && formik.errors.username ? (
                            <FormFeedback>{formik.errors.username}</FormFeedback>
                        ) : null}
                    </FormGroup>

                    <FormGroup hidden={mode==='edit'}>
                        <Label for="password">
                            Password {mode === 'create' && <span className="text-danger">*</span>}
                            {mode === 'edit' && <small className="text-muted"> (Leave blank to keep current password)</small>}
                        </Label>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.password && formik.errors.password ? true : false}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <FormFeedback>{formik.errors.password}</FormFeedback>
                        ) : null}
                    </FormGroup>

                    <FormGroup>
                        <Label for="role">Role</Label>
                        <Input
                            type="select"
                            name="role"
                            id="role"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.role && formik.errors.role ? true : false}
                        >
                            <option value="">Select Role</option>
                            {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Input>
                        {formik.touched.role && formik.errors.role ? (
                            <FormFeedback>{formik.errors.role}</FormFeedback>
                        ) : null}
                    </FormGroup>
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
                        {formik.isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Update User')}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

UserModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['create', 'edit']).isRequired,
    user: PropTypes.object,
    refreshData: PropTypes.func.isRequired
}

export default UserModal
