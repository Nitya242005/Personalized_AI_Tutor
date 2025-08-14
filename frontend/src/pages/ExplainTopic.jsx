import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ExplainTopic = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    topic_name: '',
    learning_style: 'visual'
  });
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExplanation(null);

    try {
      const response = await axios.post('/api/topics/explain/', formData);
      setExplanation(response.data.explanation);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate explanation');
      console.error('Explanation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">🔒 Authentication Required</h2>
            <p className="text-muted">
              Please log in to use the AI Topic Explanation feature.
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
          <h2 className="fw-bold">🤖 AI Topic Explanation</h2>
          <p className="text-muted">
            Get instant, personalized explanations for any topic with AI-generated notes, 
            key insights, and real-world applications.
          </p>
        </Col>
      </Row>

      {/* Input Form */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="card-ai">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Topic to Explain</Form.Label>
                      <Form.Control
                        type="text"
                        name="topic_name"
                        value={formData.topic_name}
                        onChange={handleChange}
                        className="form-control-ai"
                        placeholder="e.g., Machine Learning, Quantum Physics, Shakespeare..."
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Learning Style</Form.Label>
                      <Form.Select
                        name="learning_style"
                        value={formData.learning_style}
                        onChange={handleChange}
                        className="form-control-ai"
                      >
                        <option value="visual">Visual</option>
                        <option value="auditory">Auditory</option>
                        <option value="kinesthetic">Kinesthetic</option>
                        <option value="reading">Reading/Writing</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  type="submit"
                  className="btn-ai-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Generating Explanation...
                    </>
                  ) : (
                    'Generate Explanation'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="card-ai">
            <Card.Body>
              <h6>💡 Tips for Better Explanations</h6>
              <ul className="small text-muted">
                <li>Be specific with your topic</li>
                <li>Choose your preferred learning style</li>
                <li>Our AI adapts content to your needs</li>
                <li>Get visual diagrams for visual learners</li>
                <li>Receive practical examples and applications</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" className="alert-ai-danger">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Explanation Display */}
      {explanation && (
        <Row>
          <Col>
            <Card className="card-ai">
              <Card.Header>
                <h4 className="mb-0">
                  📚 Explanation: {explanation.topic?.name || 'Topic'}
                </h4>
                <small className="text-muted">
                  Generated for {formData.learning_style} learners
                </small>
              </Card.Header>
              <Card.Body>
                {/* Main Explanation */}
                <div className="mb-4">
                  <h5>📖 Comprehensive Explanation</h5>
                  <p className="lead">{explanation.explanation_text}</p>
                </div>

                {/* Key Points */}
                {explanation.key_points && explanation.key_points.length > 0 && (
                  <div className="mb-4">
                    <h5>🔑 Key Points</h5>
                    <ul className="list-unstyled">
                      {explanation.key_points.map((point, index) => (
                        <li key={index} className="mb-2">
                          <span className="badge bg-primary me-2">{index + 1}</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Visual Elements for Visual Learners */}
                {formData.learning_style === 'visual' && explanation.diagrams && explanation.diagrams.length > 0 && (
                  <div className="mb-4">
                    <h5>📊 Visual Elements</h5>
                    <Row className="g-3">
                      {explanation.diagrams.map((diagram, index) => (
                        <Col md={4} key={index}>
                          <Card className="card-ai">
                            <Card.Body className="text-center">
                              <div className="h3 mb-2">
                                {diagram.type === 'concept_map' && '🗺️'}
                                {diagram.type === 'flowchart' && '📈'}
                                {diagram.type === 'mind_map' && '🧠'}
                              </div>
                              <h6>{diagram.type.replace('_', ' ').toUpperCase()}</h6>
                              <p className="small text-muted">{diagram.description}</p>
                              {diagram.elements && (
                                <div className="small">
                                  {diagram.elements.map((element, idx) => (
                                    <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                      {element}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Real-World Applications */}
                {explanation.real_world_applications && explanation.real_world_applications.length > 0 && (
                  <div className="mb-4">
                    <h5>🌍 Real-World Applications</h5>
                    <Row className="g-3">
                      {explanation.real_world_applications.map((app, index) => (
                        <Col md={6} key={index}>
                          <Card className="card-ai">
                            <Card.Body>
                              <div className="d-flex align-items-center">
                                <span className="h4 me-3">💡</span>
                                <p className="mb-0">{app}</p>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Learning Style Specific Content */}
                {formData.learning_style === 'auditory' && (
                  <div className="mb-4">
                    <h5>🎧 Audio-Friendly Content</h5>
                    <p className="text-muted">
                      This explanation is optimized for auditory learners with conversational tone 
                      and easy-to-follow structure.
                    </p>
                  </div>
                )}

                {formData.learning_style === 'kinesthetic' && (
                  <div className="mb-4">
                    <h5>🖐️ Hands-On Learning</h5>
                    <p className="text-muted">
                      This explanation includes practical steps and activities for kinesthetic learners.
                    </p>
                  </div>
                )}

                {formData.learning_style === 'reading' && (
                  <div className="mb-4">
                    <h5>📚 Reading-Optimized</h5>
                    <p className="text-muted">
                      This explanation is structured for reading/writing learners with clear sections 
                      and detailed information.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="text-center mt-4">
                  <Button 
                    variant="outline-primary" 
                    className="me-2"
                    onClick={() => window.print()}
                  >
                    🖨️ Print Explanation
                  </Button>
                  <Button 
                    variant="outline-success"
                    className="me-2"
                  >
                    💾 Save to Notes
                  </Button>
                  <Button 
                    variant="outline-info"
                  >
                    🔄 Generate New Explanation
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ExplainTopic;
