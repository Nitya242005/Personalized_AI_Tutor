# AI Personalized Tutor - Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the AI Personalized Tutor application locally.

## 📋 Prerequisites

- **Python 3.8+** (recommended: Python 3.9 or 3.10)
- **Node.js 16+** (recommended: Node.js 18 LTS)
- **Git** (for version control)
- **Virtual Environment** (recommended)

## 🏗️ Project Structure

```
PersonalisedTutor/
├── backend/                 # Django Backend
│   ├── tutor_api/          # Django project
│   ├── ml_models/          # ML model storage
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management
├── frontend/               # React Frontend
│   ├── src/               # React source code
│   ├── public/            # Static files
│   └── package.json       # Node dependencies
└── README.md              # Project documentation
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
```bash
# Copy the example environment file
copy env_example.txt .env

# Edit .env file with your configuration
# At minimum, set your Django SECRET_KEY
```

### 5. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 7. Start Backend Server
```bash
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Start Frontend Development Server
```bash
npm start
```

The frontend will be available at: `http://localhost:3000`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh

### Core Features
- `POST /api/topics/explain/` - AI topic explanation
- `GET /api/quiz/adaptive/` - Get adaptive quiz questions
- `POST /api/quiz/adaptive/` - Submit quiz answers
- `POST /api/teach-back/` - Teach-back mode
- `POST /api/emotion/detect/` - Emotion detection
- `POST /api/exam/readiness/` - Exam readiness assessment
- `GET /api/skills/gaps/` - Skill gap analysis

### User Management
- `GET /api/profile/` - User profile
- `GET /api/dashboard/` - User dashboard
- `GET /api/topics/` - Available topics

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Secret Key (REQUIRED)
SECRET_KEY=your-very-secure-secret-key-here

# Hugging Face API Key (OPTIONAL - for enhanced AI features)
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Debug Mode
DEBUG=True

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Backend (Django)
python manage.py runserver 8001

# Frontend (React)
npm start -- --port 3001
```

#### 2. Python Dependencies Issues
```bash
# Upgrade pip
pip install --upgrade pip

# Clear pip cache
pip cache purge

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

#### 3. Node Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Database Issues
```bash
# Reset database (WARNING: This will delete all data)
python manage.py flush

# Recreate database
python manage.py makemigrations
python manage.py migrate
```

#### 5. ML Models Not Loading
```bash
# Check if ml_models directory exists
ls backend/ml_models/

# Create directory if missing
mkdir -p backend/ml_models
```

## 🧪 Testing the Application

### 1. Backend Health Check
Visit: `http://localhost:8000/admin/`

### 2. API Health Check
Visit: `http://localhost:8000/api/topics/`

### 3. Frontend Health Check
Visit: `http://localhost:3000`

## 📱 Features to Test

1. **User Registration & Login**
2. **AI Topic Explanation** - Try explaining a topic like "Machine Learning"
3. **Adaptive Quiz** - Take a quiz and see difficulty adjustment
4. **Emotion Detection** - Upload a photo for emotion analysis
5. **Teach-Back Mode** - Explain a topic to the AI
6. **Skill Gap Analysis** - View your learning progress
7. **Exam Readiness** - Get readiness assessment

## 🔒 Security Notes

- Change the default `SECRET_KEY` in production
- Set `DEBUG=False` in production
- Use HTTPS in production
- Implement proper CORS policies
- Use environment variables for sensitive data

## 🚀 Production Deployment

### Backend (Railway/Render)
1. Set environment variables
2. Configure database (PostgreSQL recommended)
3. Set `DEBUG=False`
4. Configure static files

### Frontend (Vercel)
1. Build the project: `npm run build`
2. Deploy to Vercel
3. Configure environment variables

### Database (Railway/Supabase)
1. Set up PostgreSQL database
2. Update `DATABASE_URL` in environment
3. Run migrations

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Check console logs for error messages
4. Ensure ports are not blocked by firewall

## 🎯 Next Steps

After successful setup:

1. Explore the dashboard
2. Try different learning features
3. Customize the UI/UX
4. Add more topics and questions
5. Integrate with external APIs
6. Deploy to production

---

**Happy Learning! 🎓✨**
