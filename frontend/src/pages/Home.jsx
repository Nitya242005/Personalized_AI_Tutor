import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '🤖',
      title: 'AI Topic Explanation',
      description: 'Get instant, personalized explanations for any topic with AI-generated notes, key insights, and real-world applications.',
      link: '/explain-topic'
    },
    {
      icon: '📝',
      title: 'Adaptive Learning Quiz',
      description: 'Experience quizzes that adjust difficulty in real-time based on your performance, ensuring optimal learning pace.',
      link: '/adaptive-quiz'
    },
    {
      icon: '📊',
      title: 'Skill Gap Heatmap',
      description: 'Visualize your strengths and weaknesses with interactive charts that help identify areas for improvement.',
      link: '/analytics'
    },
    {
      icon: '🎯',
      title: 'Teach Back Mode',
      description: 'Reinforce learning by explaining topics back to our AI, receiving instant feedback and improvement suggestions.',
      link: '/teach-back'
    },
    {
      icon: '📋',
      title: 'Exam Readiness Report',
      description: 'Get comprehensive readiness assessments with mock test results, weak-area tips, and improvement resources.',
      link: '/exam-report'
    },
    {
      icon: '😊',
      title: 'Emotion-Aware Adaptation',
      description: 'Our AI detects your mood and adapts content style and difficulty to optimize your learning experience.',
      link: '/dashboard'
    }
  ];

  return (
    <div className="ai-tutor-container">
      <Container>
        {/* Hero Section */}
        <Row className="text-center text-white py-5">
          <Col>
            <h1 className="display-4 fw-bold mb-4">
              🧠 AI Personalized Tutor
            </h1>
            <p className="lead mb-4">
              Every learner is unique. Experience education that adapts to you in real-time, 
              offering custom learning paths, explanations, and feedback to maximize understanding and confidence.
            </p>
            {!isAuthenticated ? (
              <div>
                <Button 
                  as={Link} 
                  to="/register" 
                  size="lg" 
                  className="btn-ai-primary me-3"
                >
                  Get Started Free
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  size="lg" 
                  variant="outline-light"
                >
                  Sign In
                </Button>
              </div>
            ) : (
              <Button 
                as={Link} 
                to="/dashboard" 
                size="lg" 
                className="btn-ai-primary"
              >
                Go to Dashboard
              </Button>
            )}
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="py-5">
          <Col className="text-center mb-5">
            <h2 className="text-white fw-bold mb-3">Why Choose AI Personalized Tutor?</h2>
            <p className="text-white-50">
              Our unique features stand out because they merge adaptive learning with emotion recognition 
              and multi-modal explanations, which is uncommon in typical edtech platforms.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {features.map((feature, index) => (
            <Col key={index} lg={4} md={6}>
              <Card className="feature-card h-100 card-ai">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    {feature.icon}
                  </div>
                  <Card.Title className="fw-bold mb-3">{feature.title}</Card.Title>
                  <Card.Text className="text-muted mb-4">
                    {feature.description}
                  </Card.Text>
                  {isAuthenticated && (
                    <Button 
                      as={Link} 
                      to={feature.link} 
                      variant="outline-primary"
                      className="btn-ai-secondary"
                    >
                      Try Now
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* How It Works Section */}
        <Row className="py-5">
          <Col className="text-center">
            <h2 className="text-white fw-bold mb-5">How It Works</h2>
            <Row className="g-4">
              <Col md={4}>
                <div className="text-white">
                  <div className="h1 mb-3">1️⃣</div>
                  <h5>Sign Up & Profile</h5>
                  <p>Create your account and set your learning preferences and style.</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-white">
                  <div className="h1 mb-3">2️⃣</div>
                  <h5>AI Assessment</h5>
                  <p>Our AI analyzes your learning patterns and creates a personalized curriculum.</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-white">
                  <div className="h1 mb-3">3️⃣</div>
                  <h5>Adaptive Learning</h5>
                  <p>Experience real-time adaptation based on your performance and emotional state.</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* CTA Section */}
        <Row className="py-5">
          <Col className="text-center">
            <div className="bg-white rounded-3 p-5">
              <h2 className="fw-bold mb-3">Ready to Transform Your Learning?</h2>
              <p className="lead mb-4">
                Join thousands of students who are already experiencing the future of personalized education.
              </p>
              {!isAuthenticated ? (
                <Button 
                  as={Link} 
                  to="/register" 
                  size="lg" 
                  className="btn-ai-primary"
                >
                  Start Learning Today
                </Button>
              ) : (
                <Button 
                  as={Link} 
                  to="/dashboard" 
                  size="lg" 
                  className="btn-ai-primary"
                >
                  Continue Learning
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
