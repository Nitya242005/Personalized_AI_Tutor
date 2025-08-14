import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ExamReport = () => {
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTopics();
    }
  }, [isAuthenticated]);

  const fetchTopics = async () => {
    setTopicsLoading(true);
    try {
      const response = await axios.get('/api/topics/');
      const data = response.data;

      if (data.results) {
        setTopics(data.results);
        if (data.results.length > 0) setSelectedTopic(data.results[0].id);
      } else if (Array.isArray(data)) {
        setTopics(data);
        if (data.length > 0) setSelectedTopic(data[0].id);
      } else {
        setTopics([]);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  const generateReport = async (e) => {
    e.preventDefault();
    if (!selectedTopic) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await axios.post('/api/exam/readiness/', {
        topic_id: selectedTopic,
        include_mock_test: true
      });

      setReport(response.data.readiness_report);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate readiness report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getReadinessText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getReadinessIcon = (score) => {
    if (score >= 80) return '🏆';
    if (score >= 60) return '🎯';
    if (score >= 40) return '📚';
    return '⚠️';
  };

  if (report) {
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">📋 Exam Readiness Report</h2>
            <p className="text-muted">
              Comprehensive assessment of your readiness for {report.topic?.name || 'the selected topic'}.
            </p>
          </Col>
        </Row>

        {/* Readiness Score */}
        <Row className="mb-4">
          <Col>
            <Card className="card-ai">
              <Card.Body className="text-center">
                <div className="h1 mb-3">{getReadinessIcon(report.readiness_score)}</div>
                <h2 className="mb-2">
                  Readiness Score: {report.readiness_score}%
                </h2>
                <h4 className={`text-${getReadinessColor(report.readiness_score)} mb-3`}>
                  {getReadinessText(report.readiness_score)}
                </h4>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Overall Readiness</span>
                    <span>{report.readiness_score}%</span>
                  </div>
                  <ProgressBar 
                    now={report.readiness_score} 
                    className="progress-ai"
                    variant={getReadinessColor(report.readiness_score)}
                    style={{ height: '20px' }}
                  />
                </div>

                <Button 
                  variant="outline-primary"
                  onClick={() => setReport(null)}
                >
                  🔄 Generate Another Report
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Mock Test Results */}
        {report.mock_test_results && Object.keys(report.mock_test_results).length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="card-ai">
                <Card.Header>
                  <h5 className="mb-0">📝 Mock Test Results</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-4">
                    <Col md={4}>
                      <div className="text-center">
                        <h4 className="text-primary mb-2">
                          {report.mock_test_results.performance_level}
                        </h4>
                        <p className="text-muted mb-0">Performance Level</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h4 className="text-success mb-2">
                          {report.mock_test_results.estimated_score_range}
                        </h4>
                        <p className="text-muted mb-0">Estimated Score Range</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h4 className="text-info mb-2">
                          {report.mock_test_results.recommendations?.length || 0}
                        </h4>
                        <p className="text-muted mb-0">Recommendations</p>
                      </div>
                    </Col>
                  </Row>

                  {report.mock_test_results.recommendations && (
                    <div className="mt-4">
                      <h6>Key Recommendations:</h6>
                      <ul>
                        {report.mock_test_results.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Weak Areas */}
        {report.weak_areas && report.weak_areas.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="card-ai">
                <Card.Header>
                  <h5 className="mb-0">⚠️ Areas Needing Improvement</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    {report.weak_areas.map((area, index) => (
                      <Col md={6} key={index}>
                        <div className="d-flex align-items-start">
                          <span className="badge bg-warning me-2">{index + 1}</span>
                          <p className="mb-0">{area}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Improvement Resources */}
        {report.improvement_resources && report.improvement_resources.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="card-ai">
                <Card.Header>
                  <h5 className="mb-0">📚 Improvement Resources</h5>
                </Card.Header>
                <Card.Body>
                  {report.improvement_resources.map((resource, index) => (
                    <div key={index} className="mb-4">
                      <h6 className="text-primary">{resource.area}</h6>
                      <ul>
                        {resource.resources.map((res, resIndex) => (
                          <li key={resIndex}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Action Plan */}
        <Row className="mb-4">
          <Col>
            <Card className="card-ai">
              <Card.Body>
                <h5 className="mb-3">🎯 Recommended Action Plan</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <h6>Immediate Actions (This Week)</h6>
                      <ul className="small text-muted">
                        <li>Review fundamental concepts</li>
                        <li>Take practice quizzes</li>
                        <li>Use AI explanations for weak areas</li>
                      </ul>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <h6>Long-term Strategy (Next Month)</h6>
                      <ul className="small text-muted">
                        <li>Regular practice sessions</li>
                        <li>Teach-back mode practice</li>
                        <li>Track progress with analytics</li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Next Steps */}
        <Row>
          <Col>
            <Card className="card-ai">
              <Card.Body>
                <h5 className="mb-3">🚀 Next Steps</h5>
                <Row className="g-3">
                  <Col md={4}>
                    <Button 
                      variant="outline-primary" 
                      className="w-100"
                      size="lg"
                    >
                      📝 Practice Quiz
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button 
                      variant="outline-success" 
                      className="w-100"
                      size="lg"
                    >
                      🤖 AI Explanation
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button 
                      variant="outline-info" 
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
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">🔒 Authentication Required</h2>
            <p className="text-muted">
              Please log in to use the Exam Readiness Assessment feature.
            </p>
            <Button as="a" href="/login" variant="primary">
              Go to Login
            </Button>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">📋 Exam Readiness Assessment</h2>
          <p className="text-muted">
            Get comprehensive readiness assessments with mock test results, 
            weak-area identification, and personalized improvement resources.
          </p>
        </Col>
      </Row>

      {/* How It Works */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">💡 How the Assessment Works</h5>
              <Row className="g-3">
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-2">📊</div>
                    <h6>Analyze Performance</h6>
                    <p className="text-muted small">Review your quiz history and learning patterns</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-2">🎯</div>
                    <h6>Identify Weak Areas</h6>
                    <p className="text-muted small">Pinpoint topics that need improvement</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-2">📝</div>
                    <h6>Mock Test Simulation</h6>
                    <p className="text-muted small">Predict your exam performance</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-2">📚</div>
                    <h6>Provide Resources</h6>
                    <p className="text-muted small">Get personalized improvement tips</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assessment Form */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">📋 Generate Readiness Report</h5>
              
              {error && (
                <Alert variant="danger" className="alert-ai-danger mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={generateReport}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Topic for Assessment</Form.Label>
                  <Form.Select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="form-control-ai"
                    required
                    disabled={topicsLoading || topics.length === 0}
                  >
                    {topicsLoading ? (
                      <option>Loading topics...</option>
                    ) : topics.length === 0 ? (
                      <option>No topics available</option>
                    ) : (
                      Array.isArray(topics) && topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))
                    )}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {topicsLoading ? 'Loading available topics...' : topics.length === 0 ? 'No topics available at the moment.' : 'Choose the topic you want to assess your readiness for.'}
                  </Form.Text>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-ai-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Generating Report...
                    </>
                  ) : (
                    'Generate Readiness Report'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="card-ai">
            <Card.Body>
              <h6>📊 What You'll Get</h6>
              <ul className="small text-muted">
                <li>Overall readiness score</li>
                <li>Mock test performance prediction</li>
                <li>Weak area identification</li>
                <li>Personalized improvement resources</li>
                <li>Action plan recommendations</li>
                <li>Progress tracking insights</li>
              </ul>

              <hr />

              <h6>🎯 Assessment Criteria</h6>
              <ul className="small text-muted">
                <li>Quiz performance history</li>
                <li>Difficulty level progression</li>
                <li>Time-based performance</li>
                <li>Concept understanding depth</li>
                <li>Learning consistency</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Benefits */}
      <Row>
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">🌟 Benefits of Readiness Assessment</h5>
              <Row className="g-3">
                <Col md={4}>
                  <div className="text-center p-3">
                    <div className="h2 mb-2">🎯</div>
                    <h6>Targeted Preparation</h6>
                    <p className="text-muted small">
                      Focus your study efforts on areas that need the most attention
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <div className="h2 mb-2">📈</div>
                    <h6>Performance Prediction</h6>
                    <p className="text-muted small">
                      Get realistic expectations for your exam performance
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <div className="h2 mb-2">🚀</div>
                    <h6>Confidence Building</h6>
                    <p className="text-muted small">
                      Build confidence through targeted practice and improvement
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExamReport;
