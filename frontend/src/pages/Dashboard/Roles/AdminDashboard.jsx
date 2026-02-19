import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Badge } from "reactstrap";
import StatCard from "../../../components/Common/StatCard";
import WelcomeCard from "../../../components/Common/WelcomeCard";
import { getSubmitForm } from "../../../helpers/forms_helper";
import showToast from "../../../helpers/show_toast";
import logo from "../../../assets/images/javitri_logo.png";
import preloader from "../../../helpers/preloader";
import useIdleReload from "../../../hooks/useIdleReload";

const AdminDashboard = () => {
    const [counts, setCounts] = useState({
        patients: 0,
        procedures: 0,
    });


    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {
        try {
            preloader(true);
            const patientsUrl = import.meta.env.VITE_APP_BASEURL + "patients/getall";
            const proceduresUrl = import.meta.env.VITE_APP_BASEURL + "procedures/getall";

            const [patientsResponse, proceduresResponse] = await Promise.all([
                getSubmitForm(patientsUrl, {}),
                getSubmitForm(proceduresUrl, {}),
            ]);

            const nextCounts = { patients: 0, procedures: 0 };
            if (patientsResponse && patientsResponse.status === 1) {
                nextCounts.patients = (patientsResponse.data || []).length;
            } else {
                showToast(patientsResponse?.message || "Failed to fetch patient count", "error");
            }

            if (proceduresResponse && proceduresResponse.status === 1) {
                nextCounts.procedures = (proceduresResponse.data || []).length;
            } else {
                showToast(proceduresResponse?.message || "Failed to fetch procedure count", "error");
            }

            setCounts(nextCounts);
        } catch (err) {
            console.log(err);
            showToast("Error fetching dashboard data", "error");
        } finally {
            preloader(false);
        }
    };
    useIdleReload(fetchDashboardData, 300000); // 5 minutes refresh on idle

    const countCards = [
        { title: "Patients", value: counts.patients, icon: "bx-user-plus", desc: "Total registered patients", gradient: "linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)" },
        { title: "Procedures", value: counts.procedures, icon: "bx-test-tube", desc: "Active service master", gradient: "linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)" },
    ];

    return (
        <div className="page-content" style={{ backgroundColor: '#FFFBFC', minHeight: '100vh' }}>
            <Container fluid className="px-lg-5">
                <Row>
                    <Col xs="12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Dashboard</h4>
                        </div>
                    </Col>
                </Row>

                <Row className="g-4 mb-4 align-items-stretch">
                    <Col xs={12} md={5} lg={5}>
                        <WelcomeCard />
                    </Col>
                    {countCards.map((card, index) => (
                        <Col key={index} xs={12} sm={6} md={3} lg={3}>
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
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        style={{ width: "100px", height: "100px", objectFit: "contain" }}
                                    />
                                </div>
                                <h2 className="fw-bold text-dark mb-2">Javitri Hospital & Test Tube Baby Centre</h2>
                                <p className="text-muted mx-auto mb-4" style={{ maxWidth: '600px' }}>
                                    Global scale healthcare management. Monitor live lab operations,
                                    quality control for test results, and administrative oversight.
                                </p>
                                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                    <Badge
                                        pill
                                        color="light"
                                        className="px-3 py-2 bg-soft-info text-info border-info border opacity-75"
                                    >
                                        Live Lab Tracking
                                    </Badge>
                                    <Badge
                                        pill
                                        color="light"
                                        className="px-3 py-2 bg-soft-success text-success border-success border opacity-75"
                                    >
                                        Verified Reports
                                    </Badge>
                                    <Badge
                                        pill
                                        color="light"
                                        className="px-3 py-2 bg-soft-warning text-warning border-warning border opacity-75"
                                    >
                                        Quality Control
                                    </Badge>
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
