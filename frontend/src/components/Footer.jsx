import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>🧠 AI Personalized Tutor</h5>
            <p className="text-muted">
              Revolutionizing education with AI-powered personalized learning experiences.
            </p>
          </Col>
          <Col md={3}>
            <h6>Features</h6>
            <ul className="list-unstyled">
              <li>AI Topic Explanations</li>
              <li>Adaptive Quizzes</li>
              <li>Emotion Detection</li>
              <li>Skill Gap Analysis</li>
            </ul>
          </Col>
          <Col md={3}>
            <h6>Contact</h6>
            <ul className="list-unstyled">
              <li>Email: info@aitutor.com</li>
              <li>Support: support@aitutor.com</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              © 2024 AI Personalized Tutor. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
