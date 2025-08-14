# 🎓 AI Personalized Tutor

A comprehensive, AI-powered personalized learning platform that adapts to individual learning styles and provides real-time feedback and assessment.

## ✨ Features

### 🧠 AI-Powered Learning
- **Instant Topic Explanation**: AI-generated notes, key insights, and real-world applications
- **Adaptive Learning Quiz**: Real-time difficulty adjustment based on performance
- **Teach-Back Mode**: Students explain topics to AI for reinforcement
- **Emotion-Aware Adaptation**: Detects learner's mood to adjust content style

### 📊 Analytics & Assessment
- **Skill Gap Heatmap**: Interactive visualization of strengths and weaknesses
- **Exam Readiness Report**: Simulated test results and improvement resources
- **Performance Tracking**: Comprehensive learning analytics and progress monitoring

### 🎯 Personalization
- **Learning Style Adaptation**: Visual, Auditory, Kinesthetic, and Reading/Writing styles
- **Difficulty Progression**: ML-powered adaptive difficulty adjustment
- **Custom Learning Paths**: Personalized content recommendations

## 🏗️ Architecture

### Backend (Django + DRF)
- **Framework**: Django 4.2.7 + Django REST Framework 3.14.0
- **Authentication**: JWT-based authentication with `djangorestframework-simplejwt`
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI/ML**: Hugging Face Transformers, Scikit-learn, PyTorch
- **Computer Vision**: OpenCV for emotion detection

### Frontend (React)
- **Framework**: React 18.2.0 with React Router 6.3.0
- **UI Library**: Bootstrap 5.3.0 + React Bootstrap 2.8.0
- **Charts**: Chart.js 4.3.0 + react-chartjs-2 5.2.0
- **HTTP Client**: Axios with JWT interceptor

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ and Node.js 16+
- Git for version control

### Option 1: Automated Setup (Windows)
```bash
# Start Backend
start_backend.bat

# Start Frontend (in new terminal)
start_frontend.bat
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 🔧 Configuration

### Environment Variables
Create `.env` file in `backend/` directory:
```env
SECRET_KEY=your-secret-key-here
HUGGINGFACE_API_KEY=your-api-key-here  # Optional
DEBUG=True
```

### Database Configuration
- **Development**: SQLite (default)
- **Production**: PostgreSQL (configure in settings.py)

## 📱 Core Features

### 1. AI Topic Explanation
- Request explanations for any topic
- AI generates comprehensive content
- Adapts to learning style preferences
- Includes key points and real-world applications

### 2. Adaptive Quiz System
- ML-powered difficulty adjustment
- Real-time performance analysis
- Personalized question selection
- Comprehensive feedback and scoring

### 3. Emotion Detection
- Facial emotion recognition
- Content style adaptation
- Learning recommendations based on mood
- Stress-free learning environment

### 4. Teach-Back Mode
- Students explain concepts to AI
- AI provides feedback and scoring
- Identifies knowledge gaps
- Suggests improvement areas

### 5. Skill Gap Analysis
- Visual heatmap of proficiency levels
- Topic-wise performance tracking
- Personalized improvement recommendations
- Progress monitoring over time

### 6. Exam Readiness Assessment
- Comprehensive readiness scoring
- Weak area identification
- Mock test simulation
- Resource recommendations

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register/     # User registration
POST /api/auth/login/        # User login
POST /api/auth/refresh/      # Token refresh
```

### Core Features
```
POST /api/topics/explain/    # AI topic explanation
GET  /api/quiz/adaptive/     # Get quiz questions
POST /api/quiz/adaptive/     # Submit answers
POST /api/teach-back/        # Teach-back mode
POST /api/emotion/detect/    # Emotion detection
POST /api/exam/readiness/    # Readiness assessment
GET  /api/skills/gaps/       # Skill gap analysis
```

### User Management
```
GET  /api/profile/           # User profile
GET  /api/dashboard/         # User dashboard
GET  /api/topics/            # Available topics
```

## 🧪 Testing Features

1. **Register a new account** with learning preferences
2. **Request AI explanation** for topics like "Machine Learning"
3. **Take adaptive quizzes** and observe difficulty changes
4. **Upload photos** for emotion detection
5. **Use teach-back mode** to explain concepts
6. **View skill gaps** and progress analytics
7. **Get exam readiness** assessments

## 🔒 Security Features

- JWT-based authentication
- Secure password handling
- CORS configuration
- Environment variable protection
- Input validation and sanitization

## 🚀 Deployment

### Backend (Railway/Render)
1. Set environment variables
2. Configure PostgreSQL database
3. Set `DEBUG=False`
4. Deploy with Git integration

### Frontend (Vercel)
1. Build: `npm run build`
2. Deploy to Vercel
3. Configure environment variables

### Database (Railway/Supabase)
1. Set up PostgreSQL
2. Update `DATABASE_URL`
3. Run migrations

## 🛠️ Development

### Project Structure
```
PersonalisedTutor/
├── backend/
│   ├── tutor_api/           # Django project
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API endpoints
│   │   ├── serializers.py   # Data serialization
│   │   └── ml/              # AI/ML modules
│   ├── requirements.txt     # Python dependencies
│   └── manage.py           # Django management
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   └── package.json        # Node dependencies
└── docs/                   # Documentation
```

### Adding New Features
1. **Backend**: Add models, views, and serializers
2. **Frontend**: Create components and integrate with API
3. **Testing**: Test both backend and frontend
4. **Documentation**: Update API docs and README

## 🐛 Troubleshooting

### Common Issues
- **Port conflicts**: Use different ports (8001, 3001)
- **Dependencies**: Clear cache and reinstall
- **Database**: Reset and recreate migrations
- **ML models**: Check `ml_models/` directory

### Debug Mode
- Check console logs for errors
- Verify environment variables
- Test API endpoints individually
- Check CORS configuration

## 📚 Learning Resources

- **Django**: https://docs.djangoproject.com/
- **React**: https://reactjs.org/docs/
- **Bootstrap**: https://getbootstrap.com/docs/
- **Chart.js**: https://www.chartjs.org/docs/
- **Hugging Face**: https://huggingface.co/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Hugging Face** for AI models and APIs
- **Django** and **React** communities
- **Open source contributors** for libraries and tools

## 📞 Support

- **Issues**: Create GitHub issues
- **Documentation**: Check SETUP_GUIDE.md
- **Community**: Join our discussions

---

**Built with ❤️ for personalized learning**

**Happy Learning! 🎓✨**
