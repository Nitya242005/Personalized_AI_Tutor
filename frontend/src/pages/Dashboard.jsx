import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/');
      setDashboardData(response.data.dashboard);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  const { user_profile, performance_summary, recent_activity } = dashboardData || {};

  return (
    <div className="main-content">
      <div className="dashboard-stats">
        <Row>
          <Col>
            <h2 className="mb-3">Welcome back, {user_profile?.user?.username || 'Student'}! 👋</h2>
            <p className="mb-0">Here's your personalized learning overview</p>
          </Col>
        </Row>
      </div>

      {/* Performance Summary */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="card-ai text-center">
            <Card.Body>
              <h3 className="text-primary mb-2">{performance_summary?.total_quizzes || 0}</h3>
              <p className="text-muted mb-0">Total Quizzes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="card-ai text-center">
            <Card.Body>
              <h3 className="text-success mb-2">{performance_summary?.accuracy_percentage || 0}%</h3>
              <p className="text-muted mb-0">Accuracy</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="card-ai text-center">
            <Card.Body>
              <h3 className="text-info mb-2">{performance_summary?.strong_topics || 0}</h3>
              <p className="text-muted mb-0">Strong Topics</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="card-ai text-center">
            <Card.Body>
              <h3 className="text-warning mb-2">{performance_summary?.weak_topics || 0}</h3>
              <p className="text-muted mb-0">Weak Topics</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h4 className="mb-3">Quick Actions</h4>
              <Row className="g-3">
                <Col md={4}>
                  <Button 
                    as={Link} 
                    to="/explain-topic" 
                    className="btn-ai-primary w-100"
                    size="lg"
                  >
                    🤖 Explain Topic
                  </Button>
                </Col>
                <Col md={4}>
                  <Button 
                    as={Link} 
                    to="/adaptive-quiz" 
                    className="btn-ai-secondary w-100"
                    size="lg"
                  >
                    📝 Take Quiz
                  </Button>
                </Col>
                <Col md={4}>
                  <Button 
                    as={Link} 
                    to="/analytics" 
                    variant="outline-primary"
                    className="w-100"
                    size="lg"
                  >
                    📊 View Analytics
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="card-ai h-100">
            <Card.Body>
              <h5 className="mb-3">Recent Quiz Attempts</h5>
              {recent_activity?.quiz_attempts?.length > 0 ? (
                recent_activity.quiz_attempts.map((attempt, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">
                      {attempt.quiz?.topic?.name || 'Unknown Topic'}
                    </span>
                    <span className={`badge ${attempt.is_correct ? 'bg-success' : 'bg-danger'}`}>
                      {attempt.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted">No quiz attempts yet. Start learning!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="card-ai h-100">
            <Card.Body>
              <h5 className="mb-3">Recent Explanations</h5>
              {recent_activity?.explanations?.length > 0 ? (
                recent_activity.explanations.map((explanation, index) => (
                  <div key={index} className="mb-2">
                    <div className="fw-bold">{explanation.topic?.name || 'Unknown Topic'}</div>
                    <small className="text-muted">
                      {new Date(explanation.created_at).toLocaleDateString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className="text-muted">No explanations generated yet. Try explaining a topic!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Learning Progress */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">Learning Progress</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Overall Progress</span>
                  <span>{performance_summary?.accuracy_percentage || 0}%</span>
                </div>
                <ProgressBar 
                  now={performance_summary?.accuracy_percentage || 0} 
                  className="progress-ai"
                />
              </div>
              <div className="text-center">
                <Button 
                  as={Link} 
                  to="/analytics" 
                  variant="outline-primary"
                  size="sm"
                >
                  View Detailed Progress
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Feature Cards */}
      <Row className="g-4">
        <Col md={4}>
          <Card className="card-ai h-100">
            <Card.Body className="text-center">
              <div className="h1 mb-3">🎯</div>
              <h5>Teach Back Mode</h5>
              <p className="text-muted">
                Reinforce your learning by explaining topics back to our AI
              </p>
              <Button 
                as={Link} 
                to="/teach-back" 
                variant="outline-primary"
                size="sm"
              >
                Try Now
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="card-ai h-100">
            <Card.Body className="text-center">
              <div className="h1 mb-3">🎭</div>
              <h5>Emotion Detection</h5>
              <p className="text-muted">
                Let our AI adapt to your emotional state for better learning
              </p>
              <Button 
                as={Link} 
                to="/emotion-detection" 
                variant="outline-primary"
                size="sm"
              >
                Try Now
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="card-ai h-100">
            <Card.Body className="text-center">
              <div className="h1 mb-3">📋</div>
              <h5>Exam Readiness</h5>
              <p className="text-muted">
                Assess your readiness with comprehensive mock tests
              </p>
              <Button 
                as={Link} 
                to="/exam-report" 
                variant="outline-primary"
                size="sm"
              >
                Check Readiness
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
