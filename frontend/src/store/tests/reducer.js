import {
  FETCH_TESTS,
  FETCH_TESTS_SUCCESS,
  FETCH_TESTS_FAIL,
} from "./actions"

const initialState = {
  tests: [],
  loading: false,
  error: null,
}

const Tests = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TESTS:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_TESTS_SUCCESS:
      return {
        ...state,
        tests: action.payload,
        loading: false,
      }
    case FETCH_TESTS_FAIL:
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    default:
      return state
  }
}

export default Tests
