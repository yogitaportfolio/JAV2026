import React from 'react';


const AMH_Table = ({ data }) => {
    // Default data if none provided
    const reportData = data || {
        result: "N/A"
    };

    return (
        <>

            {/* <h6 className="text-center mb-2 mt-2"><u>HORMONES & IMMUNOLOGY ASSAY</u></h6> */}

            {/* Test Results Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '15px', fontSize: '13px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'left', width: '45%' }}>INVESTIGATION</th>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '30%' }}>OBSERVED VALUES</th>
                        <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '25%' }}>UNITS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid black', padding: '10px 8px' }}>
                            <strong>ANTI MULLERIAN HORMONE, AMH</strong><br />
                            <strong>Method:</strong> (MULLERIAN INHIBITING SUBSTANCE)
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.2rem' }}><strong>{reportData.result}</strong></span>
                        </td>
                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                            <strong>ng/ml</strong>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Interpretation Section */}
            <div className="interpretation-section" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>
                    ❖ <u>TEST INTERPRETATION</u>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <ul>
                        <li>AMH is produced directly by the ovarian follicles. AMH levels correlate with the number of antral follicles in the ovaries. Women with lower AMH have lower antral follicular counts and produce a lower number of oocytes compared with women with higher level.</li>
                    </ul>
                </div>

                <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>
                    ❖ <u>AMH Reference ranges:</u>
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: '15px', marginBottom: '10px' }}>
                    <li>• Optimal Fertility : 4.0 - 6.79 ng/ml</li>
                    <li>• Satisfactory fertility : 2.19 – 4.0 ng/ml</li>
                    <li>• Low Fertility : 0.3 – 2.19 ng/ml</li>
                    <li>• Very low : &lt; 0.3 ng/ml</li>
                    <li>• High Level : &gt; 6.79 ng/ml ( ? PCOD / Granulose cell tumors)</li>
                </ul>

                <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>
                    <u>AMH Reference ranges age wise :</u>
                </div>
                <table style={{ width: '70%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'left' }}>AGE (YEARS)</th>
                            <th style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'left' }}>Reference Range (ng/ml)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style={{ border: '1px solid black', padding: '2px 8px' }}>12 – 17</td><td style={{ border: '1px solid black', padding: '2px 8px' }}>3.16 – 4.82</td></tr>
                        <tr><td style={{ border: '1px solid black', padding: '2px 8px' }}>18-24</td><td style={{ border: '1px solid black', padding: '2px 8px' }}>4.10 – 5.12</td></tr>
                        <tr><td style={{ border: '1px solid black', padding: '2px 8px' }}>25-29</td><td style={{ border: '1px solid black', padding: '2px 8px' }}>2.82 – 3.76</td></tr>
                        <tr><td style={{ border: '1px solid black', padding: '2px 8px' }}>30 – 34</td><td style={{ border: '1px solid black', padding: '2px 8px' }}>900.4– 3.95</td></tr>
                        <tr><td style={{ border: '1px solid black', padding: '2px 8px' }}>35-39</td><td style={{ border: '1px solid black', padding: '2px 8px' }}>1.41-2.35</td></tr>
                        <tr><td style={{ border: '1px solid black', padding: '2px 8px' }}>40-44</td><td style={{ border: '1px solid black', padding: '2px 8px' }}>0.76-1.40</td></tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AMH_Table;
