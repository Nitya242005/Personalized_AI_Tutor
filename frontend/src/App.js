import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ExplainTopic from './pages/ExplainTopic';
import AdaptiveQuiz from './pages/AdaptiveQuiz';
import Analytics from './pages/Analytics';
import TeachBack from './pages/TeachBack';
import ExamReport from './pages/ExamReport';
import EmotionDetection from './pages/EmotionDetection';
import Login from './pages/Login';
import Register from './pages/Register';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="ai-tutor-container">
        <Navbar />
        <Container fluid>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/explain-topic" 
              element={
                <ProtectedRoute>
                  <ExplainTopic />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/adaptive-quiz" 
              element={
                <ProtectedRoute>
                  <AdaptiveQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teach-back" 
              element={
                <ProtectedRoute>
                  <TeachBack />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exam-report" 
              element={
                <ProtectedRoute>
                  <ExamReport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emotion-detection" 
              element={
                <ProtectedRoute>
                  <EmotionDetection />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

// App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
