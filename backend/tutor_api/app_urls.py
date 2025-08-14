from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', views.refresh_token, name='refresh_token'),
    
    # Core features
    path('topics/', views.TopicListView.as_view(), name='topic_list'),
    path('topics/explain/', views.TopicExplanationView.as_view(), name='topic_explanation'),
    path('quiz/adaptive/', views.AdaptiveQuizView.as_view(), name='adaptive_quiz'),
    path('teach-back/', views.TeachBackView.as_view(), name='teach_back'),
    path('emotion/detect/', views.EmotionDetectionView.as_view(), name='emotion_detection'),
    path('exam/readiness/', views.ExamReadinessView.as_view(), name='exam_readiness'),
    path('skills/gaps/', views.SkillGapView.as_view(), name='skill_gaps'),
    
    # User management
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
]
