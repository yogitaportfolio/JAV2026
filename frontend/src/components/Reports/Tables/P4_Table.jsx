import React from 'react';

const P4_Table = ({ data }) => {
    // Default data if none provided
    const reportData = data || {
        e2Result: "N/A"
    };

    return (

        <>
           <h6 className="text-center mb-2 mt-2"><strong>HORMONE & IMMUNOLOGY ASSAY</strong></h6>

                    {/* P4 Table */}
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
                                    <strong>PROGESTERONE,Serum (P4)</strong><br /><br />
                                    <strong>Method:</strong> Enzyme linked fluorescent assay(ELFA)
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}><strong>{reportData.p4Result}</strong></span>
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                    <strong>ng/ml</strong>
                                </td>
                                <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
  <tbody>
    {/* MEN ROW WITH BORDER */}
    <tr>
      <td
        style={{
          borderBottom: '1px solid black',
          borderRight: '1px solid black',
          padding: '2px 6px',
          fontWeight: 'bold',
          width: '55%'
        }}
      >
        Men
      </td>
      <td
        style={{
          borderBottom: '1px solid black',
          padding: '2px 6px',
          fontWeight: 'bold'
        }}
      >
        0.11 – 0.56 ng/ml
      </td>
    </tr>

    {/* WOMEN HEADER */}
    <tr>
      <td colSpan={2} style={{ padding: '4px 6px', fontWeight: 'bold' }}>
        Women:
      </td>
    </tr>

    {/* WOMEN PHASES */}
    <tr>
      <td style={{ padding: '2px 6px' }}>Ovulation Phase</td>
      <td style={{ padding: '2px 6px' }}>0.12 – 6.22 ng/ml</td>
    </tr>

    <tr>
      <td style={{ padding: '2px 6px' }}>Follicular Phase</td>
      <td style={{ padding: '2px 6px' }}>0.10 – 0.54 ng/ml</td>
    </tr>

    <tr>
      <td style={{ padding: '2px 6px' }}>Luteal Phase</td>
      <td style={{ padding: '2px 6px' }}>1.5 – 20 ng/ml</td>
    </tr>

    <tr>
      <td style={{ padding: '2px 6px' }}>Menopause</td>
      <td style={{ padding: '2px 6px' }}>0.1 – 0.41 ng/ml</td>
    </tr>
  </tbody>



                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                
        </>
    );
};

export default P4_Table;
