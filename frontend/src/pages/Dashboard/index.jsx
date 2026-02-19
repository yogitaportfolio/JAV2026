import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { ROLES } from "../../constants/roleConstants";
import CounsellorDashboard from "./Roles/CounsellorDashboard";
import LabOperatorDashboard from "./Roles/LabOperatorDashboard";
import ReviewerDashboard from "./Roles/ReviewerDashboard";
import AdminDashboard from "./Roles/AdminDashboard";
import ReceptionistDashboard from "./Roles/ReceptionistDashboard";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/auth/login/actions";
import moment from "moment";
import showToast from "../../helpers/show_toast";

const Dashboard = (props) => {
  document.title = "Dashboard";
  const [role, setRole] = useState(localStorage.getItem("role"));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiry = () => {
      const tokenExp = localStorage.getItem("token_expiry");
      if (tokenExp) {
        const expiryMoment = isNaN(tokenExp) ? moment(tokenExp) : moment.unix(parseInt(tokenExp));

        if (expiryMoment.isValid() && moment().isAfter(expiryMoment)) {
          showToast("Your session has expired. Please login again.", "error");
          dispatch(logoutUser(navigate));
        }
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check periodically (e.g., every minute)
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, []);

  // Switch between dashboards based on role
  const renderDashboard = () => {
    switch (role) {
      case ROLES.COUNSELLOR:
        return <CounsellorDashboard />;
      case ROLES.HEMATOLOGY_LAB_OPERATOR:
        return <LabOperatorDashboard />;
      case ROLES.ANDROLOGY_LAB_OPERATOR:
        return <LabOperatorDashboard />;
      case ROLES.REVIEWER:
        return <ReviewerDashboard />;
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.RECEPTIONIST:
        return <ReceptionistDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return renderDashboard();
};

Dashboard.propTypes = {
  t: PropTypes.any,
};

export default withTranslation()(Dashboard);
