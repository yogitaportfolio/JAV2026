import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { postSubmitForm } from '../../helpers/forms_helper'
import showToast from '../../helpers/show_toast'
import PropTypes from 'prop-types'

const ResetPasswordModal = ({ isOpen, toggle, user, refreshData }) => {
    const validationSchema = Yup.object({
        new_password: Yup.string()
            .required('New password is required')
            .min(6, 'Password must be at least 6 characters'),
        confirm_password: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
    })

    const formik = useFormik({
        initialValues: {
            new_password: '',
            confirm_password: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const payload = {
                    adminuser_id: user?._id,
                    newpwd: values.new_password
                }

                let url = import.meta.env.VITE_APP_BASEURL + "adminusers/resetpassword"
                const response = await postSubmitForm(url, payload)

                if (response && response.status === 1) {
                    showToast(response.message || 'Password reset successfully', 'success')
                    resetForm()
                    toggle()
                    refreshData()
                } else {
                    showToast(response.error || 'Failed to reset password', 'error')
                }
            } catch (err) {
                console.log(err)
                showToast('Error resetting password', 'error')
            } finally {
                setSubmitting(false)
            }
        }
    })

    const handleClose = () => {
        formik.resetForm()
        toggle()
    }

    return (
        <Modal isOpen={isOpen} toggle={handleClose} size="md">
            <ModalHeader toggle={handleClose}>
                Reset Password - {user?.name}
            </ModalHeader>
            <Form onSubmit={formik.handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label for="new_password">New Password <span className="text-danger">*</span></Label>
                        <Input
                            type="password"
                            name="new_password"
                            id="new_password"
                            placeholder="Enter new password"
                            value={formik.values.new_password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.new_password && formik.errors.new_password ? true : false}
                        />
                        {formik.touched.new_password && formik.errors.new_password ? (
                            <FormFeedback>{formik.errors.new_password}</FormFeedback>
                        ) : null}
                    </FormGroup>

                    <FormGroup>
                        <Label for="confirm_password">Confirm Password <span className="text-danger">*</span></Label>
                        <Input
                            type="password"
                            name="confirm_password"
                            id="confirm_password"
                            placeholder="Confirm new password"
                            value={formik.values.confirm_password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.confirm_password && formik.errors.confirm_password ? true : false}
                        />
                        {formik.touched.confirm_password && formik.errors.confirm_password ? (
                            <FormFeedback>{formik.errors.confirm_password}</FormFeedback>
                        ) : null}
                    </FormGroup>

                    <div className="alert alert-info">
                        <i className="bx bx-info-circle me-2"></i>
                        Password must be at least 6 characters long
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        color="warning" 
                        type="submit" 
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

ResetPasswordModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    user: PropTypes.object,
    refreshData: PropTypes.func.isRequired
}

export default ResetPasswordModal
