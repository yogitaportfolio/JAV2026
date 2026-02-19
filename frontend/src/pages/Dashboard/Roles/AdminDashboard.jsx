import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge } from "reactstrap";
import StatCard from "../../../components/Common/StatCard";
import { getSubmitForm } from "../../../helpers/forms_helper";
import showToast from "../../../helpers/show_toast";
import logo from "../../../assets/images/javitri_logo.png";
import preloader from "../../../helpers/preloader";
import useIdleReload from "../../../hooks/useIdleReload";

const AdminDashboard = () => {
    const [counts, setCounts] = useState({
        assigned: 0,
        approved: 0,
        in_review: 0,
        rejected: 0,
        balance_sms: 0,
        PendingInquiries: 0
    });


    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {
        try {
            preloader(true);
            // Fetch Report Counts
            const countUrl = import.meta.env.VITE_APP_BASEURL + "reports/get_data_count";
            const countResponse = await getSubmitForm(countUrl, {});
            if (countResponse && countResponse.status === 1) {
                setCounts(countResponse.data);
            }
        } catch (err) {
            console.log(err);
            showToast("Error fetching dashboard data", "error");
        } finally {
            preloader(false);
        }
    };
    useIdleReload(fetchDashboardData, 300000); // 5 minutes refresh on idle

    const countCards = [
        { title: "Assigned Tests", value: counts.assigned, icon: "bx-list-plus", desc: "Awaiting sample/entry", gradient: "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)" },
        { title: "In Review Tests", value: counts.in_review, icon: "bx-time-five", desc: "Sent for verification", gradient: "linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)" },
        { title: "Approved Tests", value: counts.approved, icon: "bx-check-double", desc: "Finalized & printable", gradient: "linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)" },
        { title: "Rejected Tests", value: counts.rejected, icon: "bx-x-circle", desc: "Needs re-testing", gradient: "linear-gradient(135deg, #fe6e6eff 0%, #FFA17A 100%)" },
        { title: "Pending Inquiries", value: counts.PendingInquiries, icon: "bx-error-circle", desc: "Needs to contact", gradient: "linear-gradient(135deg, #FED06E 0%, #FFA17A 100%)" }
    ];

    return (
        <div className="page-content" style={{ backgroundColor: '#FFFBFC', minHeight: '100vh' }}>
            <Container fluid className="px-lg-5">
                <Row>
                    <Col xs="12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Admin Overview</h4>
                            <div className="d-flex align-items-center gap-3">
                                <Badge pill color="light" className="px-3 py-2 border shadow-sm text-info bg-white" style={{ fontSize: '0.9rem' }}>
                                    <i className="bx bx-message me-1"></i> SMS Balance: {counts.balance_sms ? Number(counts.balance_sms).toFixed(0) : '0'}
                                </Badge>
                                {/* <Badge color="light" className="text-muted p-2 border bg-white">Hospital Control Center</Badge> */}
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row className="g-4 mb-4">
                    {countCards.map((card, index) => (
                        <Col key={index} xs={12} sm={6} className="col-lg">
                            <StatCard
                                title={card.title}
                                value={card.value}
                                icon={card.icon}
                                gradient={card.gradient}
                                desc={card.desc}
                            />
                        </Col>
                    ))}
                </Row>

                <Row className="mt-2">
                    <Col xl={12}>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '28px', background: '#fff' }}>
                            <CardBody className="text-center py-5">
                                <div className="mb-4">
                                    <img src={logo} alt="Logo" style={{ width: "100px", height: "100px", objectFit: "contain" }} />
                                </div>
                                <h2 className="fw-bold text-dark mb-2">Javitri Hospital & Test Tube Baby Centre</h2>
                                <p className="text-muted mx-auto mb-4" style={{ maxWidth: '600px' }}>
                                    Global scale healthcare management. Monitor live lab operations,
                                    quality control for test results, and administrative oversight.
                                </p>
                                <div className="d-flex justify-content-center gap-2">
                                    <Badge pill color="light" className="px-3 py-2 bg-soft-info text-info border-info border opacity-75">Live Lab Tracking</Badge>
                                    <Badge pill color="light" className="px-3 py-2 bg-soft-success text-success border-success border opacity-75">Verified Reports</Badge>
                                    <Badge pill color="light" className="px-3 py-2 bg-soft-warning text-warning border-warning border opacity-75">Quality Control</Badge>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Styles moved to StatCard component */}
        </div>
    );
};

export default AdminDashboard;
