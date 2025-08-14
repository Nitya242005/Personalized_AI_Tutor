import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Image } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EmotionDetection = () => {
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">🔒 Authentication Required</h2>
            <p className="text-muted">
              Please log in to use the Emotion Detection feature.
            </p>
            <Button as="a" href="/login" variant="primary">
              Go to Login
            </Button>
          </Col>
        </Row>
      </div>
    );
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const base64Image = await convertImageToBase64(selectedImage);
      
      const response = await axios.post('/api/emotion/detect/', {
        image_data: base64Image,
        session_id: `session_${Date.now()}`
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to detect emotion');
      console.error('Emotion detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      'happy': 'success',
      'sad': 'info',
      'angry': 'danger',
      'fearful': 'warning',
      'surprised': 'primary',
      'disgusted': 'secondary',
      'neutral': 'dark'
    };
    return colors[emotion.toLowerCase()] || 'primary';
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'fearful': '😨',
      'surprised': '😲',
      'disgusted': '🤢',
      'neutral': '😐'
    };
    return icons[emotion.toLowerCase()] || '🤔';
  };

  if (result) {
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">🎭 Emotion Detection Results</h2>
            <p className="text-muted">
              Here's what our AI detected from your image.
            </p>
          </Col>
        </Row>

        {/* Results Display */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="card-ai">
              <Card.Header>
                <h5 className="mb-0">📸 Your Image</h5>
              </Card.Header>
              <Card.Body className="text-center">
                {imagePreview && (
                  <Image 
                    src={imagePreview} 
                    alt="Uploaded" 
                    fluid 
                    className="mb-3"
                    style={{ maxHeight: '300px' }}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="card-ai">
              <Card.Header>
                <h5 className="mb-0">🎯 Detection Results</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-4">
                  <div className="h1 mb-2">
                    {getEmotionIcon(result.emotion_result?.detected_emotion)}
                  </div>
                  <h3 className={`text-${getEmotionColor(result.emotion_result?.detected_emotion)}`}>
                    {result.emotion_result?.detected_emotion || 'Unknown'}
                  </h3>
                  <p className="text-muted">
                    Confidence: {(result.emotion_result?.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>

                {result.insights && (
                  <div className="mb-3">
                    <h6>💡 Insights</h6>
                    <p className="text-muted">{result.insights.learning_recommendations}</p>
                  </div>
                )}

                <div className="text-center">
                  <Button onClick={resetForm} variant="outline-primary" className="me-2">
                    🔄 Try Another Image
                  </Button>
                  <Button variant="outline-secondary" onClick={() => window.history.back()}>
                    📚 Back to Learning
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">🎭 Emotion Detection</h2>
          <p className="text-muted">
            Upload an image to detect your emotional state and get personalized learning recommendations.
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="card-ai">
            <Card.Header>
              <h4 className="mb-0">📸 Upload Image for Analysis</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Select Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="form-control-ai"
                    required
                  />
                  <Form.Text className="text-muted">
                    Upload a clear image of your face for accurate emotion detection.
                  </Form.Text>
                </Form.Group>

                {imagePreview && (
                  <div className="text-center mb-4">
                    <h6>Image Preview:</h6>
                    <Image 
                      src={imagePreview} 
                      alt="Preview" 
                      fluid 
                      style={{ maxHeight: '200px' }}
                      className="border rounded"
                    />
                  </div>
                )}

                <div className="text-center">
                  <Button
                    type="submit"
                    className="btn-ai-primary"
                    disabled={loading || !selectedImage}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Analyzing Emotion...
                      </>
                    ) : (
                      'Detect Emotion'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* How It Works */}
      <Row className="mt-5">
        <Col>
          <Card className="card-ai">
            <Card.Body>
              <h5 className="mb-3">💡 How Emotion Detection Works</h5>
              <Row className="g-3">
                <Col md={4}>
                  <div className="text-center">
                    <div className="h2 mb-2">📸</div>
                    <h6>Upload Image</h6>
                    <p className="text-muted small">
                      Take a clear photo of your face or upload an existing image
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <div className="h2 mb-2">🤖</div>
                    <h6>AI Analysis</h6>
                    <p className="text-muted small">
                      Our AI analyzes facial expressions to detect emotions
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <div className="h2 mb-2">🎯</div>
                    <h6>Personalized Tips</h6>
                    <p className="text-muted small">
                      Get learning recommendations based on your emotional state
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

export default EmotionDetection;
