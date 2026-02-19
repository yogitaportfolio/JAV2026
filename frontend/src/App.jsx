import React, { useEffect } from "react";

import { Routes, Route, useLocation } from "react-router-dom";

// Import Routes all
import { authProtectedRoutes, publicRoutes } from "./routes";

// Import all middleware
import Authmiddleware from "./routes/route";
import Layout from "./components/VerticalLayout";

import NonAuthLayout from "./components/NonAuthLayout";
import Pages404 from "./pages/Utility/pages-404";
// Import scss
import "./assets/scss/theme.scss";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from "@mui/material";

const App = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/health_progress' && location.pathname !== '/questions') {
      localStorage.removeItem("patient");
    }
  }, [location]);
  const theme = createTheme({
    components: {
      MuiDataGrid: {
        defaultProps: {
          disableColumnMenu: true,
        },
        styleOverrides: {
          root: {
            fontSize: '14px',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#2A3042',
              color: '#ffffff',
              fontWeight: 'bold',
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-sortIcon': {
                color: '#ffffff',
              },
              '& .MuiDataGrid-menuIcon': {
                color: '#ffffff',
              },
              '& .MuiDataGrid-iconButtonContainer': {
                '& .MuiIconButton-root': {
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                  },
                },
              },
            },
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-row': {
              '&:nth-of-type(odd)': {
                backgroundColor: '#f9f9f9',
              },
              '&:nth-of-type(even)': {
                backgroundColor: '#ffffff',
              },
              '&:hover': {
                backgroundColor: '#e1e9f5',
              },
              '&.Mui-selected': {
                backgroundColor: '#bbd6fb',
                '&:hover': {
                  backgroundColor: '#a8c9f7',
                },
              },
            },
            '& .MuiDataGrid-footerContainer': {
              justifyContent: 'space-between',
              '& .MuiTablePagination-root': {
                color: '#000',
                '& .MuiTablePagination-selectLabel': {
                  marginBottom: 0,
                  alignSelf: 'center',
                },
                '& .MuiTablePagination-select': {
                  marginLeft: '0.5rem',
                  marginRight: '0.5rem',
                },
                '& .MuiTablePagination-displayedRows': {
                  marginBottom: 0,
                  alignSelf: 'center',
                },
                '& .MuiTablePagination-actions': {
                  marginLeft: '1rem',
                  alignSelf: 'center',
                },
              },
            },
            // Ensure menu icon is white even when not directly in the header
            '& .MuiDataGrid-menuIcon': {
              color: '#ffffff',
            },
            // Hide the column header selector
            // '& .MuiDataGrid-columnHeaderCheckbox': {
            //   display: 'none',
            // },
          },
          columnHeaderWrapper: {
            minHeight: '45px',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '12px',
          },
        },
      },
    },
  });
  return (
    <>
      <ThemeProvider theme={theme}>
        <Routes>
          {publicRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={<NonAuthLayout>{route.component}</NonAuthLayout>}
              key={idx}
              exact={true}
            />
          ))}

          {authProtectedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <Authmiddleware>
                  <Layout>{route.component}</Layout>
                </Authmiddleware>
              }
              key={idx}
              exact={true}
            />
          ))}
          <Route
            path="*"
            element={
              <NonAuthLayout>
                <Pages404 />
              </NonAuthLayout>
            }
          />
        </Routes>
      </ThemeProvider>
    </>
  );
};

export default App;
