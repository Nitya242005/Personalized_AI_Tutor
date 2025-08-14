import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TeachBack = () => {
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic || !explanation.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/teach-back/', {
        topic_id: selectedTopic,
        student_explanation: explanation
      });

      setFeedback(response.data.teach_back);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit explanation');
      console.error('Teach-back error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setExplanation('');
    setSubmitted(false);
    setFeedback(null);
    setError('');
  };

  const getCorrectnessColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.4) return 'warning';
    return 'danger';
  };

  const getCorrectnessText = (score) => {
    if (score >= 0.7) return 'Excellent Understanding';
    if (score >= 0.4) return 'Good Understanding';
    return 'Needs Improvement';
  };

  if (submitted && feedback) {
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">🎯 Teach-Back Results</h2>
            <p className="text-muted">
              Here's your AI feedback and improvement suggestions.
            </p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Card className="card-ai">
              <Card.Header>
                <h4 className="mb-0">📊 Performance Summary</h4>
              </Card.Header>
              <Card.Body>
                <Row className="g-4">
                  <Col md={4}>
                    <div className="text-center">
                      <h3 className={`text-${getCorrectnessColor(feedback.correctness_score)} mb-2`}>
                        {(feedback.correctness_score * 100).toFixed(1)}%
                      </h3>
                      <p className="text-muted mb-0">Understanding Score</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h3 className="text-info mb-2">
                        {feedback.improvement_suggestions?.length || 0}
                      </h3>
                      <p className="text-muted mb-0">Improvement Tips</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h3 className="text-primary mb-2">
                        {topics.find(t => t.id === feedback.topic?.id)?.name || 'Topic'}
                      </h3>
                      <p className="text-muted mb-0">Topic Covered</p>
                    </div>
                  </Col>
                </Row>

                <div className="mt-4">
                  <h6>Understanding Level</h6>
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2">{getCorrectnessText(feedback.correctness_score)}</span>
                    <span className="badge bg-secondary ms-auto">
                      {(feedback.correctness_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    now={feedback.correctness_score * 100}
                    className="progress-ai"
                    variant={getCorrectnessColor(feedback.correctness_score)}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Card className="card-ai">
              <Card.Header>
                <h5 className="mb-0">🤖 AI Feedback</h5>
              </Card.Header>
              <Card.Body>
                <div className="p-3 bg-light rounded mb-3">
                  <h6>Your Explanation:</h6>
                  <p className="mb-0 text-muted">{feedback.student_explanation}</p>
                </div>

                <div className="p-3 bg-primary bg-opacity-10 rounded">
                  <h6>AI Analysis:</h6>
                  <p className="mb-0">{feedback.ai_feedback}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {feedback.improvement_suggestions && feedback.improvement_suggestions.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="card-ai">
                <Card.Header>
                  <h5 className="mb-0">💡 Improvement Suggestions</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    {feedback.improvement_suggestions.map((suggestion, index) => (
                      <Col md={6} key={index}>
                        <div className="d-flex align-items-start">
                          <span className="badge bg-primary me-2">{index + 1}</span>
                          <p className="mb-0">{suggestion}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row className="mb-4">
          <Col className="text-center">
            <Button onClick={resetForm} className="btn-ai-primary me-2">
              🔄 Try Another Topic
            </Button>
            <Button variant="outline-primary" onClick={() => window.history.back()}>
              📚 Back to Learning
            </Button>
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
              Please log in to use the Teach-Back feature.
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
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <Card>
              <Card.Header>
                <h4 className="mb-0">📝 Teach-Back</h4>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {topicsLoading ? (
                  <div className="text-center">
                    <Spinner animation="border" />
                    <p>Loading topics...</p>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Topic</Form.Label>
                      <Form.Select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
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
                        {topicsLoading ? 'Loading available topics...' : topics.length === 0 ? 'No topics available at the moment.' : 'Choose the topic you want to explain.'}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Your Explanation</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Explain the topic in your own words..."
                        required
                      />
                    </Form.Group>

                    <div className="text-center">
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />{' '}
                            Submitting...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TeachBack;
