import { all, fork } from "redux-saga/effects";
//public
import AuthSaga from "./auth/login/saga";
import LayoutSaga from "./layout/saga";
import unitsSaga from "./units/saga";
import testsSaga from "./tests/saga";

export default function* rootSaga() {
  yield all([
    //public
    fork(LayoutSaga),
    fork(AuthSaga),
    fork(unitsSaga),
    fork(testsSaga),
  ]);
}
