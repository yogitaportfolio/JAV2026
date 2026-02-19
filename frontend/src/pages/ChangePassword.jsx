import React, { useEffect, useRef, useState } from 'react'
import { Container, Row, Card, Col, CardBody, Button, CardTitle, Label, Input, FormGroup, FormFeedback } from 'reactstrap'
import { postSubmitForm } from '../helpers/forms_helper';
import showToast from '../helpers/show_toast';

const ChangePassword = () => {
    const formRef = useRef();
    const username = localStorage.getItem('username');

    const [formData, setFormData] = useState({
        oldpwd: "",
        newpwd: "",
    });
    useEffect(() => {
        document.title = 'Change Password | Javitri Admin';
    }, [])
    const handleonchange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handlesubmit = async (e) => {
        e.preventDefault();
        if (e.target.checkValidity()) {
            try {
                const payload = {
                    username: username,
                    oldpwd: formData.oldpwd,
                    newpwd: formData.newpwd,
                }
                let url = import.meta.env.VITE_APP_BASEURL + "adminusers/changepassword"
                let response = await postSubmitForm(url, payload);
                console.log(response)
                if (response && response.status === 1) {
                    showToast(response.message, "success");
                    formRef.current.reset()

                    setFormData({
                        oldpwd: "",
                        newpwd: "",
                    })
                } else {
                    showToast('Something went wrong!', "error")
                }

            } catch (err) {
                console.log(err)
            }
        } else {
            e.target.classList.add('was-validated');
        }
    }
    return (
        <>
            <div className="page-content">
                <Container fluid>
                    <Row>
                    <Col md={3}></Col>
                        <Col md={6} className='pt-5'>
                            <Card>
                                <CardBody>
                                    <Row>
                                        <Col md={12}>
                                            <CardTitle>Change Password</CardTitle>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <div className="add_content_form py-4 px-2">
                                        <form onSubmit={handlesubmit} noValidate ref={formRef}>
                                            <Row>
                                                <Col xl={12}>
                                                    <FormGroup>
                                                        <Label htmlFor="oldpwd">Old Password <span className='text-danger'>*</span></Label>
                                                        <Input
                                                            name="oldpwd"
                                                            type="text"
                                                            onChange={handleonchange}
                                                            placeholder="Enter Old Password"
                                                            required
                                                        />
                                                        <FormFeedback>Please Enter Old Password</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col xl={12}>
                                                    <FormGroup>
                                                        <Label htmlFor="newpwd">New Password <span className='text-danger'>*</span></Label>
                                                        <Input
                                                            name="newpwd"
                                                            type="text"
                                                            onChange={handleonchange}
                                                            placeholder="Enter New Password" required
                                                        />
                                                        <FormFeedback>Please Enter New Password</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={12} className='text-center mt-4'>
                                                    <Button color="primary" type='submit' >
                                                        Change
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </form>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default ChangePassword
