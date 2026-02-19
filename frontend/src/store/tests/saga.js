import { takeEvery, put, call } from "redux-saga/effects"
import { FETCH_TESTS } from "./actions"
import { fetchTestsSuccess, fetchTestsFail } from "./actions"
import { getSubmitForm } from "../../helpers/forms_helper"
import preloader from "../../helpers/preloader"

function* fetchTestsSaga() {
  try {
    preloader(true)
    const url = import.meta.env.VITE_APP_BASEURL + "tests/getall"
    const response = yield call(getSubmitForm, url)
    
    if (response && response.status === 1) {
      yield put(fetchTestsSuccess(response.data))
    } else {
      yield put(fetchTestsFail(response.error || "Failed to fetch tests"))
    }
  } catch (error) {
    yield put(fetchTestsFail(error.message))
  } finally {    preloader(false)}
}

function* testsSaga() {
  yield takeEvery(FETCH_TESTS, fetchTestsSaga)
}

export default testsSaga
