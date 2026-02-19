import {
  LOGIN_USER, VERIFY_OTP,
  LOGIN_SUCCESS,
  LOGOUT_USER,
  LOGOUT_USER_SUCCESS,
  API_ERROR,
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_SUCCESS,
} from "./actionTypes"

export const loginUser = (user, history) => {
  return {
    type: LOGIN_USER,
    payload: { user, history },
  }
}
export const verify_Otp = (user, history) => {
  return {
    type: VERIFY_OTP,
    payload: { user, history },
  }
}
export const loginSuccess = user => {
  return {
    type: LOGIN_SUCCESS,
    payload: user,
  }
}

export const logoutUser = history => {
  return {
    type: LOGOUT_USER,
    payload: { history },
  }
}

export const logoutUserSuccess = () => {
  return {
    type: LOGOUT_USER_SUCCESS,
    payload: {},
  }
}

export const apiError = error => {
  return {
    type: API_ERROR,
    payload: error,
  }
}

export const changePassword = (password_details, history) => {
  return {
    type: CHANGE_PASSWORD,
    payload: { password_details, history },
  };
};

export const changePasswordSuccess = (password_details) => {
  return {
    type: CHANGE_PASSWORD_SUCCESS,
    payload: password_details,
  };
};