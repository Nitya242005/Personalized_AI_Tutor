from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Topic(models.Model):
    """Model for storing educational topics"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    difficulty_level = models.IntegerField(
        choices=[(1, 'Beginner'), (2, 'Intermediate'), (3, 'Advanced')],
        default=1
    )
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Extended user profile with learning preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    learning_style = models.CharField(
        max_length=50,
        choices=[
            ('visual', 'Visual'),
            ('auditory', 'Auditory'),
            ('kinesthetic', 'Kinesthetic'),
            ('reading', 'Reading/Writing')
        ],
        default='visual'
    )
    preferred_difficulty = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(3)],
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


class Quiz(models.Model):
    """Model for storing quiz questions"""
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=[
            ('multiple_choice', 'Multiple Choice'),
            ('true_false', 'True/False'),
            ('short_answer', 'Short Answer')
        ],
        default='multiple_choice'
    )
    difficulty_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(3)],
        default=1
    )
    points = models.IntegerField(default=1)
    
    def __str__(self):
        return f"{self.topic.name} - {self.question_text[:50]}..."


class QuizOption(models.Model):
    """Model for quiz answer options"""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.quiz.question_text[:30]}... - {self.option_text}"


class UserQuizAttempt(models.Model):
    """Model for tracking user quiz attempts"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(QuizOption, on_delete=models.CASCADE, null=True, blank=True)
    user_answer = models.TextField(null=True, blank=True)
    is_correct = models.BooleanField()
    score = models.IntegerField()
    time_taken = models.IntegerField(help_text="Time taken in seconds")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz.topic.name}"


class TopicExplanation(models.Model):
    """Model for storing AI-generated topic explanations"""
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    explanation_text = models.TextField()
    key_points = models.JSONField(default=list)
    diagrams = models.JSONField(default=list)
    real_world_applications = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name} Explanation"


class TeachBackSession(models.Model):
    """Model for storing teach-back mode sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    student_explanation = models.TextField()
    ai_feedback = models.TextField()
    correctness_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    improvement_suggestions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name} Teach Back"


class EmotionSession(models.Model):
    """Model for storing emotion detection sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    detected_emotion = models.CharField(max_length=50)
    confidence_score = models.FloatField()
    session_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.detected_emotion}"


class ExamReadinessReport(models.Model):
    """Model for storing exam readiness reports"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    readiness_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    weak_areas = models.JSONField(default=list)
    improvement_resources = models.JSONField(default=list)
    mock_test_results = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name} Readiness Report"


class SkillGap(models.Model):
    """Model for tracking user skill gaps"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    proficiency_level = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=0.0
    )
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'topic']
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name} (Level: {self.proficiency_level:.2f})"
