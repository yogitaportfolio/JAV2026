import React, { useEffect } from 'react';
import './MedicalReport.css';
import logo from '../../assets/images/javitri_logo.png';
import { testTables } from '../../constants/testTables';
import AMH_Table from './Tables/AMH_Table';
import BHCG_Table from './Tables/BHCG_Table';
import E2_Table from './Tables/E2_Table';
import LH_Table from './Tables/LH_Table';
import P4_Table from './Tables/P4_Table';
import PRL_Table from './Tables/PRL_Table';
import TSH_Table from './Tables/TSH_Table';
import moment from 'moment';

const TableComponents = {
    AMH_Table,
    BHCG_Table,
    E2_Table,
    LH_Table,
    P4_Table,
    PRL_Table,
    TSH_Table
};

const LetterHead = ({ data }) => {
    if (!data) return null;

    document.title = data.patient_id?.wife?.name || "";

    const patientInfo = {
        patientName: `${data.patient_id?.wife?.name || '-'} / ${data.patient_id?.husband?.name || '-'}`,
        patientID: `${data.patient_id?.registration_no || '-'}`,
        age: `${data.patient_id?.wife?.age || '-'}/${data.patient_id?.husband?.age || '-'}`,
        sex: "F/M",
        date: moment(data.createdAt).format('DD/MM/YYYY'),
        consultedDr: "Mrs. Dr. RAJUL TYAGI",
        regNo: 'JHPL/2024',
        sample: "BLOOD",
        pdfUrl: data.pdf_url,
        preparedBy: data.prepared_by?.name || " "
    };
    const renderTestTable = (test) => {
        const testName = test.test_name;
        const testKey = test.test_code || test.test_id;
        let config = testTables[testKey];
        if (!config && testName) {
            const fallbackKey = Object.keys(testTables).find(key => testName.includes(key));
            config = testTables[fallbackKey];
        }

        if (config && TableComponents[config.component]) {
            const Component = TableComponents[config.component];

            const normalizedData = {
                ...test,
                result: test.result,
                amhResult: test.result,
                bhcgResult: test.result,
                e2Result: test.result,
                lhResult: test.result,
                p4Result: test.result,
                prlResult: test.result,
                tshResult: test.result,
            };

            return <Component key={test.test_id || test._id} data={normalizedData} />;
        }
        return <div key={test.test_id || test._id} className="p-3 border text-center">Test: {testName} - Result: {test.observed_value}</div>;
    };

    const paginateTests = (tests) => {
        const pages = [];
        let currentPage = [];
        let currentWeight = 0;

        tests.forEach((test) => {
            const testName = test.test_name;
            const testKey = test.test_code || test.test_id;

            let tableConfig = testTables[testKey];
            if (!tableConfig && testName) {
                const fallbackKey = Object.keys(testTables).find(key => testName.includes(key));
                tableConfig = testTables[fallbackKey];
            }

            if (!tableConfig) tableConfig = { tablesPerPage: 2 };
            const weight = tableConfig.tablesPerPage === 1 ? 2 : 1;

            if (currentWeight + weight > 2) {
                pages.push(currentPage);
                currentPage = [test];
                currentWeight = weight;
            } else {
                currentPage.push(test);
                currentWeight += weight;
            }
        });

        if (currentPage.length > 0) {
            pages.push(currentPage);
        }
        return pages;
    };

    const standardWifeTests = (data.wife_tests || []).filter(t => !(t.test_code === "SA" && t.sample_type === "Semen"));
    const standardHusbandTests = (data.husband_tests || []).filter(t => !(t.test_code === "SA" && t.sample_type === "Semen"));

    const saTests = [...(data.wife_tests || []), ...(data.husband_tests || [])].filter(t => t.test_code === "SA" && t.sample_type === "Semen");

    const wifePages = paginateTests(standardWifeTests);
    const husbandPages = paginateTests(standardHusbandTests);

    const allPages = [
        ...wifePages.map(page => ({ type: 'WIFE', tests: page })),
        ...husbandPages.map(page => ({ type: 'HUSBAND', tests: page }))
    ];

    useEffect(() => {
        if (data) {
            const wife = data.patient_id?.wife?.name || "";
            const husband = data.patient_id?.husband?.name || "";
            const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

            let fileName = `${wife}${husband ? '/' + husband : ''}_Report_${date}`;
            const oldTitle = document.title;
            document.title = fileName.trim().replace(/\s+/g, '_');

            return () => {
                document.title = oldTitle;
            };
        }
    }, [data]);


    return (
        <div className="reports-wrapper">
            {allPages.map((page, pageIdx) => (
                <div key={pageIdx} className="report-page">
                    <img src={logo} alt="Watermark" className="report-watermark" />

                    <main className="report-content">
                        {/* Header Section */}
                        <header className="report-header">
                            <img src={logo} alt="Hospital Logo" className="report-logo" />
                            <div className="hospital-info">
                                <h2 className="hospital-name">JAVITRI HOSPITAL & TEST TUBE BABY CENTRE</h2>
                                <p className="hospital-address">Raibareilly Road, Telibagh, Lucknow-226032</p>
                            </div>
                        </header>

                        {/* Patient Details Section */}
                        <section className="patient-details-section">
                            <table className="patient-info-table">
                                <tbody>
                                    <tr>
                                        <td style={{ width: '55%' }}><strong>PATIENT NAME-</strong> {patientInfo.patientName}</td>
                                        <td style={{ width: '45%' }}><strong>ID –</strong> {patientInfo.patientID}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>AGE- {patientInfo.age} / SEX- {patientInfo.sex}</strong></td>
                                        <td><strong>DATE-</strong> {patientInfo.date}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>CONSULTED DR :</strong> {patientInfo.consultedDr}</td>
                                        <td>
                                            <strong>REGISTERED NO-</strong> {patientInfo.regNo} &nbsp;&nbsp;
                                            <strong>SAMPLE:</strong> {patientInfo.sample}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <h5 className="text-center text-uppercase mb-3 mt-2" style={{ textDecoration: 'underline' }}>
                            {page.type === 'WIFE' ? "Wife's Report" : "Husband's Report"}
                        </h5>

                        {/* Rendering tests for this page */}
                        {page.tests.map(test => renderTestTable(test))}

                        {/* Footer Section */}
                        <footer className="report-footer-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginBottom: '15px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '5px' }}>PREPARED BY-</div>
                                    <div style={{ fontWeight: 'bold' }}>{patientInfo.preparedBy}</div>
                                </div>
                                <div style={{ marginRight: '50px' }}>
                                    <div style={{ fontWeight: 'bold' }}>CHECKED</div>
                                </div>
                            </div>

                            <div className="contact-footer">
                                <p>Website:www.javitrihospital.co.in, Email:info@javitrihospital.co.in ,Ph:8932803493,Mob.:7800427000</p>
                            </div>
                        </footer>
                    </main>
                </div>
            ))}

            {/* Standalone SA PDF Pages (No Template) */}
            {/* {saTests.map((test, sIdx) => (
                <div key={`sa-${sIdx}`} className="sa-standalone-page">
                    {patientInfo.pdfUrl ? (
                        <iframe
                            src={`${patientInfo.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                            title="Semen Analysis Report"
                        />
                    ) : (
                        <div className="p-4 text-center">SA PDF URL not found.</div>
                    )}
                </div>
            ))} */}

            <div className="no-print" style={{ width: '100%', textAlign: 'center' }}>
                <button
                    className="btn btn-success"
                    onClick={() => window.print()}
                    style={{ position: 'fixed', bottom: '20px', zIndex: 1000 }}
                >
                    <i className="bx bx-printer me-1"></i>
                    Print Report
                </button>
            </div>
        </div>
    );
};

export default LetterHead;
