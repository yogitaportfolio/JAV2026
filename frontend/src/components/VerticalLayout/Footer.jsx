import React from "react"
import { Link } from "react-router-dom"
import { Container, Row, Col } from "reactstrap"

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid={true}>
          <Row>
            <Col md={6}>
              Copyright © {new Date().getFullYear()}  Javitri Hospital & Test Tube Baby Centre
            </Col>
            <Col md={6}>
              <div className="text-sm-end d-none d-sm-block">
                Powered by - <span className="text-info" >  M14 Technologies</span>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  )
}

export default Footer
