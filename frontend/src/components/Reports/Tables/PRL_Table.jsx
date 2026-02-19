import React from 'react';

const PRL_Table = ({ data }) => {
    // Default data if none provided
    const reportData = data || {
        prlResult: "N/A"
    };

    return (
        <>
                    {/* Prolactin (PRL) Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '10px', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'left', width: '35%' }}>INVESTIGATION</th>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '15%' }}>OBSERVED VALUES</th>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '10%' }}>UNITS</th>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '40%' }}>REFERENCE INTERVAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                    <strong>PROLACTINE ,Serum (PRL)</strong><br /><br />
                                    <strong>Method:Enzyme linked fluorescent assay (ELFA)</strong>
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><strong>{reportData.prlResult}</strong></span>
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                    <strong>ng/ml</strong>
                                </td>
                                <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px 6px', fontWeight: 'bold', width: '60%' }}>
                                                    Normal Menstruating Women
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '4px 6px' }}>
                                                    5-35 ng/ml
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '20px 6px 4px 6px', textAlign: 'right', fontWeight: 'bold' }}>
                                                    Men
                                                </td>
                                                <td style={{ padding: '20px 6px 4px 6px' }}>
                                                    3-25 ng/ml
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Prolactin Interpretation */}
                    <div style={{ fontSize: '11px', marginBottom: '15px', lineHeight: '1.4' }}>
                        <p style={{ margin: 0, textAlign: 'justify' }}>
                            In the female elevated concentration of LH can indicate primary amenorrhea, galactorrhea, primary hypothyroidism, anorexia nervosa, polycystic ovarian syndrome, renal failure and Women taking oral contraceptives or receiving esterogen therapy can have elevated prolactin concentration. Stress can falsely elevate prolactin concentration.
                        </p>
                    </div>

        </>
    );
};

export default PRL_Table;
