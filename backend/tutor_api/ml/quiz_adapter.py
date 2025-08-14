import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Any
import json


class QuizAdapter:
    """Adaptive quiz system using machine learning for difficulty adjustment"""
    
    def __init__(self):
        self.difficulty_model = LogisticRegression(random_state=42)
        self.scaler = StandardScaler()
        self.user_performance_history = {}
        self.difficulty_weights = {
            'correctness': 0.4,
            'time_taken': 0.3,
            'confidence': 0.2,
            'previous_performance': 0.1
        }
        
        # Initialize with some sample data for training
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the difficulty adjustment model with sample data"""
        # Sample features: [correctness, time_score, confidence, previous_performance]
        X_sample = np.array([
            [1, 0.8, 0.9, 0.7],  # Good performance
            [0, 0.3, 0.4, 0.6],  # Poor performance
            [1, 0.6, 0.7, 0.8],  # Average performance
            [0, 0.2, 0.3, 0.4],  # Very poor performance
            [1, 0.9, 0.8, 0.9],  # Excellent performance
        ])
        
        # Target: 1 for increase difficulty, 0 for decrease
        y_sample = np.array([1, 0, 1, 0, 1])
        
        # Fit the model
        X_scaled = self.scaler.fit_transform(X_sample)
        self.difficulty_model.fit(X_scaled, y_sample)
    
    def calculate_next_difficulty(self, user_id: int, current_difficulty: int, 
                                quiz_result: Dict[str, Any]) -> int:
        """
        Calculate the next quiz difficulty based on user performance
        
        Args:
            user_id: User identifier
            current_difficulty: Current difficulty level (1-3)
            quiz_result: Dictionary containing quiz performance data
            
        Returns:
            Next difficulty level (1-3)
        """
        # Extract features from quiz result
        features = self._extract_features(user_id, quiz_result)
        
        # Normalize features
        features_scaled = self.scaler.transform([features])
        
        # Predict difficulty adjustment
        should_increase = self.difficulty_model.predict(features_scaled)[0]
        
        # Calculate new difficulty
        if should_increase and current_difficulty < 3:
            new_difficulty = current_difficulty + 1
        elif not should_increase and current_difficulty > 1:
            new_difficulty = current_difficulty - 1
        else:
            new_difficulty = current_difficulty
        
        # Update user performance history
        self._update_user_history(user_id, quiz_result, new_difficulty)
        
        return new_difficulty
    
    def _extract_features(self, user_id: int, quiz_result: Dict[str, Any]) -> List[float]:
        """Extract features for difficulty prediction"""
        correctness = 1.0 if quiz_result.get('is_correct', False) else 0.0
        
        # Normalize time taken (0-1 scale, lower is better)
        max_time = 300  # 5 minutes
        time_taken = quiz_result.get('time_taken', 0)
        time_score = max(0, 1 - (time_taken / max_time))
        
        # Confidence score (if available)
        confidence = quiz_result.get('confidence', 0.5)
        
        # Previous performance (average of last 5 attempts)
        previous_performance = self._get_previous_performance(user_id)
        
        return [correctness, time_score, confidence, previous_performance]
    
    def _get_previous_performance(self, user_id: int) -> float:
        """Get user's previous performance average"""
        if user_id not in self.user_performance_history:
            return 0.5  # Default neutral performance
        
        history = self.user_performance_history[user_id]
        if len(history) == 0:
            return 0.5
        
        # Calculate average of last 5 attempts
        recent_scores = history[-5:]
        return np.mean([score for score in recent_scores])
    
    def _update_user_history(self, user_id: int, quiz_result: Dict[str, Any], new_difficulty: int):
        """Update user performance history"""
        if user_id not in self.user_performance_history:
            self.user_performance_history[user_id] = []
        
        # Calculate performance score
        performance_score = self._calculate_performance_score(quiz_result)
        
        # Add to history
        self.user_performance_history[user_id].append(performance_score)
        
        # Keep only last 20 attempts
        if len(self.user_performance_history[user_id]) > 20:
            self.user_performance_history[user_id] = self.user_performance_history[user_id][-20:]
    
    def _calculate_performance_score(self, quiz_result: Dict[str, Any]) -> float:
        """Calculate overall performance score from quiz result"""
        correctness = 1.0 if quiz_result.get('is_correct', False) else 0.0
        
        # Time penalty (faster is better)
        max_time = 300
        time_taken = quiz_result.get('time_taken', 0)
        time_penalty = max(0, (time_taken / max_time) * 0.3)
        
        # Confidence bonus
        confidence = quiz_result.get('confidence', 0.5)
        confidence_bonus = confidence * 0.2
        
        # Calculate final score
        score = correctness - time_penalty + confidence_bonus
        return max(0, min(1, score))  # Clamp between 0 and 1
    
    def get_adaptive_questions(self, topic_id: int, user_id: int, 
                             current_difficulty: int, num_questions: int = 5) -> List[Dict[str, Any]]:
        """
        Get adaptive questions based on user performance
        
        Args:
            topic_id: Topic identifier
            current_difficulty: Current difficulty level
            user_id: User identifier
            num_questions: Number of questions to return
            
        Returns:
            List of question dictionaries
        """
        # This would typically query the database for questions
        # For now, return sample questions
        questions = []
        
        for i in range(num_questions):
            # Adjust difficulty for each question based on user performance
            question_difficulty = self._adjust_question_difficulty(
                current_difficulty, user_id, i
            )
            
            question = self._generate_sample_question(topic_id, question_difficulty, i + 1)
            questions.append(question)
        
        return questions
    
    def _adjust_question_difficulty(self, base_difficulty: int, user_id: int, question_index: int) -> int:
        """Adjust difficulty for individual questions"""
        if user_id not in self.user_performance_history:
            return base_difficulty
        
        history = self.user_performance_history[user_id]
        if len(history) == 0:
            return base_difficulty
        
        # Recent performance trend
        recent_performance = np.mean(history[-3:]) if len(history) >= 3 else history[-1]
        
        # Adjust based on performance trend
        if recent_performance > 0.7:  # Good performance
            adjusted = min(3, base_difficulty + 1)
        elif recent_performance < 0.3:  # Poor performance
            adjusted = max(1, base_difficulty - 1)
        else:
            adjusted = base_difficulty
        
        # Ensure difficulty stays within bounds
        return max(1, min(3, adjusted))
    
    def _generate_sample_question(self, topic_id: int, difficulty: int, question_num: int) -> Dict[str, Any]:
        """Generate a sample question (in real app, this would come from database)"""
        difficulty_texts = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}
        
        question_templates = {
            1: f"What is the basic concept of topic {topic_id}?",
            2: f"How does topic {topic_id} relate to other concepts?",
            3: f"Explain the advanced applications of topic {topic_id}."
        }
        
        return {
            'id': f"q_{topic_id}_{question_num}",
            'question_text': question_templates.get(difficulty, question_templates[1]),
            'difficulty_level': difficulty,
            'difficulty_text': difficulty_texts[difficulty],
            'topic_id': topic_id,
            'options': [
                {'id': 1, 'text': f'Option A for question {question_num}'},
                {'id': 2, 'text': f'Option B for question {question_num}'},
                {'id': 3, 'text': f'Option C for question {question_num}'},
                {'id': 4, 'text': f'Option D for question {question_num}'}
            ],
            'correct_option': 1,
            'points': difficulty
        }
    
    def evaluate_answer(self, user_answer: Any, correct_answer: Any, 
                       time_taken: int, confidence: float = 0.5) -> Dict[str, Any]:
        """
        Evaluate user answer and provide feedback
        
        Args:
            user_answer: User's answer
            correct_answer: Correct answer
            time_taken: Time taken to answer
            confidence: User's confidence level
            
        Returns:
            Evaluation results
        """
        is_correct = user_answer == correct_answer
        
        # Calculate score based on correctness, time, and confidence
        base_score = 10 if is_correct else 0
        time_bonus = max(0, (300 - time_taken) / 300 * 5)  # Bonus for speed
        confidence_bonus = confidence * 2 if is_correct else 0
        
        total_score = base_score + time_bonus + confidence_bonus
        
        # Generate feedback
        feedback = self._generate_feedback(is_correct, time_taken, confidence)
        
        return {
            'is_correct': is_correct,
            'score': int(total_score),
            'feedback': feedback,
            'time_taken': time_taken,
            'confidence': confidence
        }
    
    def _generate_feedback(self, is_correct: bool, time_taken: int, confidence: float) -> str:
        """Generate appropriate feedback for the user"""
        if is_correct:
            if time_taken < 60:
                return "Excellent! You answered quickly and correctly."
            elif time_taken < 180:
                return "Great job! You got the right answer."
            else:
                return "Correct answer, but try to be a bit faster next time."
        else:
            if confidence > 0.7:
                return "You were confident but incorrect. Review the concept carefully."
            else:
                return "Don't worry! This is a learning opportunity. Review the material and try again."
    
    def get_performance_analytics(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive performance analytics for a user"""
        if user_id not in self.user_performance_history:
            return {
                'total_attempts': 0,
                'average_score': 0,
                'improvement_trend': 'stable',
                'strengths': [],
                'weaknesses': []
            }
        
        history = self.user_performance_history[user_id]
        
        if len(history) == 0:
            return {
                'total_attempts': 0,
                'average_score': 0,
                'improvement_trend': 'stable',
                'strengths': [],
                'weaknesses': []
            }
        
        # Calculate analytics
        total_attempts = len(history)
        average_score = np.mean(history)
        
        # Calculate improvement trend
        if len(history) >= 3:
            recent_avg = np.mean(history[-3:])
            earlier_avg = np.mean(history[:-3]) if len(history) > 3 else history[0]
            
            if recent_avg > earlier_avg + 0.1:
                trend = 'improving'
            elif recent_avg < earlier_avg - 0.1:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        # Identify strengths and weaknesses
        strengths = []
        weaknesses = []
        
        if average_score > 0.7:
            strengths.append("Consistent high performance")
        if average_score < 0.4:
            weaknesses.append("Need for fundamental review")
        
        return {
            'total_attempts': total_attempts,
            'average_score': round(average_score, 3),
            'improvement_trend': trend,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'recent_performance': history[-5:] if len(history) >= 5 else history
        }
