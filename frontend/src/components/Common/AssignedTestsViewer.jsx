import React from 'react';
import { Badge, UncontrolledPopover, PopoverHeader, PopoverBody, Row, Col } from 'reactstrap';

const AssignedTestsViewer = ({ wifeTests = [], husbandTests = [], id }) => {
    const wCount = wifeTests?.length || 0;
    const hCount = husbandTests?.length || 0;
    const totalCount = wCount + hCount;

    if (totalCount === 0) return <span className="text-muted">-</span>;

    const popoverId = `tests-popover-${id}`;

    return (
        <>
            <Badge
                id={popoverId}
                color="light"
                className="border shadow-sm text-primary cursor-pointer px-2 py-1"
                style={{ cursor: 'pointer' }}
            >
                <i className="bx bx-list-ul me-1"></i>
                {wCount} / {hCount}
            </Badge>

            <UncontrolledPopover
            id={popoverId}
                trigger="legacy"
                placement="bottom"
                target={popoverId}
                className="shadow-lg border-0"
            >
                <PopoverHeader className="bg-primary text-white border-0">
                    Below are the assigned tests details
                </PopoverHeader>
                <PopoverBody className="">
                    <Row>
                        <Col md={6} className="border-end">
                            <h6 className="text-info fw-bold mb-2">
                                {/* <i className="bx bx-female me-1"></i> Wife ({wCount}) */}
                                <i className="bx bx-female me-1"></i> Wife 
                            </h6>
                            <ul className="list-unstyled mb-0" style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '11px' }}>
                                {wifeTests.length > 0 ? wifeTests.map((t, i) => (
                                    <li key={i} className="mb-1 text-truncate" title={t.test_name}>
                                        <span className="text-muted pe-1">{i + 1}.</span>
                                        {/* {t.test_name} {t.test_code ? `(${t.test_code})` : ''} */}
                                        {t.test_code} 
                                    </li>
                                )) : <li className="text-muted italic">None</li>}
                            </ul>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-primary fw-bold mb-2">
                                {/* <i className="bx bx-male me-1"></i> Husband ({hCount}) */}
                                <i className="bx bx-male me-1"></i> Husband 
                            </h6>
                            <ul className="list-unstyled mb-0" style={{ maxHeight: '200px', overflow: 'auto', fontSize: '11px' }}>
                                {husbandTests.length > 0 ? husbandTests.map((t, i) => (
                                    <li key={i} className="mb-1 text-truncate" title={t.test_name}>
                                        <span className="text-muted pe-1">{i + 1}.</span>
                                        {/* {t.test_name} {t.test_code ? `(${t.test_code})` : ''} */}
                                        {t.test_code}
                                    </li>
                                )) : <li className="text-muted italic">None</li>}
                            </ul>
                        </Col>
                    </Row>
                </PopoverBody>
            </UncontrolledPopover>
        </>
    );
};

export default AssignedTestsViewer;
