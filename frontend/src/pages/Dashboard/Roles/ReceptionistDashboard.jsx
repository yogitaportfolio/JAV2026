import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { getSubmitForm } from "../../../helpers/forms_helper";
import showToast from "../../../helpers/show_toast";
import preloader from "../../../helpers/preloader";
import StatCard from "../../../components/Common/StatCard";
import WelcomeCard from "../../../components/Common/WelcomeCard";
import useIdleReload from "../../../hooks/useIdleReload";

const ReceptionistDashboard = () => {
    document.title = "Receptionist Dashboard";
    const [stats, setStats] = useState({ smsBalance: 0 });

    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {
        try {
            preloader(true);
            const statsUrl = import.meta.env.VITE_APP_BASEURL + "reports/get_data_count";
            const statsResponse = await getSubmitForm(statsUrl, {});

            setStats({
                smsBalance: statsResponse?.status === 1 ? Number(statsResponse.data.balance_sms).toFixed(0) : 0
            });
        } catch (err) {
            showToast("Sync Error", "error");
        } finally {
            preloader(false);
        }
    };

    useIdleReload(fetchDashboardData, 300000); // 5 minutes refresh on idle

    return (
        <div className="page-content" style={{ backgroundColor: '#fcf1f4ff', minHeight: '100vh', paddingBottom: '50px' }}>
            <Container fluid className="px-lg-5">

                {/* ROW 1: WELCOME + STATS */}
                <Row className="mb-4 pt-3">
                    {/* WELCOME CARD */}
                    <Col lg={4} className="mb-3">
                        <WelcomeCard />
                    </Col>

                    {/* STATS SECTION */}
                    <Col lg={8}>
                        <Row className="h-100">
                            <Col md={4} className="mb-3">
                                <StatCard
                                    title="SMS Balance"
                                    value={stats.smsBalance}
                                    icon="bx-message"
                                    color="warning"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

            </Container>

            <style>
                {`
                .shadow-soft {
                    box-shadow: 0 10px 30px rgba(240, 98, 146, 0.08) !important;
                }
                .rounded-20 { borderRadius: 20px; }
                
                .ls-1 { letter-spacing: 1px; }
                `}
            </style>
        </div>
    );
};

export default ReceptionistDashboard;
