import {
  FETCH_UNITS,
  FETCH_UNITS_SUCCESS,
  FETCH_UNITS_FAIL,
} from "./actions"

const initialState = {
  units: [],
  loading: false,
  error: null,
}

const Units = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UNITS:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_UNITS_SUCCESS:
      return {
        ...state,
        units: action.payload,
        loading: false,
      }
    case FETCH_UNITS_FAIL:
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    default:
      return state
  }
}

export default Units
