import React from "react";
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
// // Dashboard
import Dashboard from "../pages/Dashboard/index";
import Pages404 from "../pages/Utility/pages-404";
import ChangePassword from "../pages/ChangePassword";
import UserList from "../pages/Users/UserList";
import PatientList from "../pages/Patients/PatientList";
import UnitList from "../pages/UnitMaster/UnitList";
import TestMaster from "../pages/Tests/TestMaster";
import ReportList from "../pages/Reports/ReportList";
import PrintReportView from "../pages/Reports/PrintReportView";
import AssignedTests from "../pages/Tests/AssignedTests";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/change_password", component: <ChangePassword /> },
  { path: "/users", component: <UserList /> },
  { path: "/patients", component: <PatientList /> },
  { path: "/units", component: <UnitList /> },
  { path: "/tests", component: <TestMaster /> },
  { path: "/all-reports", component: <ReportList /> },
  { path: "/reports/day-wise", component: <ReportList /> },
  { path: "/reports/patient-history", component: <ReportList /> },
  { path: "/reports/tenure-wise", component: <ReportList /> },
  { path: "/assigned_test", component: <AssignedTests /> },
  // this route should be at the end of all other routes
  { path: "/", exact: true, component: <Dashboard /> },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/page-404", component: <Pages404 /> },
  { path: "/print_details", component: <PrintReportView /> },
];

// export { authProtectedRoutes, publicRoutes };
export { authProtectedRoutes, publicRoutes }
