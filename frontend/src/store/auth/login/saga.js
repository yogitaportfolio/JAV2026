import { call, put, takeEvery } from "redux-saga/effects";

// Login Redux States
import { CHANGE_PASSWORD, LOGIN_USER, LOGOUT_USER } from "./actionTypes";
import { loginSuccess, apiError, changePasswordSuccess } from "./actions";
import { postSubmitForm, postSubmitFormNoAuth } from "../../../helpers/forms_helper";
import showToast from "../../../helpers/show_toast";
import preloader from "../../../helpers/preloader";

//verify otp
function* login_user({ payload: { user, history } }) {
  try {
    let url = import.meta.env.VITE_APP_BASEURL + "adminusers/login";
    const response = yield call(postSubmitFormNoAuth, url, user);
    if (response.status === 1) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("authUser", JSON.stringify(response.data));
      localStorage.setItem("token_expiry", response.data.token_expiry);
      yield put(loginSuccess(response));
      history('/dashboard');
    }
    else {
      yield put(apiError(response.message));
      showToast(response.message, "error");
    }
  } catch (error) {
     showToast(error, "error");
    yield put(apiError(error));
  }
}
function* logoutUser({ payload: { history } }) {
  try {
    preloader(true)
    let url = import.meta.env.VITE_APP_BASEURL + "adminusers/logout";
    const token = localStorage.getItem("token");
    if (token) {
      yield call(postSubmitForm, url, {});
    }
  } catch (error) {
    console.log("Logout API failed", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("authUser");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("user");
    localStorage.removeItem("patient");
    localStorage.removeItem('sDate');
    localStorage.removeItem('eDate');
    history("/login");
    preloader(false)
  }
}

function* changePassword({ payload: { password_details, history } }) {
  try {
    let url = import.meta.env.VITE_APP_BASEURL + "adminusers/changepassword";

    const response = yield call(postSubmitForm, url, password_details);

    if (response.status === 1) {
      showToast("Password changed successfully.", "Success");
      yield put(changePasswordSuccess(response));
    } else {
      showToast(response.message, "Error");
      yield put(apiError(response.message));
    }
  } catch (error) {
    yield put(apiError(error));
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, login_user);
  yield takeEvery(LOGOUT_USER, logoutUser);
  yield takeEvery(CHANGE_PASSWORD, changePassword);
}

export default authSaga;
