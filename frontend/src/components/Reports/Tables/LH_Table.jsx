import React from 'react';

const LH_Table = ({ data }) => {
    // Default data if none provided
    const reportData = data || {
        lhResult: "N/A"
    };

    return (

        <>
            <h6 className="text-center mb-2 mt-2"><strong>HORMONE & IMMUNOLOGY ASSAY</strong></h6>

            {/* LH Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '10px', fontSize: '13px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'left', width: '35%' }}>INVESTIGATION</th>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '15%' }}>OBSERVED VALUES</th>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '10%' }}>UNITS</th>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '40%' }}>REFERENCE VALUES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid black', padding: '8px' }}>
                            <strong>LEUTINISING HORMONE,Serum (LH)</strong><br /><br />
                            <strong>Method:</strong> Enzyme linked fluorescent assay(ELFA)
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.2rem' }}><strong>{reportData.lhResult}</strong></span>
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <strong>mUI/ml</strong>
                        </td>
                        <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <tbody>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '2px 5px' }}><strong>Men:</strong> <span style={{ float: 'right' }}>1.1 – 7.0 mIU/ml</span></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '2px 5px' }}><strong>Women:</strong></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '1px 5px' }}>Ovulation peak (15 days) <span style={{ float: 'right' }}>:9.6 - 80.0mUI/ml</span></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '1px 5px' }}>Follicular phase: First half(0 to 6 days)<span style={{ float: 'right' }}>:1.5 - 8.0 mUI/ml</span></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '1px 5px' }}>Second half (7 to 13 days)<span style={{ float: 'right' }}>:2.0 - 8.0 mUI/ml</span></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '1px 5px' }}>Luteal phase (18 to 30 days)<span style={{ float: 'right' }}>: 0.2 - 6.5 mUI/ml</span></td></tr>
                                    <tr><td style={{ padding: '1px 5px' }}>Menopause <span style={{ float: 'right' }}>: 8.0 - 33 mUI/ml</span></td></tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Interpretation Notes */}
            <div style={{ padding: '10px', fontSize: '12px' }}>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '8px' }}>Gonadal failure is a cause of infertility is indicated by elevated concentration of LH and FSH accompanied by low concentration gonadal steroids.</li>
                    <li style={{ marginBottom: '8px' }}>In the female elevated concentration of LH can indicate primary amenorrhea, menopause, premature ovarian failure or polycystic ovarian failure.</li>
                    <li style={{ marginBottom: '8px' }}>In the males elevated concentration of LH can result from primary testicular failure, seminiferous tubule dysgenesis and sertoli cell failure.</li>
                </ul>
            </div>
        </>
    );
};

export default LH_Table;
