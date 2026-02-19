import React from 'react';

const TSH_Table = ({ data }) => {
    // Default data if none provided
    const reportData = data || {
        prlResult: "N/A"
    };

    return (
        <>
   {/* TSH Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '10px', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'left', width: '35%' }}>INVESTIGATION</th>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '15%' }}>OBSERVED VALUES</th>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '10%' }}>UNITS</th>
                                <th style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', width: '40%' }}>Biological Reference Interval</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                    <strong>Thyroid Stimulating Hormone,Serum (T.S.H)</strong><br /><br />
                                    <strong>Method:Enzyme linked fluorescent assay (ELFA)</strong>
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><strong>{reportData.tshResult}</strong></span>
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                    <strong>uIU/ml</strong>
                                </td>
                                <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                                    <div style={{ padding: '8px', fontSize: '11px' }}>
                                        <strong>Euthyroid: 0.25 - 5 uIU/ml.</strong><br />
                                        <strong>Hyperthyroid: &lt; 0.15 uIU/ml.</strong><br />
                                        <strong>Hypothyroid: &gt; 7 uIU/ml.</strong>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* TSH Interpretation */}
                    <div style={{ fontSize: '11px', marginBottom: '20px' }}>
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            <li style={{ marginBottom: '4px' }}>Primary hyperthyroidism is accompanied by elevated serum T3 and T4 values along with depressed TSH levels.</li>
                            <li style={{ marginBottom: '4px' }}>Primary hypothyroidism is accompanied by depressed serum T3 and T4 values along with elevated TSH levels.</li>
                            <li style={{ marginBottom: '4px' }}>Normal T4 levels accompanied by high T3 levels are seen in patients with T3 thyrotoxicosis.</li>
                            <li style={{ marginBottom: '4px' }}>Slightly elevated T3 levels may be found in pregnancy and esterogen therapy, while depressed levels may be encountered in severe illness, malnutrition, renal failure and during therapy with drugs like propaniol and propylthiouracil.</li>
                            <li style={{ marginBottom: '4px' }}>Elevated TSH levels may also be indicative of TSH secreting pituitary tumour.</li>
                        </ul>
                    </div>

        </>
    );
};

export default TSH_Table;
