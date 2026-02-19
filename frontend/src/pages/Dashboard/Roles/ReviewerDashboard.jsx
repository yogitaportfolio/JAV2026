import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, Badge, Button, Table, FormGroup, Label, Input } from "reactstrap";
import StatCard from "../../../components/Common/StatCard";
import { getSubmitForm, postSubmitForm } from "../../../helpers/forms_helper";
import showToast from "../../../helpers/show_toast";
import { DataGrid } from '@mui/x-data-grid';
import moment from "moment";
import preloader from "../../../helpers/preloader";
import Swal from 'sweetalert2'
import pdf_logo from "../../../assets/images/pdf_logo.png";
import { openPrintPopup } from "../../../helpers/printHelper";
import { QuickSearchToolbar } from "../../../helpers/table_helpers";
import useIdleReload from "../../../hooks/useIdleReload";
import AssignedTestsViewer from "../../../components/Common/AssignedTestsViewer";



const ReviewerDashboard = () => {
  const [stats, setStats] = useState({
    assigned: 0,
    approved: 0,
    in_review: 0,
    rejected: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedStatus, setSelectedStatus] = useState("In Review");
  const [sortModel, setSortModel] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTableData();
  }, [fromDate, toDate, selectedStatus]);

  useIdleReload(() => {
    fetchStats();
    fetchTableData();
  }, 300000); // 5 minutes refresh on idle

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
      setLoading(true);
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
        setRecentRequests(tableResponse.data || []);
      }
    } catch (err) {
      console.log(err);
      showToast("Error fetching dashboard data", "error");
    } finally {
      setLoading(false);
      preloader(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    let remark = "";

    if (status === 'Approved') {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You want to approve this report?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve it!'
      });
      if (!result.isConfirmed) return;
    }

    if (status === 'Rejected') {
      const { value: text, isConfirmed } = await Swal.fire({
        title: 'Rejection Remark',
        input: 'textarea',
        inputLabel: 'Please enter a remark for rejection',
        inputPlaceholder: 'Type your remark here...',
        showCancelButton: true,
        confirmButtonText: 'Submit Rejection',
        confirmButtonColor: '#d33',
        inputValidator: (value) => {
          if (!value) return 'You need to write something!'
        }
      })
      if (!isConfirmed) return;
      remark = text;
    }

    try {
      preloader(true)
      let url = import.meta.env.VITE_APP_BASEURL + "reports/verify_report"
      let response = await postSubmitForm(url, { report_id: id, status: status, remark: remark })
      if (response && response.status === 1) {
        showToast(`Report ${status} successfully`, "success")
        fetchStats();
        fetchTableData();
      } else {
        showToast(response.message || `Failed to ${status} report`, "error")
      }
    } catch (err) {
      console.log(err)
      showToast("Error updating status", "error")
    } finally {
      preloader(false)
    }
  }

  const columns = [
    {
      field: 'sn',
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
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        let color = "secondary";
        if (params.value === "In Review") color = "info";
        if (params.value === "Approved") color = "success";
        if (params.value === "Rejected") color = "danger";
        return (
          <div className="d-flex flex-column align-items-center py-2" style={{ lineHeight: '1.2' }}>
            <span className={`badge bg-${color}`}>
              {params.value || 'Assigned'}
            </span>
            {params.value === "Rejected" && params.row.remark && (
              <small className="text-danger mt-1 text-center" style={{ fontSize: '10px', maxWidth: '100px', wordBreak: 'break-word' }}>
                {params.row.remark}
              </small>
            )}
          </div>
        )
      }
    },
    {
      field: 'createdAt',
      headerName: 'Test Time',
      flex: 1,
      minWidth: 100,
      valueGetter: (value) => moment(value).format('DD-MM-YYYY hh:mm')
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <div className="d-flex gap-2 mt-1 justify-content-center align-items-center" style={{ fontSize: "20px" }}>
          <img
            src={pdf_logo}
            alt="PDF"
            style={{ cursor: 'pointer', width: '22px', height: '22px' }}
            onClick={() => openPrintPopup(params.row)}
            title="View Report"
          />
          <i className={`bx bx-check-circle ${params.row.status === 'Approved' ? 'text-muted' : 'text-success'}`}
            style={{ cursor: params.row.status === 'Approved' ? 'default' : 'pointer' }}
            onClick={() => params.row.status !== 'Approved' && handleStatusUpdate(params.row._id, 'Approved')}
            title="Approve Report"
          ></i>
          <i className={`bx bx-x-circle ${params.row.status === 'Rejected' ? 'text-muted' : 'text-danger'}`}
            style={{ cursor: params.row.status === 'Rejected' ? 'default' : 'pointer' }}
            onClick={() => params.row.status !== 'Rejected' && handleStatusUpdate(params.row._id, 'Rejected')}
            title="Reject Report"
          ></i>
        </div>
      )
    }
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
              <h4 className="mb-sm-0 font-size-18">Reviewer Dashboard</h4>
            </div>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          {countCards.map((card, index) => (
            <Col key={index} xs={12} sm={6} md={3}>
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

        {/* <Row className="mt-4">
          <Col xl={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <CardTitle className="mb-0">Reports Review Queue</CardTitle>
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
                        <option value="In Review">In Review</option>
                        <option value="Assigned">Assigned</option>
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
                    loading={loading}
                    disableSelectionOnClick
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
      </Container>
    </div>
  );
};

export default ReviewerDashboard;
