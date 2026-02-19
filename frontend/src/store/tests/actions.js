// Tests Actions
export const FETCH_TESTS = "FETCH_TESTS"
export const FETCH_TESTS_SUCCESS = "FETCH_TESTS_SUCCESS"
export const FETCH_TESTS_FAIL = "FETCH_TESTS_FAIL"

export const fetchTests = () => ({
  type: FETCH_TESTS,
})

export const fetchTestsSuccess = (tests) => ({
  type: FETCH_TESTS_SUCCESS,
  payload: tests,
})

export const fetchTestsFail = (error) => ({
  type: FETCH_TESTS_FAIL,
  payload: error,
})
