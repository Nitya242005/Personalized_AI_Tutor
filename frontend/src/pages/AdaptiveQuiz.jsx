import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AdaptiveQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeStarted, setTimeStarted] = useState(null);
  const [error, setError] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState(1);

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/quiz/adaptive/', {
        params: {
          topic_id: 1,
          num_questions: 5
        }
      });
      
      setQuestions(response.data.questions);
      setCurrentDifficulty(response.data.current_difficulty);
      setQuizStarted(true);
      setTimeStarted(Date.now());
    } catch (err) {
      setError('Failed to load quiz questions');
      console.error('Quiz loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Math.floor((Date.now() - timeStarted) / 1000);

    try {
      const response = await axios.post('/api/quiz/adaptive/', {
        quiz_id: currentQuestion.id,
        selected_option_id: selectedAnswer,
        time_taken: timeTaken
      });

      // Update score
      if (response.data.result.is_correct) {
        setScore(score + currentQuestion.points);
      }

      // Move to next question or complete quiz
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimeStarted(Date.now());
        
        // Update difficulty if provided
        if (response.data.result.new_difficulty) {
          setCurrentDifficulty(response.data.result.new_difficulty);
        }
      } else {
        setQuizCompleted(true);
      }
    } catch (err) {
      setError('Failed to submit answer');
      console.error('Answer submission error:', err);
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Beginner';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'danger';
      default: return 'success';
    }
  };

  if (!quizStarted) {
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">📝 Adaptive Learning Quiz</h2>
            <p className="text-muted">
              Experience quizzes that adjust difficulty in real-time based on your performance, 
              ensuring optimal learning pace.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="card-ai text-center">
              <Card.Body className="p-5">
                <div className="h1 mb-4">🧠</div>
                <h3 className="mb-3">Ready to Test Your Knowledge?</h3>
                <p className="text-muted mb-4">
                  Our AI will adapt the difficulty based on your performance, 
                  ensuring you're always challenged at the right level.
                </p>
                
                {error && (
                  <Alert variant="danger" className="alert-ai-danger mb-3">
                    {error}
                  </Alert>
                )}

                <Button
                  onClick={startQuiz}
                  className="btn-ai-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading Quiz...
                    </>
                  ) : (
                    'Start Quiz'
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (quizCompleted) {
    const accuracy = (score / questions.reduce((total, q) => total + q.points, 0)) * 100;
    
    return (
      <div className="main-content">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">🎉 Quiz Completed!</h2>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="card-ai text-center">
              <Card.Body className="p-5">
                <div className="h1 mb-4">🏆</div>
                <h3 className="mb-3">Great Job!</h3>
                
                <Row className="g-4 mb-4">
                  <Col md={4}>
                    <div className="text-center">
                      <h4 className="text-primary">{score}</h4>
                      <p className="text-muted mb-0">Total Score</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h4 className="text-success">{accuracy.toFixed(1)}%</h4>
                      <p className="text-muted mb-0">Accuracy</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h4 className="text-info">{questions.length}</h4>
                      <p className="text-muted mb-0">Questions</p>
                    </div>
                  </Col>
                </Row>

                <div className="mb-4">
                  <h5>Performance Analysis</h5>
                  <p className="text-muted">
                    {accuracy >= 80 ? 'Excellent performance! You have a strong understanding of this topic.' :
                     accuracy >= 60 ? 'Good work! Keep practicing to improve further.' :
                     'Keep learning! Review the material and try again.'}
                  </p>
                </div>

                <div className="d-grid gap-2 d-md-block">
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="btn-ai-primary me-md-2"
                  >
                    🔄 Take Another Quiz
                  </Button>
                  <Button 
                    variant="outline-primary"
                    onClick={() => setQuizStarted(false)}
                  >
                    📊 View Analytics
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="main-content">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">📝 Adaptive Quiz</h2>
          <p className="text-muted">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar now={progress} className="progress-ai" />
        </Col>
      </Row>

      {/* Current Difficulty */}
      <Row className="mb-4">
        <Col>
          <Alert variant={getDifficultyColor(currentDifficulty)} className="text-center">
            <strong>Current Difficulty:</strong> {getDifficultyText(currentDifficulty)} Level
          </Alert>
        </Col>
      </Row>

      {/* Question Card */}
      <Row className="mb-4">
        <Col>
          <Card className="card-ai">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span className="badge bg-primary">Question {currentQuestionIndex + 1}</span>
                <span className="badge bg-secondary">{getDifficultyText(currentQuestion.difficulty_level)}</span>
              </div>
            </Card.Header>
            <Card.Body>
              <h5 className="mb-4">{currentQuestion.question_text}</h5>
              
              <Form>
                {currentQuestion.options.map((option) => (
                  <Form.Check
                    key={option.id}
                    type="radio"
                    id={`option-${option.id}`}
                    name="answer"
                    label={option.text}
                    checked={selectedAnswer === option.id}
                    onChange={() => setSelectedAnswer(option.id)}
                    className="mb-3"
                  />
                ))}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation */}
      <Row>
        <Col className="text-center">
          <Button
            onClick={submitAnswer}
            className="btn-ai-primary btn-lg"
            disabled={!selectedAnswer}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </Col>
      </Row>

      {/* Score Display */}
      <Row className="mt-4">
        <Col>
          <Card className="card-ai">
            <Card.Body className="text-center">
              <h6>Current Score: {score} points</h6>
              <small className="text-muted">
                Each question is worth {currentQuestion.points} points
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdaptiveQuiz;
