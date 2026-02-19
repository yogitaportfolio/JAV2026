import { takeEvery, put, call } from "redux-saga/effects"
import { FETCH_UNITS } from "./actions"
import { fetchUnitsSuccess, fetchUnitsFail } from "./actions"
import { getSubmitForm } from "../../helpers/forms_helper"
import preloader from "../../helpers/preloader"

function* fetchUnitsSaga() {
  try {
    preloader(true)
    const url = import.meta.env.VITE_APP_BASEURL + "units/getall"
    const response = yield call(getSubmitForm, url)
    
    if (response && response.status === 1) {
      yield put(fetchUnitsSuccess(response.data))
    } else {
      yield put(fetchUnitsFail(response.error || "Failed to fetch units"))
    }
  } catch (error) {
    yield put(fetchUnitsFail(error.message))
  } finally{
        preloader(false)
  }
}

function* unitsSaga() {
  yield takeEvery(FETCH_UNITS, fetchUnitsSaga)
}

export default unitsSaga
