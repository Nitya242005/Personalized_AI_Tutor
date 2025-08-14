from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import json

from .models import (
    Topic, UserProfile, Quiz, QuizOption, UserQuizAttempt,
    TopicExplanation, TeachBackSession, EmotionSession,
    ExamReadinessReport, SkillGap
)
from .serializers import (
    UserSerializer, UserProfileSerializer, TopicSerializer, QuizSerializer,
    UserQuizAttemptSerializer, TopicExplanationSerializer, TeachBackSessionSerializer,
    EmotionSessionSerializer, ExamReadinessReportSerializer, SkillGapSerializer,
    QuizSubmissionSerializer, TopicExplanationRequestSerializer,
    TeachBackSubmissionSerializer, EmotionDetectionSerializer, ExamReadinessRequestSerializer
)
from .ml.topic_explainer import TopicExplainer
from .ml.quiz_adapter import QuizAdapter
from .ml.emotion_detector import EmotionDetector


class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            
            if not username or not email or not password:
                return Response({
                    'error': 'Username, email, and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(username=username).exists():
                return Response({
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'error': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create user profile
            UserProfile.objects.create(
                user=user,
                learning_style=request.data.get('learning_style', 'visual'),
                preferred_difficulty=request.data.get('preferred_difficulty', 1)
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({
                    'error': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            
            if user is None:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TopicExplanationView(APIView):
    """AI-powered topic explanation endpoint"""
    
    def post(self, request):
        try:
            serializer = TopicExplanationRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            topic_name = serializer.validated_data['topic_name']
            learning_style = serializer.validated_data['learning_style']
            
            # Generate AI explanation
            explainer = TopicExplainer()
            explanation_data = explainer.explain_topic(topic_name, learning_style)
            
            # Get or create topic
            topic, created = Topic.objects.get_or_create(
                name=topic_name,
                defaults={
                    'description': explanation_data['explanation_text'][:200],
                    'difficulty_level': 1,
                    'category': 'General'
                }
            )
            
            # Save explanation to database
            explanation = TopicExplanation.objects.create(
                topic=topic,
                user=request.user,
                explanation_text=explanation_data['explanation_text'],
                key_points=explanation_data['key_points'],
                diagrams=explanation_data['diagrams'],
                real_world_applications=explanation_data['real_world_applications']
            )
            
            return Response({
                'message': 'Topic explanation generated successfully',
                'explanation': TopicExplanationSerializer(explanation).data,
                'ai_data': explanation_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Topic explanation failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdaptiveQuizView(APIView):
    """Adaptive quiz endpoint"""
    
    def get(self, request):
        try:
            topic_id = request.query_params.get('topic_id', 1)
            num_questions = int(request.query_params.get('num_questions', 5))
            
            # Get user's current difficulty level
            try:
                user_profile = UserProfile.objects.get(user=request.user)
                current_difficulty = user_profile.preferred_difficulty
            except UserProfile.DoesNotExist:
                current_difficulty = 1
            
            # Get adaptive questions
            quiz_adapter = QuizAdapter()
            questions = quiz_adapter.get_adaptive_questions(
                topic_id=int(topic_id),
                user_id=request.user.id,
                current_difficulty=current_difficulty,
                num_questions=num_questions
            )
            
            return Response({
                'message': 'Adaptive quiz questions retrieved successfully',
                'questions': questions,
                'current_difficulty': current_difficulty
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to retrieve quiz questions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = QuizSubmissionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            quiz_id = serializer.validated_data['quiz_id']
            selected_option_id = serializer.validated_data.get('selected_option_id')
            user_answer = serializer.validated_data.get('user_answer')
            time_taken = serializer.validated_data['time_taken']
            
            # Get quiz and evaluate answer
            quiz = get_object_or_404(Quiz, id=quiz_id)
            
            # Determine if answer is correct
            is_correct = False
            if selected_option_id:
                try:
                    selected_option = QuizOption.objects.get(id=selected_option_id)
                    is_correct = selected_option.is_correct
                except QuizOption.DoesNotExist:
                    pass
            
            # Calculate score
            score = 10 if is_correct else 0
            
            # Save quiz attempt
            quiz_attempt = UserQuizAttempt.objects.create(
                user=request.user,
                quiz=quiz,
                selected_option_id=selected_option_id,
                user_answer=user_answer,
                is_correct=is_correct,
                score=score,
                time_taken=time_taken
            )
            
            # Update user difficulty using ML
            quiz_adapter = QuizAdapter()
            quiz_result = {
                'is_correct': is_correct,
                'time_taken': time_taken,
                'confidence': 0.5  # Default confidence
            }
            
            # Get new difficulty
            new_difficulty = None
            try:
                user_profile = UserProfile.objects.get(user=request.user)
                new_difficulty = quiz_adapter.calculate_next_difficulty(
                    request.user.id,
                    user_profile.preferred_difficulty,
                    quiz_result
                )
                user_profile.preferred_difficulty = new_difficulty
                user_profile.save()
            except UserProfile.DoesNotExist:
                pass

            return Response({
                'message': 'Quiz submitted successfully',
                'result': {
                    'is_correct': is_correct,
                    'score': score,
                    'feedback': 'Great job!' if is_correct else 'Keep practicing!',
                    'new_difficulty': new_difficulty
                },
                'quiz_attempt': UserQuizAttemptSerializer(quiz_attempt).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Quiz submission failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TeachBackView(APIView):
    """Teach-back mode endpoint"""
    
    def post(self, request):
        try:
            serializer = TeachBackSubmissionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            topic_id = serializer.validated_data['topic_id']
            student_explanation = serializer.validated_data['student_explanation']
            
            # Get topic
            topic = get_object_or_404(Topic, id=topic_id)
            
            # Simple AI feedback (in real app, use more sophisticated NLP)
            ai_feedback = self._generate_ai_feedback(student_explanation, topic.name)
            correctness_score = self._calculate_correctness(student_explanation, topic.name)
            improvement_suggestions = self._generate_improvements(correctness_score)
            
            # Save teach-back session
            teach_back = TeachBackSession.objects.create(
                user=request.user,
                topic=topic,
                student_explanation=student_explanation,
                ai_feedback=ai_feedback,
                correctness_score=correctness_score,
                improvement_suggestions=improvement_suggestions
            )
            
            return Response({
                'message': 'Teach-back session completed successfully',
                'teach_back': TeachBackSessionSerializer(teach_back).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Teach-back failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_ai_feedback(self, explanation: str, topic: str) -> str:
        """Generate AI feedback for student explanation"""
        # Simple rule-based feedback (in real app, use NLP models)
        if len(explanation) < 50:
            return f"Your explanation of {topic} is quite brief. Try to include more details and examples."
        elif len(explanation) > 200:
            return f"Good detailed explanation of {topic}! You've covered many aspects comprehensively."
        else:
            return f"Nice explanation of {topic}! Consider adding specific examples to make it clearer."
    
    def _calculate_correctness(self, explanation: str, topic: str) -> float:
        """Calculate correctness score (0-1)"""
        # Simple scoring based on length and content (in real app, use NLP)
        base_score = min(1.0, len(explanation) / 100.0)
        
        # Bonus for mentioning key concepts
        key_terms = ['concept', 'example', 'application', 'theory', 'practice']
        content_bonus = sum(0.1 for term in key_terms if term.lower() in explanation.lower())
        
        return min(1.0, base_score + content_bonus)
    
    def _generate_improvements(self, correctness_score: float) -> list:
        """Generate improvement suggestions"""
        suggestions = []
        
        if correctness_score < 0.3:
            suggestions.extend([
                "Review the fundamental concepts",
                "Practice explaining to others",
                "Use more examples in your explanations"
            ])
        elif correctness_score < 0.7:
            suggestions.extend([
                "Add more specific details",
                "Include real-world applications",
                "Connect concepts to related topics"
            ])
        else:
            suggestions.extend([
                "Excellent understanding!",
                "Consider teaching others",
                "Explore advanced applications"
            ])
        
        return suggestions


class EmotionDetectionView(APIView):
    """Emotion detection endpoint"""
    
    def post(self, request):
        try:
            serializer = EmotionDetectionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            image_data = serializer.validated_data['image_data']
            session_id = serializer.validated_data.get('session_id', 'default')
            
            # Detect emotion
            emotion_detector = EmotionDetector()
            emotion_result = emotion_detector.detect_emotion_from_image(image_data)
            
            if not emotion_result['success']:
                return Response({
                    'error': emotion_result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save emotion session
            emotion_session = EmotionSession.objects.create(
                user=request.user,
                detected_emotion=emotion_result['detected_emotion'],
                confidence_score=emotion_result['confidence_score'],
                session_data={
                    'session_id': session_id,
                    'face_detected': emotion_result['face_detected'],
                    'all_emotions': emotion_result.get('all_emotions', {})
                }
            )
            
            # Get emotion insights and recommendations
            insights = emotion_detector.get_emotion_insights(
                emotion_result['detected_emotion'],
                emotion_result['confidence_score']
            )
            
            return Response({
                'message': 'Emotion detected successfully',
                'emotion_result': emotion_result,
                'insights': insights,
                'session': EmotionSessionSerializer(emotion_session).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Emotion detection failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExamReadinessView(APIView):
    """Exam readiness assessment endpoint"""
    
    def post(self, request):
        try:
            serializer = ExamReadinessRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            topic_id = serializer.validated_data['topic_id']
            include_mock_test = serializer.validated_data['include_mock_test']
            
            # Get topic
            topic = get_object_or_404(Topic, id=topic_id)
            
            # Calculate readiness score based on user performance
            readiness_score = self._calculate_readiness_score(request.user, topic_id)
            
            # Identify weak areas
            weak_areas = self._identify_weak_areas(request.user, topic_id)
            
            # Generate improvement resources
            improvement_resources = self._generate_improvement_resources(topic, weak_areas)
            
            # Mock test results if requested
            mock_test_results = {}
            if include_mock_test:
                mock_test_results = self._generate_mock_test_results(topic, readiness_score)
            
            # Save exam readiness report
            readiness_report = ExamReadinessReport.objects.create(
                user=request.user,
                topic=topic,
                readiness_score=readiness_score,
                weak_areas=weak_areas,
                improvement_resources=improvement_resources,
                mock_test_results=mock_test_results
            )
            
            return Response({
                'message': 'Exam readiness assessment completed successfully',
                'readiness_report': ExamReadinessReportSerializer(readiness_report).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Exam readiness assessment failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_readiness_score(self, user, topic_id: int) -> float:
        """Calculate exam readiness score (0-100)"""
        try:
            # Get user's quiz performance for this topic
            quiz_attempts = UserQuizAttempt.objects.filter(
                user=user,
                quiz__topic_id=topic_id
            )
            
            if not quiz_attempts.exists():
                return 50.0  # Default score for new users
            
            # Calculate score based on performance
            total_attempts = quiz_attempts.count()
            correct_attempts = quiz_attempts.filter(is_correct=True).count()
            accuracy = correct_attempts / total_attempts
            
            # Consider recent performance more heavily
            recent_attempts = quiz_attempts.order_by('-created_at')[:5]
            if recent_attempts.exists():
                recent_accuracy = recent_attempts.filter(is_correct=True).count() / len(recent_attempts)
                # Weight recent performance 70%, overall 30%
                final_score = (recent_accuracy * 0.7 + accuracy * 0.3) * 100
            else:
                final_score = accuracy * 100
            
            return round(final_score, 1)
            
        except Exception as e:
            print(f"Error calculating readiness score: {e}")
            return 50.0
    
    def _identify_weak_areas(self, user, topic_id: int) -> list:
        """Identify weak areas for improvement"""
        weak_areas = []
        
        try:
            # Analyze quiz performance patterns
            quiz_attempts = UserQuizAttempt.objects.filter(
                user=user,
                quiz__topic_id=topic_id
            )
            
            if not quiz_attempts.exists():
                return ["Basic concepts", "Fundamental principles"]
            
            # Check difficulty level performance
            easy_attempts = quiz_attempts.filter(quiz__difficulty_level=1)
            if easy_attempts.exists():
                easy_accuracy = easy_attempts.filter(is_correct=True).count() / easy_attempts.count()
                if easy_accuracy < 0.7:
                    weak_areas.append("Basic concepts")
            
            medium_attempts = quiz_attempts.filter(quiz__difficulty_level=2)
            if medium_attempts.exists():
                medium_accuracy = medium_attempts.filter(is_correct=True).count() / medium_attempts.count()
                if medium_accuracy < 0.6:
                    weak_areas.append("Intermediate concepts")
            
            hard_attempts = quiz_attempts.filter(quiz__difficulty_level=3)
            if hard_attempts.exists():
                hard_accuracy = hard_attempts.filter(is_correct=True).count() / hard_attempts.count()
                if hard_accuracy < 0.5:
                    weak_areas.append("Advanced concepts")
            
            # If no specific weak areas identified, provide general ones
            if not weak_areas:
                weak_areas = ["Application of concepts", "Problem-solving skills"]
                
        except Exception as e:
            print(f"Error identifying weak areas: {e}")
            weak_areas = ["General understanding", "Concept application"]
        
        return weak_areas
    
    def _generate_improvement_resources(self, topic, weak_areas: list) -> list:
        """Generate improvement resources and tips"""
        resources = []
        
        for area in weak_areas:
            if "basic" in area.lower():
                resources.append({
                    'area': area,
                    'resources': [
                        f"Review {topic.name} fundamentals",
                        "Practice basic exercises",
                        "Watch introductory videos"
                    ]
                })
            elif "intermediate" in area.lower():
                resources.append({
                    'area': area,
                    'resources': [
                        f"Study {topic.name} applications",
                        "Solve practice problems",
                        "Read case studies"
                    ]
                })
            elif "advanced" in area.lower():
                resources.append({
                    'area': area,
                    'resources': [
                        f"Explore advanced {topic.name} concepts",
                        "Work on complex problems",
                        "Research current developments"
                    ]
                })
            else:
                resources.append({
                    'area': area,
                    'resources': [
                        f"Focus on {area.lower()} in {topic.name}",
                        "Practice related exercises",
                        "Seek additional explanations"
                    ]
                })
        
        return resources
    
    def _generate_mock_test_results(self, topic, readiness_score: float) -> dict:
        """Generate mock test results based on readiness score"""
        # Simulate mock test performance
        if readiness_score >= 80:
            performance = "Excellent"
            score_range = "85-95"
        elif readiness_score >= 60:
            performance = "Good"
            score_range = "65-80"
        elif readiness_score >= 40:
            performance = "Fair"
            score_range = "45-65"
        else:
            performance = "Needs Improvement"
            score_range = "25-45"
        
        return {
            'performance_level': performance,
            'estimated_score_range': score_range,
            'recommendations': [
                "Continue current study approach" if readiness_score >= 70 else "Focus on weak areas",
                "Take practice tests regularly",
                "Review key concepts thoroughly"
            ]
        }


class SkillGapView(APIView):
    """Skill gap analysis endpoint"""
    
    def get(self, request):
        try:
            # Get user's skill gaps for all topics
            skill_gaps = SkillGap.objects.filter(user=request.user)
            
            # If no skill gaps exist, create them based on quiz performance
            if not skill_gaps.exists():
                skill_gaps = self._create_skill_gaps_from_performance(request.user)
            
            # Calculate overall proficiency
            overall_proficiency = self._calculate_overall_proficiency(skill_gaps)
            
            # Generate heatmap data
            heatmap_data = self._generate_heatmap_data(skill_gaps)
            
            return Response({
                'message': 'Skill gap analysis retrieved successfully',
                'skill_gaps': SkillGapSerializer(skill_gaps, many=True).data,
                'overall_proficiency': overall_proficiency,
                'heatmap_data': heatmap_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Skill gap analysis failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_skill_gaps_from_performance(self, user) -> list:
        """Create skill gaps based on user's quiz performance"""
        skill_gaps = []
        
        try:
            # Get all topics
            topics = Topic.objects.all()
            
            for topic in topics:
                # Calculate proficiency based on quiz performance
                quiz_attempts = UserQuizAttempt.objects.filter(
                    user=user,
                    quiz__topic=topic
                )
                
                if quiz_attempts.exists():
                    # Calculate proficiency score
                    total_attempts = quiz_attempts.count()
                    correct_attempts = quiz_attempts.filter(is_correct=True).count()
                    accuracy = correct_attempts / total_attempts
                    
                    # Consider difficulty levels
                    difficulty_bonus = 0
                    for difficulty in [1, 2, 3]:
                        diff_attempts = quiz_attempts.filter(quiz__difficulty_level=difficulty)
                        if diff_attempts.exists():
                            diff_accuracy = diff_attempts.filter(is_correct=True).count() / diff_attempts.count()
                            difficulty_bonus += diff_accuracy * (difficulty / 3)
                    
                    # Calculate final proficiency
                    proficiency = (accuracy + difficulty_bonus) / 2
                    proficiency = max(0.0, min(1.0, proficiency))
                else:
                    proficiency = 0.0
                
                # Create skill gap
                skill_gap, created = SkillGap.objects.get_or_create(
                    user=user,
                    topic=topic,
                    defaults={'proficiency_level': proficiency}
                )
                
                if not created:
                    skill_gap.proficiency_level = proficiency
                    skill_gap.save()
                
                skill_gaps.append(skill_gap)
                
        except Exception as e:
            print(f"Error creating skill gaps: {e}")
        
        return skill_gaps
    
    def _calculate_overall_proficiency(self, skill_gaps) -> dict:
        """Calculate overall proficiency metrics"""
        if not skill_gaps:
            return {
                'average_proficiency': 0.0,
                'total_topics': 0,
                'strong_areas': 0,
                'weak_areas': 0,
                'improvement_needed': 0
            }
        
        proficiencies = [gap.proficiency_level for gap in skill_gaps]
        average_proficiency = sum(proficiencies) / len(proficiencies)
        
        strong_areas = sum(1 for p in proficiencies if p >= 0.7)
        weak_areas = sum(1 for p in proficiencies if p < 0.4)
        improvement_needed = sum(1 for p in proficiencies if p < 0.6)
        
        return {
            'average_proficiency': round(average_proficiency, 3),
            'total_topics': len(skill_gaps),
            'strong_areas': strong_areas,
            'weak_areas': weak_areas,
            'improvement_needed': improvement_needed
        }
    
    def _generate_heatmap_data(self, skill_gaps) -> dict:
        """Generate heatmap data for visualization"""
        heatmap_data = {
            'labels': [],
            'data': [],
            'colors': []
        }
        
        for gap in skill_gaps:
            heatmap_data['labels'].append(gap.topic.name)
            heatmap_data['data'].append(gap.proficiency_level)
            
            # Color coding based on proficiency
            if gap.proficiency_level >= 0.7:
                color = '#28a745'  # Green for strong
            elif gap.proficiency_level >= 0.4:
                color = '#ffc107'  # Yellow for moderate
            else:
                color = '#dc3545'  # Red for weak
            
            heatmap_data['colors'].append(color)
        
        return heatmap_data


class DashboardView(APIView):
    """Dashboard data endpoint"""
    
    def get(self, request):
        try:
            # Get user profile
            try:
                user_profile = UserProfile.objects.get(user=request.user)
            except UserProfile.DoesNotExist:
                user_profile = None
            
            # Get recent activity
            recent_quiz_attempts = UserQuizAttempt.objects.filter(
                user=request.user
            ).order_by('-created_at')[:5]
            
            recent_explanations = TopicExplanation.objects.filter(
                user=request.user
            ).order_by('-created_at')[:3]
            
            # Get performance summary
            total_quizzes = UserQuizAttempt.objects.filter(user=request.user).count()
            correct_quizzes = UserQuizAttempt.objects.filter(
                user=request.user, 
                is_correct=True
            ).count()
            
            accuracy = (correct_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0
            
            # Get skill gaps summary
            skill_gaps = SkillGap.objects.filter(user=request.user)
            strong_topics = skill_gaps.filter(proficiency_level__gte=0.7).count()
            weak_topics = skill_gaps.filter(proficiency_level__lt=0.4).count()
            
            dashboard_data = {
                'user_profile': UserProfileSerializer(user_profile).data if user_profile else None,
                'recent_activity': {
                    'quiz_attempts': UserQuizAttemptSerializer(recent_quiz_attempts, many=True).data,
                    'explanations': TopicExplanationSerializer(recent_explanations, many=True).data
                },
                'performance_summary': {
                    'total_quizzes': total_quizzes,
                    'correct_quizzes': correct_quizzes,
                    'accuracy_percentage': round(accuracy, 1),
                    'strong_topics': strong_topics,
                    'weak_topics': weak_topics
                }
            }
            
            return Response({
                'message': 'Dashboard data retrieved successfully',
                'dashboard': dashboard_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Dashboard data retrieval failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Additional utility views
class TopicListView(generics.ListAPIView):
    """List all available topics"""
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = []  # Allow public access to topics


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return UserProfile.objects.get_or_create(user=self.request.user)[0]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_token(request):
    """Refresh JWT token"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        return Response({
            'access': access_token
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Token refresh failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
