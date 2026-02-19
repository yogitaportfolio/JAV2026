import React from 'react';

const BHCG_Table = ({ data }) => {

    const reportData = data || {
        result: "N/A",
    };

    return (
        <>



            <h6 className="text-center mb-2 mt-2"><u>HORMONES & IMMUNOLOGY ASSAY</u></h6>

            {/* Test Results Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '10px', fontSize: '13px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'left', width: '45%' }}>INVESTIGATION</th>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '30%' }}>OBSERVED VALUES</th>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '25%' }}>UNITS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid black', padding: '8px' }}>
                            <strong>Β-HCG ,Serum</strong><br />
                            <strong>Method:</strong> Enzyme Linked Fluorescent Assay (ELFA)
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.2rem' }}><strong>{reportData.result}</strong></span>
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <strong>mIU/ml</strong>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Biological Reference Interval */}
            <div style={{ marginTop: '10px' }}>
                <h6 className="fw-bold mb-2" style={{ fontSize: '12px' }}><u>BIOLOGICAL REFERENCE INTERVAL</u></h6>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '10px', fontSize: '11px' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '2px 8px', width: '50%' }}><strong>men:</strong></td>
                            <td style={{ border: '1px solid black', padding: '2px 8px' }}>&lt; 3 mIU/ml</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '2px 8px' }}><strong>cyclic women:</strong></td>
                            <td style={{ border: '1px solid black', padding: '2px 8px' }}>&lt; 5 mIU/ml</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '2px 8px' }}><strong>menopausal women:</strong></td>
                            <td style={{ border: '1px solid black', padding: '2px 8px' }}>&lt; 10 mIU/ml</td>
                        </tr>
                    </tbody>
                </table>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '2px 8px', textAlign: 'left' }} colSpan="3"><strong>pregnant women:</strong></th>
                        </tr>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ border: '1px solid black', padding: '2px 8px', textAlign: 'left', width: '40%' }}>Week of amenorrhoea</th>
                            <th style={{ border: '1px solid black', padding: '2px 8px', textAlign: 'left', width: '30%' }}>Mean Miu/ml</th>
                            <th style={{ border: '1px solid black', padding: '2px 8px', textAlign: 'left', width: '30%' }}>Limits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["4 to 5", "7 400", "1 500 - 23 000"],
                            ["5 to 6", "32 800", "3 400 - 135 300"],
                            ["6 to 7", "52 000", "10 500 - 161 000"],
                            ["7 to 8", "74 000", "18 000 - 209 000"],
                            ["8 to 9", "100 000", "37 500 - 218 000"],
                            ["9 to 10", "105 000", "42 800 - 219 000"],
                            ["10 to 11", "96 000", "33 700 - 218 700"],
                            ["11 to 12", "75 300", "21 800 - 193 200"],
                            ["12 to 13", "66 700", "20 300 - 166 100"],
                            ["13 to 14", "65 900", "15 400 - 190 000"],
                            ["2nd trimester (14-26)", "31 500", "4500 - 114 400"],
                            ["3rd trimester (26-39)", "22 800", "3500 - 80000"]
                        ].map(([week, mean, limits], idx) => (
                            <tr key={idx}>
                                <td style={{ border: '1px solid black', padding: '1px 8px' }}>{week}</td>
                                <td style={{ border: '1px solid black', padding: '1px 8px' }}><strong>{mean}</strong></td>
                                <td style={{ border: '1px solid black', padding: '1px 8px' }}><strong>{limits}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </>
    );
};

export default BHCG_Table;
