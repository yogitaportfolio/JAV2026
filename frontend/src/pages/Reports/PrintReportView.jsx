import React, { useState, useEffect } from 'react';
import LetterHead from '../../components/Reports/LetterHead';
import '../../components/Reports/MedicalReport.css';

const PrintReportView = () => {
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'PRINT_APPDATA') {
                const data = event.data.payload.testResults;
                setReportData(data);
                console.log(data,"data");
                

                // Set document title for PDF file naming
                const wife = data.patient_id?.wife?.name || "";
                const husband = data.patient_id?.husband?.name || "";
                const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

                let fileName = `${wife}${husband ? '/' + husband : ''}_Report_${date}`;
                document.title = fileName.trim().replace(/\s+/g, '_');

                setTimeout(() => {
                    // window.print();
                }, 800);
            }
        };

        window.addEventListener('message', handleMessage);

        // Signal to the parent that we are ready to receive data
        if (window.opener) {
            window.opener.postMessage({ type: 'PRINT_WINDOW_READY' }, '*');
        }

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!reportData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading Report...</span>
                    </div>
                    <p className="mt-2">Preparing Print Layout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="print-popup-view">
            <LetterHead data={reportData} />
        </div>
    );
};

export default PrintReportView;
