import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ProgressBar } from 'react-bootstrap';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get('/api/skills/gaps/');
      setAnalyticsData(response.data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
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

  const { skill_gaps, overall_proficiency, heatmap_data } = analyticsData || {};

  // Prepare chart data
  const skillGapChartData = {
    labels: heatmap_data?.labels || [],
    datasets: [
      {
        label: 'Proficiency Level',
        data: heatmap_data?.data || [],
        backgroundColor: heatmap_data?.colors || [],
        borderColor: heatmap_data?.colors || [],
        borderWidth: 1,
      },
    ],
  };

  const skillGapChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Skill Gap Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value) {
            return (value * 100).toFixed(0) + '%';
          }
        }
      }
    }
  };

  const proficiencyDistributionData = {
    labels: ['Strong Areas', 'Moderate Areas', 'Weak Areas'],
    datasets: [
      {
        data: [
          overall_proficiency?.strong_areas || 0,
          (overall_proficiency?.total_topics || 0) - (overall_proficiency?.strong_areas || 0) - (overall_proficiency?.weak_areas || 0),
          overall_proficiency?.weak_areas || 0
        ],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const proficiencyDistributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Proficiency Distribution',
      },
    },
  };

  return (
    <div className="main-content">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">📊 Learning Analytics</h2>
          <p className="text-muted">
            Visualize your learning progress with interactive charts and detailed performance metrics.
          </p>
        </Col>
      </Row>

      {/* Overall Proficiency Summary */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h4 className="mb-3">Overall Learning Progress</h4>
              <Row className="g-4">
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-primary mb-2">
                      {(overall_proficiency?.average_proficiency * 100 || 0).toFixed(1)}%
                    </h3>
                    <p className="text-muted mb-0">Average Proficiency</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-success mb-2">{overall_proficiency?.strong_areas || 0}</h3>
                    <p className="text-muted mb-0">Strong Areas</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-warning mb-2">{overall_proficiency?.improvement_needed || 0}</h3>
                    <p className="text-muted mb-0">Need Improvement</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-info mb-2">{overall_proficiency?.total_topics || 0}</h3>
                    <p className="text-muted mb-0">Total Topics</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">Skill Gap Heatmap</h5>
              <div style={{ height: '400px' }}>
                <Bar data={skillGapChartData} options={skillGapChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">Proficiency Distribution</h5>
              <div style={{ height: '400px' }}>
                <Doughnut data={proficiencyDistributionData} options={proficiencyDistributionOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Skill Analysis */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">Detailed Skill Analysis</h5>
              <Row className="g-3">
                {skill_gaps?.map((skill, index) => (
                  <Col md={6} lg={4} key={index}>
                    <Card className="card-ai">
                      <Card.Body>
                        <h6 className="mb-2">{skill.topic?.name || 'Unknown Topic'}</h6>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between mb-1">
                            <small>Proficiency</small>
                            <small>{(skill.proficiency_level * 100).toFixed(1)}%</small>
                          </div>
                          <ProgressBar 
                            now={skill.proficiency_level * 100} 
                            className="progress-ai"
                            variant={
                              skill.proficiency_level >= 0.7 ? 'success' :
                              skill.proficiency_level >= 0.4 ? 'warning' : 'danger'
                            }
                          />
                        </div>
                        <div className="text-center">
                          <span className={`badge ${
                            skill.proficiency_level >= 0.7 ? 'bg-success' :
                            skill.proficiency_level >= 0.4 ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {skill.proficiency_level >= 0.7 ? 'Strong' :
                             skill.proficiency_level >= 0.4 ? 'Moderate' : 'Weak'}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Performance Insights */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">Performance Insights</h5>
              <Row className="g-3">
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <h6>🎯 Areas of Excellence</h6>
                    <p className="text-muted mb-2">
                      You're performing exceptionally well in these topics. Consider:
                    </p>
                    <ul className="small text-muted">
                      <li>Teaching others to reinforce your knowledge</li>
                      <li>Exploring advanced applications</li>
                      <li>Connecting concepts to related topics</li>
                    </ul>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <h6>📚 Areas for Improvement</h6>
                    <p className="text-muted mb-2">
                      Focus on these topics to enhance your overall proficiency:
                    </p>
                    <ul className="small text-muted">
                      <li>Review fundamental concepts</li>
                      <li>Practice with more exercises</li>
                      <li>Seek additional explanations</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Items */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">Recommended Actions</h5>
              <Row className="g-3">
                <Col md={4}>
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    size="lg"
                  >
                    📝 Take Practice Quiz
                  </Button>
                </Col>
                <Col md={4}>
                  <Button 
                    variant="outline-success" 
                    className="w-100"
                    size="lg"
                  >
                    🤖 Get AI Explanation
                  </Button>
                </Col>
                <Col md={4}>
                  <Button 
                    variant="outline-info" 
                    className="w-100"
                    size="lg"
                  >
                    📊 View Detailed Report
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Learning Tips */}
      <Row>
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">💡 Learning Tips</h5>
              <Row className="g-3">
                <Col md={6}>
                  <div className="d-flex align-items-start">
                    <span className="h4 me-3">🎯</span>
                    <div>
                      <h6>Focus on Weak Areas</h6>
                      <p className="text-muted small">
                        Prioritize topics where your proficiency is below 40%. 
                        Start with fundamentals and build up gradually.
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-start">
                    <span className="h4 me-3">🔄</span>
                    <div>
                      <h6>Regular Practice</h6>
                      <p className="text-muted small">
                        Take quizzes regularly to track your progress and 
                        maintain your strong areas while improving weak ones.
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-start">
                    <span className="h4 me-3">📚</span>
                    <div>
                      <h6>Use AI Explanations</h6>
                      <p className="text-muted small">
                        Leverage our AI tutor for topics you find challenging. 
                        Get personalized explanations based on your learning style.
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-start">
                    <span className="h4 me-3">🎯</span>
                    <div>
                      <h6>Teach Back Mode</h6>
                      <p className="text-muted small">
                        Use the teach-back feature to reinforce your understanding 
                        and identify gaps in your knowledge.
                      </p>
                    </div>
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

export default Analytics;
