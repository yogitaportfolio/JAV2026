import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, Badge, Button, Label, FormGroup, Input } from "reactstrap";
import StatCard from "../../../components/Common/StatCard";
import { getSubmitForm, postSubmitForm } from "../../../helpers/forms_helper";
import showToast from "../../../helpers/show_toast";
import { DataGrid } from '@mui/x-data-grid';
import PatientModal from "../../Patients/PatientModal";
import AssignTestModal from "../../Patients/AssignTestModal";
import moment from "moment";
import preloader from "../../../helpers/preloader";
import { openPrintPopup } from "../../../helpers/printHelper";
import pdf_logo from "../../../assets/images/pdf_logo.png";
import { QuickSearchToolbar } from "../../../helpers/table_helpers";
import WelcomeCard from "../../../components/Common/WelcomeCard";
import useIdleReload from "../../../hooks/useIdleReload";
import AssignedTestsViewer from "../../../components/Common/AssignedTestsViewer";

const CounsellorDashboard = () => {
  const [stats, setStats] = useState({
    assigned: 0,
    approved: 0,
    in_review: 0,
    rejected: 0
  });
  const [patientModal, setPatientModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedStatus, setSelectedStatus] = useState("Assigned");
  const [sortModel, setSortModel] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // fetchTableData();
  }, [fromDate, toDate, selectedStatus]);

  useIdleReload(() => {
    fetchStats();
    // fetchTableData();
  }, 300000); // 5 minutes refresh on idle
  // }, 10000); // 10 seconds test refresh on idle

  const fetchStats = async () => {
    try {
      const countUrl = import.meta.env.VITE_APP_BASEURL + "reports/get_data_count";
      const countResponse = await getSubmitForm(countUrl, { from_date: fromDate, to_date: toDate });
      if (countResponse && countResponse.status === 1) {
        setStats(countResponse.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTableData = async () => {
    // Validate date range (max 1 month)
    const start = moment(fromDate);
    const end = moment(toDate);

    if (end.isBefore(start)) {
      showToast("End date cannot be before start date", "warning");
      return;
    }

    if (end.diff(start, 'months', true) > 1) {
      showToast("Please select a date range within 1 month", "warning");
      return;
    }

    try {
      preloader(true);
      // Fetch Table Data
      const tableUrl = import.meta.env.VITE_APP_BASEURL + "reports/getBy_status";
      const tablePayload = {
        from_date: fromDate,
        to_date: toDate,
      };

      if (selectedStatus !== "All") {
        tablePayload.status = [selectedStatus];
      } else {
        tablePayload.status = ["In Review", "Assigned", "Approved", "Rejected","Closed"];
      }

      const tableResponse = await postSubmitForm(tableUrl, tablePayload);
      if (tableResponse && tableResponse.status === 1) {
        const patients = tableResponse.data || [];
        setRecentRequests(patients);
      }
    } catch (err) {
      console.log(err);
      showToast("Error fetching dashboard data", "error");
    } finally {
      preloader(false);
    }
  };

  const columns = [
    {
      field: 'sn',
      filterable: false,
      sortable: false,
      headerName: '#',
      width: 50,
      renderCell: (params) => {
        const rowIds = params.api.getSortedRowIds();
        return rowIds.indexOf(params.id) + 1;
      }
    },
    {
      field: 'patient_id.registration_no',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 100,
      valueGetter: (value, row) => row.patient_id?.registration_no || 'N/A'
    },
    {
      field: 'patient_name',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 100,
      valueGetter: (value, row) => row.patient_id?.wife?.name || row.patient_id?.name || 'N/A'
    },
    {
      field: 'husband_name',
      headerName: 'Husband Name',
      flex: 1,
      minWidth: 100,
      valueGetter: (value, row) => row.patient_id?.husband?.name || 'N/A'
    },
    {
      field: 'contact_info',
      headerName: 'Contact Info',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="d-flex flex-column " style={{ fontSize: '12px', lineHeight: '1.4' }}>
          <div className="d-flex align-items-center">
            <i className="bx bx-phone me-1 text-primary"></i>
            <span>{params.row.patient_id?.mobile || 'N/A'}</span>
          </div>
          {params.row.patient_id?.email && (
            <div className="d-flex align-items-center">
              <i className="bx bx-envelope me-1 text-info"></i>
              <span className="text-truncate" style={{ maxWidth: '130px' }}>{params.row.patient_id?.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      field: 'ages',
      headerName: 'W/H Age',
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => (
        <div className="d-flex align-items-center justify-content-between w-100">
          <span>{params.row.patient_id?.wife?.age || '-'}/{params.row.patient_id?.husband?.age || '-'}</span>
        </div>
      )
    },
    {
      field: 'test_counts',
      headerName: 'Tests (W/H)',
      width: 140,
      renderCell: (params) => (
        <AssignedTestsViewer
          wifeTests={params.row.wife_tests}
          husbandTests={params.row.husband_tests}
          id={params.row._id}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Test Time',
      flex: 1,
      minWidth: 100,
      valueGetter: (value) => moment(value).format('DD-MM-YYYY hh:mm')
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        let color = "secondary";
        if (params.value === "In Review") color = "info";
        if (params.value === "Approved") color = "success";
        if (params.value === "Rejected") color = "danger";
        return (
          <div className="d-flex flex-column align-items-center py-2" style={{ lineHeight: '1.2' }}>
            <div className="d-flex align-items-center">
              <span className={`badge bg-${color} me-2`}>
                {params.value || 'Assigned'}
              </span>
              <span hidden={params.value !== "Approved"}>
                <img
                  src={pdf_logo}
                  alt="PDF"
                  style={{ cursor: 'pointer', width: '22px', height: '22px' }}
                  onClick={() => openPrintPopup(params.row)}
                  title="View Report"
                />
              </span>
            </div>
            {params.value === "Rejected" && params.row.remark && (
              <small className="text-danger mt-1 text-center" style={{ fontSize: '10px', maxWidth: '120px', wordBreak: 'break-word' }}>
                {params.row.remark}
              </small>
            )}
          </div>
        )
      }
    },
  ];

  const countCards = [
    { title: "Assigned Tests", value: stats.assigned, icon: "bx-list-plus", desc: "Awaiting sample/entry", gradient: "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)", color: "info" },
    { title: "In Review Tests", value: stats.in_review, icon: "bx-time-five", desc: "Sent for verification", gradient: "linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)", color: "warning" },
    { title: "Approved Tests", value: stats.approved, icon: "bx-check-double", desc: "Finalized & printable", gradient: "linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)", color: "success" },
    { title: "Rejected Tests", value: stats.rejected, icon: "bx-error-circle", desc: "Needs re-testing", gradient: "linear-gradient(135deg, #FED06E 0%, #FFA17A 100%)", color: "danger" }
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs="12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">Counsellor Dashboard</h4>
              <div className="page-title-right d-flex gap-2">
                <Button
                  color="success"
                  className="btn-rounded me-2"
                  onClick={() => setPatientModal(true)}>
                  <i className="bx bx-plus-circle me-1"></i> Add Patient
                </Button>
                <Button
                  color="primary"
                  className="btn-rounded me-2"
                  onClick={() => setAssignModal(true)}>
                  <i className="bx bx-list-check me-1"></i> Assign Test
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          <Col lg={4} md={6} xs={12}>
            <WelcomeCard />
          </Col>
          <Col lg={8} md={12} xs={12}>
          <Row>
                    {countCards.map((card, index) => (
            <Col key={index} lg={3} md={3} sm={6} xs={12} className="mb-1">
              <StatCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                gradient={card.gradient}
                desc={card.desc}
                color={card.color}
              />
            </Col>
          ))}
          </Row>
          </Col>
        </Row>

        {/* <Row className="mt-4">
          <Col xl={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <CardTitle className="mb-0">Test Requests & Status</CardTitle>
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <FormGroup className="mb-0 d-flex align-items-center gap-2">
                      <Label className="mb-0 text-nowrap">From</Label>
                      <Input
                        type="date"
                        bsSize="sm"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={{ width: '130px' }}
                      />
                    </FormGroup>
                    <FormGroup className="mb-0 d-flex align-items-center gap-2">
                      <Label className="mb-0 text-nowrap">To</Label>
                      <Input
                        type="date"
                        bsSize="sm"
                        value={toDate}
                        min={fromDate}
                        onChange={(e) => setToDate(e.target.value)}
                        style={{ width: '130px' }}
                      />
                    </FormGroup>
                    <FormGroup className="mb-0 d-flex align-items-center gap-2">
                      <Label className="mb-0 text-nowrap">Status</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{ width: '130px' }}
                      >
                        <option value="All">All Status</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Review">In Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </Input>
                    </FormGroup>
                  </div>
                </div>
                <div style={{ minHeight: 400, width: '100%' }}>
                  <DataGrid
                    getRowId={(row) => row._id}
                    rows={recentRequests}
                    density="compact"
                    getRowHeight={() => 'auto'}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    loading={loading}
                    slots={{
                      toolbar: QuickSearchToolbar,
                    }}
                    onSortModelChange={(newSortModel) => {
                      setSortModel(newSortModel);
                    }}
                    slotProps={{
                      toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                      },
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row> */}

        {/* <Row className="mt-4">
          <Col xl={12}>
            <Card>
              <CardBody>
                <CardTitle className="mb-4">Real-time Notifications</CardTitle>
                <div className="text-muted">
                  <p><i className="bx bx-info-circle me-1 text-primary"></i> No new updates in the last 24 hours.</p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row> */}
      </Container>

      <PatientModal
        isOpen={patientModal}
        toggle={() => setPatientModal(!patientModal)}
        mode="create"
        refreshData={() => { fetchStats(); fetchTableData(); }}
      />

      <AssignTestModal
        isOpen={assignModal}
        toggle={() => setAssignModal(!assignModal)}
        refreshData={() => { fetchStats(); fetchTableData(); }}
      />
    </div>
  );
};

export default CounsellorDashboard;
