@echo off
echo Starting AI Personalized Tutor Backend...
echo.

cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Running database migrations...
python manage.py makemigrations
python manage.py migrate

echo Starting Django server...
echo Backend will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver

pause
