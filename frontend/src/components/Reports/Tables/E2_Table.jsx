import React from 'react';

const E2_Table = ({ data }) => {
    // Default data if none provided
    const reportData = data || {
        e2Result: "N/A"
    };

    return (

        <>
            {/* Estradiol (E2) Table */}
            <h6 className="text-center mb-2 mt-2"><strong>HORMONE & IMMUNOLOGY ASSAY</strong></h6>

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
                            <strong>Estradiol,Serum (E2) (DAY)</strong><br />
                            <strong>Method:</strong> Electro Chemiluminescense Immunoassay (ECLIA)
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.2rem' }}><strong>{reportData.e2Result}</strong></span>
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <strong>pg/ml</strong>
                        </td>
                        <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <tbody>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '2px 5px' }}><strong>MALE :</strong>  <span style={{ float: 'right' }}>( 20-75 ) pg/ml</span></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '2px 5px' }}><strong>POST MENOPAUSAL FEMALE :</strong> <span style={{ float: 'right' }}>( 20-88 )pg/ml</span></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '2px 5px', backgroundColor: '#f8f9fa', textDecoration: "underline" }}><strong>NON PREGNANT FEMALES</strong></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '2px 5px' }}><strong>MID FOLLICULAR PHASE :</strong> <span style={{ float: 'right' }}>(24-114 )pg/ml</span></td></tr>
                                    <tr><td style={{ borderBottom: '1px solid black', padding: '2px 5px' }}><strong>PERIOVULATORY :</strong> <span style={{ float: 'right' }}>(62-534 )pg/ml</span></td></tr>
                                    <tr><td style={{ padding: '2px 5px' }}><strong>MID LUTEAL PHASE :</strong> <span style={{ float: 'right' }}>(80-273 )pg/ml</span></td></tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

export default E2_Table;
