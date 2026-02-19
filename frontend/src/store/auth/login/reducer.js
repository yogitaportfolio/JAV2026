import {
  LOGIN_USER, VERIFY_OTP,
  LOGIN_SUCCESS,
  LOGOUT_USER,
  LOGOUT_USER_SUCCESS,
  API_ERROR,
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_SUCCESS,
} from "./actionTypes"

const initialState = {
  error: "",
  loading: false,
  userRoutes: null,
}

const login = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_USER:
      state = {
        ...state,
        loading: true,
      }
      break
    case VERIFY_OTP:
      state = {
        ...state,
        loading: true,
      }
      break
    case LOGIN_SUCCESS:
      state = {
        ...state,
        loading: false,
        error: null,
        role: action.payload.data.role,
        userRoutes: action.payload.routes,
      };
      break
    case LOGOUT_USER:
      state = { ...state }
      break
    case LOGOUT_USER_SUCCESS:
      state = { ...state }
      break
    case CHANGE_PASSWORD:
      state = { ...state };
      break;
    case CHANGE_PASSWORD_SUCCESS:
      state = { ...state };
      break;
    case API_ERROR:
      state = { ...state, error: action.payload, loading: false }
      break
    default:
      state = { ...state }
      break
  }
  return state
}

export default login;
