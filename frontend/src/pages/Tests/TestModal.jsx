import React, { useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback, Row, Col } from 'reactstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { postSubmitForm, putSubmitForm } from '../../helpers/forms_helper'
import showToast from '../../helpers/show_toast'
import PropTypes from 'prop-types'

const TestModal = ({ isOpen, toggle, mode, test, refreshData }) => {
    const validationSchema = Yup.object({
        procedure_name: Yup.string().required('Procedure name is required'),
        amount: Yup.number()
            .typeError('Amount must be a number')
            .required('Amount is required')
    })

    const formik = useFormik({
        initialValues: {
            procedure_name: '',
            amount: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const payload = {
                    procedure_name: values.procedure_name,
                    test_name: values.procedure_name,
                    amount: Number(values.amount)
                }

                let url = import.meta.env.VITE_APP_BASEURL
                let response

                if (mode === 'create') {
                    url += "tests/insert"
                    response = await postSubmitForm(url, payload)
                } else {
                    url += "tests/update"
                    payload.test_id = test._id
                    response = await putSubmitForm(url, payload)
                }

                if (response && response.status === 1) {
                    showToast(response.message || `Test ${mode === 'create' ? 'created' : 'updated'} successfully`, 'success')
                    resetForm()
                    toggle()
                    refreshData()
                } else {
                    showToast(response.error || `Failed to ${mode} test`, 'error')
                }
            } catch (err) {
                console.log(err)
                showToast(`Error ${mode === 'create' ? 'creating' : 'updating'} test`, 'error')
            } finally {
                setSubmitting(false)
            }
        }
    })

    // Reset form when modal opens/closes or mode changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && test) {
                formik.setValues({
                    procedure_name: test.procedure_name || test.test_name || test.name || '',
                    amount: test.amount ?? ''
                })
            } else {
                formik.resetForm()
            }
        }
    }, [isOpen, mode, test])

    const handleClose = () => {
        formik.resetForm()
        toggle()
    }

    return (
        <Modal isOpen={isOpen} toggle={handleClose} size="lg">
            <ModalHeader toggle={handleClose}>
                {mode === 'create' ? 'Add Procedure' : 'Edit Procedure'}
            </ModalHeader>
            <Form onSubmit={formik.handleSubmit}>
                <ModalBody>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="procedure_name">Procedure Name <span className="text-danger">*</span></Label>
                                <Input
                                    type="text"
                                    name="procedure_name"
                                    id="procedure_name"
                                    placeholder="Enter procedure name"
                                    value={formik.values.procedure_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    invalid={formik.touched.procedure_name && formik.errors.procedure_name ? true : false}
                                />
                                {formik.touched.procedure_name && formik.errors.procedure_name ? (
                                    <FormFeedback>{formik.errors.procedure_name}</FormFeedback>
                                ) : null}
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="amount">Amount <span className="text-danger">*</span></Label>
                                <Input
                                    type="number"
                                    name="amount"
                                    id="amount"
                                    placeholder="Enter amount"
                                    value={formik.values.amount}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    invalid={formik.touched.amount && formik.errors.amount ? true : false}
                                />
                                {formik.touched.amount && formik.errors.amount ? (
                                    <FormFeedback>{formik.errors.amount}</FormFeedback>
                                ) : null}
                            </FormGroup>
                        </Col>
                    </Row>
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
                        {formik.isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Procedure' : 'Update Procedure')}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

TestModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['create', 'edit']).isRequired,
    test: PropTypes.object,
    refreshData: PropTypes.func.isRequired
}

export default TestModal
