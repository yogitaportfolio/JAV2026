import React from "react";
import PropTypes from "prop-types";
import withRouter from "../../components/Common/withRouter";
//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { loginUser } from "../../store/actions";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { Row, Col, CardBody, Card, Spinner, Container, InputGroupText, Form, Input, FormFeedback, Label, InputGroup, } from "reactstrap";
// actions
import icon from "../../assets/images/javitri_logo.png"
import "./LoginCss.css";

const Login = (props) => {
  document.title = "Login | Javitri Hospital";
  const dispatch = useDispatch();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: "",
      pwd: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Please Enter Username"),
      pwd: Yup.string().required("Please Enter Password"),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values, props.router.navigate))
    },
  });

  const LoginProperties = createSelector(
    (state) => state.Login,
    (login) => ({
      error: login.error,
      loading: login.loading,
    })
  );

  const { error, loading } = useSelector(LoginProperties);

  return (
    <div className="account-pages">
      <div className="login-card-container">
        <Card>
          <div className="login-header">
            <img src={icon} alt="Javitri Hospital" />
            <h2>Welcome</h2>
            <p>Please login to your account</p>
          </div>

          <Form
            className="login_form"
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          >
            <div className="mb-4">
              <Label className="form-label">Username</Label>
              <InputGroup>
                <InputGroupText>
                  <i className="fa fa-user"></i>
                </InputGroupText>
                <Input
                  name="username"
                  autoComplete="off"
                  className="form-control"
                  placeholder="Enter your username"
                  type="text"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.username || ""}
                  invalid={
                    validation.touched.username && validation.errors.username
                      ? true
                      : false
                  }
                />
              </InputGroup>
              {validation.touched.username && validation.errors.username ? (
                <small className="error">
                  {validation.errors.username}
                </small>
              ) : null}
            </div>

            <div className="mb-4">
              <Label className="form-label">Password</Label>
              <InputGroup>
                <InputGroupText>
                  <i className="fa fa-key"></i>
                </InputGroupText>
                <Input
                  name="pwd"
                  autoComplete="off"
                  className="form-control"
                  placeholder="Enter your password"
                  type="password"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.pwd || ""}
                  invalid={
                    validation.touched.pwd && validation.errors.pwd
                      ? true
                      : false
                  }
                />
              </InputGroup>
              {validation.touched.pwd && validation.errors.pwd ? (
                <small className="error">
                  {validation.errors.pwd}
                </small>
              ) : null}
            </div>

            <div className="d-grid mt-4">
              <button
                className="btn BGN_COLOR btn-primary btn-block"
                type="submit"
                disabled={loading}
              >
                {loading ? <Spinner size={'sm'} /> : (
                  <>Login <i className="mdi mdi-login ms-1"></i></>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 text-center">
                <small className="text-danger">{error}</small>
              </div>
            )}
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default withRouter(Login);

Login.propTypes = {
  history: PropTypes.object,
};