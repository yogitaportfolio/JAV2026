import { combineReducers } from "redux";
import Login from "./auth/login/reducer";
import Layout from "./layout/reducer";
import Units from "./units/reducer";
import Tests from "./tests/reducer";

const rootReducer = combineReducers({
  // public
  Layout,
  Login,
  Units,
  Tests,
});

export default rootReducer;
