import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";

const About = () => {
  const techStack = {
    frontend: ["React", "Bootstrap", "CSS3", "JavaScript"],
    backend: ["Node.js", "Express.js", "Firebase", "REST API"],
    database: ["Firestore", "Mock Data"],
    apis: ["TMDB API", "OMDb API"],
  };

  const features = [
    "Movie search and discovery",
    "Restaurant listings and reviews",
    "User review system",
    "Responsive design",
    "Real-time data from external APIs",
  ];

  return (
    <Container className="my-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-4">ℹ️ About KoboWave</h1>

          <Card className="p-4 mb-4">
            <h3 className="text-primary">Our Mission</h3>
            <p className="lead">
              KoboWave is a community-driven platform that brings together movie
              enthusiasts and food lovers in one place. We believe in the power
              of shared experiences and authentic reviews.
            </p>
            <p>
              Whether you're looking for your next movie to watch or a great
              place to dine, KoboWave helps you make informed decisions based on
              real community feedback.
            </p>
          </Card>

          <Card className="p-4 mb-4">
            <h3 className="text-success">Features</h3>
            <Row>
              <Col md={6}>
                <ul className="list-unstyled">
                  {features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="mb-2">
                      ✅ {feature}
                    </li>
                  ))}
                </ul>
              </Col>
              <Col md={6}>
                <ul className="list-unstyled">
                  {features.slice(3).map((feature, index) => (
                    <li key={index} className="mb-2">
                      ✅ {feature}
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
          </Card>

          <Card className="p-4 mb-4">
            <h3 className="text-info">Technology Stack</h3>
            <Row>
              <Col md={6}>
                <h5>Frontend</h5>
                {techStack.frontend.map((tech) => (
                  <Badge key={tech} bg="primary" className="me-1 mb-1">
                    {tech}
                  </Badge>
                ))}

                <h5 className="mt-3">Backend</h5>
                {techStack.backend.map((tech) => (
                  <Badge key={tech} bg="success" className="me-1 mb-1">
                    {tech}
                  </Badge>
                ))}
              </Col>
              <Col md={6}>
                <h5>Database</h5>
                {techStack.database.map((tech) => (
                  <Badge key={tech} bg="warning" className="me-1 mb-1">
                    {tech}
                  </Badge>
                ))}

                <h5 className="mt-3">APIs</h5>
                {techStack.apis.map((tech) => (
                  <Badge key={tech} bg="info" className="me-1 mb-1">
                    {tech}
                  </Badge>
                ))}
              </Col>
            </Row>
          </Card>

          <Card className="p-4">
            <h3 className="text-warning">Development Information</h3>
            <Row>
              <Col md={6}>
                <strong>Project Name:</strong> KoboWave
                <br />
                <strong>Author:</strong> Bafokeng Khoali (@BaffyKay)
                <br />
                <strong>Version:</strong> 1.0.0
                <br />
              </Col>
              <Col md={6}>
                <strong>Frontend Port:</strong> 3000
                <br />
                <strong>Backend Port:</strong> 5000
                <br />
                <strong>Environment:</strong> Development
                <br />
              </Col>
            </Row>
            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted">
                This is a full-stack application built for educational purposes.
                It demonstrates modern web development practices with React,
                Node.js, and external API integrations.
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
