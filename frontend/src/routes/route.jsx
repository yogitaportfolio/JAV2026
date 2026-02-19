import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

const Authmiddleware = (props) => {

  if (!localStorage.getItem("token")) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  } else {
    return <>{props.children}</>;
  }
  // return <>{props.children}</>;
};

export default Authmiddleware;
