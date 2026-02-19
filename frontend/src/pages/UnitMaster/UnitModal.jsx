import React, { useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { postSubmitForm, putSubmitForm } from '../../helpers/forms_helper'
import showToast from '../../helpers/show_toast'
import PropTypes from 'prop-types'

const UnitModal = ({ isOpen, toggle, mode, unit, refreshData }) => {
    const validationSchema = Yup.object({
        unit_name: Yup.string().required('Unit name is required'),
        symbol: Yup.string().required('Symbol is required'),
        // description: Yup.string()
    })

    const formik = useFormik({
        initialValues: {
            unit_name: '',
            symbol: '',
            // description: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const payload = {
                    name: values.unit_name,
                    symbol: values.symbol,
                    // description: values.description
                }

                let url = import.meta.env.VITE_APP_BASEURL
                let response

                if (mode === 'create') {
                    url += "units/insert"
                    response = await postSubmitForm(url, payload)
                } else {
                    url += "units/update"
                    payload.unit_id = unit._id
                    response = await putSubmitForm(url, payload)
                }

                if (response && response.status === 1) {
                    showToast(response.message || `Unit ${mode === 'create' ? 'created' : 'updated'} successfully`, 'success')
                    resetForm()
                    toggle()
                    refreshData()
                } else {
                    showToast(response.error || `Failed to ${mode} unit`, 'error')
                }
            } catch (err) {
                console.log(err)
                showToast(`Error ${mode === 'create' ? 'creating' : 'updating'} unit`, 'error')
            } finally {
                setSubmitting(false)
            }
        }
    })

    // Reset form when modal opens/closes or mode changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && unit) {
                formik.setValues({
                    unit_name: unit.unit_name || unit.name || '',
                    symbol: unit.symbol || '',
                    // description: unit.description || ''
                })
            } else {
                formik.resetForm()
            }
        }
    }, [isOpen, mode, unit])

    const handleClose = () => {
        formik.resetForm()
        toggle()
    }

    return (
        <Modal isOpen={isOpen} toggle={handleClose} size="md">
            <ModalHeader toggle={handleClose}>
                {mode === 'create' ? 'Add New Unit' : 'Edit Unit'}
            </ModalHeader>
            <Form onSubmit={formik.handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label for="unit_name">Unit Name <span className="text-danger">*</span></Label>
                        <Input
                            type="text"
                            name="unit_name"
                            id="unit_name"
                            placeholder="Enter unit name (e.g., Milliliter, Gram)"
                            value={formik.values.unit_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.unit_name && formik.errors.unit_name ? true : false}
                        />
                        {formik.touched.unit_name && formik.errors.unit_name ? (
                            <FormFeedback>{formik.errors.unit_name}</FormFeedback>
                        ) : null}
                    </FormGroup>

                    <FormGroup>
                        <Label for="symbol">Symbol <span className="text-danger">*</span></Label>
                        <Input
                            type="text"
                            name="symbol"
                            id="symbol"
                            placeholder="Enter symbol (e.g., mL, g)"
                            value={formik.values.symbol}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.symbol && formik.errors.symbol ? true : false}
                        />
                        {formik.touched.symbol && formik.errors.symbol ? (
                            <FormFeedback>{formik.errors.symbol}</FormFeedback>
                        ) : null}
                    </FormGroup>

                    {/* <FormGroup>
                        <Label for="description">Description</Label>
                        <Input
                            type="textarea"
                            name="description"
                            id="description"
                            placeholder="Enter description (optional)"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            rows="3"
                        />
                    </FormGroup> */}
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
                        {formik.isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Unit' : 'Update Unit')}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

UnitModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['create', 'edit']).isRequired,
    unit: PropTypes.object,
    refreshData: PropTypes.func.isRequired
}

export default UnitModal
