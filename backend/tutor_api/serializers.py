from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Topic, UserProfile, Quiz, QuizOption, UserQuizAttempt,
    TopicExplanation, TeachBackSession, EmotionSession,
    ExamReadinessReport, SkillGap
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'


class TopicSerializer(serializers.ModelSerializer):
    """Serializer for Topic model"""
    class Meta:
        model = Topic
        fields = '__all__'


class QuizOptionSerializer(serializers.ModelSerializer):
    """Serializer for QuizOption model"""
    class Meta:
        model = QuizOption
        fields = ['id', 'option_text']


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for Quiz model"""
    options = QuizOptionSerializer(many=True, read_only=True)
    topic = TopicSerializer(read_only=True)
    
    class Meta:
        model = Quiz
        fields = '__all__'


class UserQuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for UserQuizAttempt model"""
    quiz = QuizSerializer(read_only=True)
    selected_option = QuizOptionSerializer(read_only=True)
    
    class Meta:
        model = UserQuizAttempt
        fields = '__all__'
        read_only_fields = ['user', 'is_correct', 'score', 'created_at']


class TopicExplanationSerializer(serializers.ModelSerializer):
    """Serializer for TopicExplanation model"""
    topic = TopicSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TopicExplanation
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class TeachBackSessionSerializer(serializers.ModelSerializer):
    """Serializer for TeachBackSession model"""
    topic = TopicSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TeachBackSession
        fields = '__all__'
        read_only_fields = ['user', 'ai_feedback', 'correctness_score', 'improvement_suggestions', 'created_at']


class EmotionSessionSerializer(serializers.ModelSerializer):
    """Serializer for EmotionSession model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EmotionSession
        fields = '__all__'
        read_only_fields = ['user', 'detected_emotion', 'confidence_score', 'created_at']


class ExamReadinessReportSerializer(serializers.ModelSerializer):
    """Serializer for ExamReadinessReport model"""
    topic = TopicSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ExamReadinessReport
        fields = '__all__'
        read_only_fields = ['user', 'readiness_score', 'weak_areas', 'improvement_resources', 'mock_test_results', 'created_at']


class SkillGapSerializer(serializers.ModelSerializer):
    """Serializer for SkillGap model"""
    topic = TopicSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SkillGap
        fields = '__all__'
        read_only_fields = ['user', 'last_updated']


class QuizSubmissionSerializer(serializers.Serializer):
    """Serializer for quiz submissions"""
    quiz_id = serializers.IntegerField()
    selected_option_id = serializers.IntegerField(required=False, allow_null=True)
    user_answer = serializers.CharField(required=False, allow_blank=True)
    time_taken = serializers.IntegerField()


class TopicExplanationRequestSerializer(serializers.Serializer):
    """Serializer for topic explanation requests"""
    topic_name = serializers.CharField(max_length=200)
    learning_style = serializers.ChoiceField(
        choices=[('visual', 'Visual'), ('auditory', 'Auditory'), ('kinesthetic', 'Kinesthetic'), ('reading', 'Reading/Writing')],
        default='visual'
    )


class TeachBackSubmissionSerializer(serializers.Serializer):
    """Serializer for teach-back submissions"""
    topic_id = serializers.IntegerField()
    student_explanation = serializers.CharField()


class EmotionDetectionSerializer(serializers.Serializer):
    """Serializer for emotion detection requests"""
    image_data = serializers.CharField()  # Base64 encoded image
    session_id = serializers.CharField(required=False)


class ExamReadinessRequestSerializer(serializers.Serializer):
    """Serializer for exam readiness requests"""
    topic_id = serializers.IntegerField()
    include_mock_test = serializers.BooleanField(default=True)
