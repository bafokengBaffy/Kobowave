import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>🎬 KoboWave</h5>
            <p className="mb-0">
              Your ultimate movie and restaurant review platform.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">&copy; 2024 KoboWave.</p>
            <small className="text-muted">
              Ports: Frontend (3000) | Backend (5000)
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
