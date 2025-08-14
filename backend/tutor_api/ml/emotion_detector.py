import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Tuple, Any
import base64
from PIL import Image
import io


class SimpleEmotionNet(nn.Module):
    """Simple CNN for emotion detection"""
    
    def __init__(self, num_classes=7):
        super(SimpleEmotionNet, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.5)
        self.fc1 = nn.Linear(128 * 8 * 8, 512)
        self.fc2 = nn.Linear(512, num_classes)
    
    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = x.view(-1, 128 * 8 * 8)
        x = self.dropout(F.relu(self.fc1(x)))
        x = self.fc2(x)
        return x


class EmotionDetector:
    """Emotion detection using computer vision and deep learning"""
    
    def __init__(self):
        self.emotion_labels = [
            'angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'
        ]
        self.face_cascade = None
        self.emotion_model = None
        
        # Initialize models
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize face detection and emotion recognition models"""
        try:
            # Load face detection cascade
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            # Initialize emotion detection model
            self.emotion_model = SimpleEmotionNet(num_classes=len(self.emotion_labels))
            
            # Load pre-trained weights if available
            try:
                # In a real application, you would load pre-trained weights here
                # self.emotion_model.load_state_dict(torch.load('emotion_model.pth'))
                pass
            except:
                print("No pre-trained weights found, using random initialization")
            
            self.emotion_model.eval()
            
        except Exception as e:
            print(f"Error initializing emotion detection models: {e}")
            self.face_cascade = None
            self.emotion_model = None
    
    def detect_emotion_from_image(self, image_data: str) -> Dict[str, Any]:
        """
        Detect emotion from base64 encoded image
        
        Args:
            image_data: Base64 encoded image string
            
        Returns:
            Dictionary containing emotion detection results
        """
        try:
            # Decode base64 image
            image = self._decode_base64_image(image_data)
            if image is None:
                return self._error_response("Failed to decode image")
            
            # Detect faces
            faces = self._detect_faces(image)
            if not faces:
                return self._error_response("No faces detected in image")
            
            # Process first detected face
            face = faces[0]
            face_roi = self._extract_face_roi(image, face)
            
            # Detect emotion
            emotion_result = self._classify_emotion(face_roi)
            
            return {
                'success': True,
                'detected_emotion': emotion_result['emotion'],
                'confidence_score': emotion_result['confidence'],
                'face_detected': True,
                'face_coordinates': face.tolist(),
                'all_emotions': emotion_result['all_emotions']
            }
            
        except Exception as e:
            print(f"Error in emotion detection: {e}")
            return self._error_response(f"Emotion detection failed: {str(e)}")
    
    def _decode_base64_image(self, image_data: str) -> np.ndarray:
        """Decode base64 image string to numpy array"""
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to grayscale numpy array
            image_gray = image.convert('L')
            return np.array(image_gray)
            
        except Exception as e:
            print(f"Error decoding base64 image: {e}")
            return None
    
    def _detect_faces(self, image: np.ndarray) -> list:
        """Detect faces in the image"""
        if self.face_cascade is None:
            return []
        
        try:
            faces = self.face_cascade.detectMultiScale(
                image, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(30, 30)
            )
            return faces
        except Exception as e:
            print(f"Error detecting faces: {e}")
            return []
    
    def _extract_face_roi(self, image: np.ndarray, face: tuple) -> np.ndarray:
        """Extract face region of interest"""
        x, y, w, h = face
        face_roi = image[y:y+h, x:x+w]
        
        # Resize to standard size for emotion classification
        face_roi = cv2.resize(face_roi, (64, 64))
        
        return face_roi
    
    def _classify_emotion(self, face_roi: np.ndarray) -> Dict[str, Any]:
        """Classify emotion in the face ROI"""
        try:
            # Preprocess image
            face_tensor = self._preprocess_image(face_roi)
            
            # Get emotion predictions
            with torch.no_grad():
                outputs = self.emotion_model(face_tensor)
                probabilities = F.softmax(outputs, dim=1)
            
            # Get predicted emotion and confidence
            emotion_idx = torch.argmax(probabilities).item()
            confidence = probabilities[0][emotion_idx].item()
            
            # Get all emotion probabilities
            all_emotions = {}
            for i, label in enumerate(self.emotion_labels):
                all_emotions[label] = probabilities[0][i].item()
            
            return {
                'emotion': self.emotion_labels[emotion_idx],
                'confidence': confidence,
                'all_emotions': all_emotions
            }
            
        except Exception as e:
            print(f"Error classifying emotion: {e}")
            # Return neutral emotion as fallback
            return {
                'emotion': 'neutral',
                'confidence': 0.5,
                'all_emotions': {label: 0.14 for label in self.emotion_labels}
            }
    
    def _preprocess_image(self, face_roi: np.ndarray) -> torch.Tensor:
        """Preprocess image for emotion classification"""
        # Normalize pixel values
        face_roi = face_roi.astype(np.float32) / 255.0
        
        # Add batch and channel dimensions
        face_tensor = torch.from_numpy(face_roi).unsqueeze(0).unsqueeze(0)
        
        return face_tensor
    
    def _error_response(self, message: str) -> Dict[str, Any]:
        """Generate error response"""
        return {
            'success': False,
            'error': message,
            'detected_emotion': 'neutral',
            'confidence_score': 0.0,
            'face_detected': False
        }
    
    def get_emotion_insights(self, emotion: str, confidence: float) -> Dict[str, Any]:
        """Get insights and recommendations based on detected emotion"""
        insights = {
            'emotion': emotion,
            'confidence': confidence,
            'learning_recommendations': [],
            'content_adaptation': {},
            'mood_analysis': ''
        }
        
        # Learning recommendations based on emotion
        if emotion == 'happy':
            insights['learning_recommendations'] = [
                "Great mood! This is perfect for tackling challenging topics.",
                "Your positive energy will help with retention and understanding.",
                "Consider exploring advanced concepts while you're feeling confident."
            ]
            insights['content_adaptation'] = {
                'difficulty': 'increase',
                'tone': 'encouraging',
                'pace': 'moderate'
            }
            insights['mood_analysis'] = "You're in an excellent learning state with high engagement potential."
            
        elif emotion == 'sad':
            insights['learning_recommendations'] = [
                "Take it easy and focus on familiar, comfortable topics.",
                "Break down complex concepts into smaller, manageable parts.",
                "Consider taking short breaks between learning sessions."
            ]
            insights['content_adaptation'] = {
                'difficulty': 'decrease',
                'tone': 'gentle',
                'pace': 'slow'
            }
            insights['mood_analysis'] = "You might benefit from a more supportive and gradual learning approach."
            
        elif emotion == 'angry':
            insights['learning_recommendations'] = [
                "Try some breathing exercises before starting.",
                "Focus on practical, hands-on learning activities.",
                "Consider switching to a different subject temporarily."
            ]
            insights['content_adaptation'] = {
                'difficulty': 'maintain',
                'tone': 'calm',
                'pace': 'slow'
            }
            insights['mood_analysis'] = "Your current state might affect concentration; consider stress-reduction techniques."
            
        elif emotion == 'fear' or emotion == 'anxiety':
            insights['learning_recommendations'] = [
                "Start with review materials to build confidence.",
                "Use positive reinforcement and celebrate small achievements.",
                "Consider learning in shorter, focused sessions."
            ]
            insights['content_adaptation'] = {
                'difficulty': 'decrease',
                'tone': 'reassuring',
                'pace': 'very_slow'
            }
            insights['mood_analysis'] = "Anxiety can impact learning; focus on building confidence through familiar content."
            
        elif emotion == 'neutral':
            insights['learning_recommendations'] = [
                "You're in a balanced state - good for focused learning.",
                "Try to maintain this calm focus throughout your session.",
                "This is ideal for learning new concepts."
            ]
            insights['content_adaptation'] = {
                'difficulty': 'maintain',
                'tone': 'neutral',
                'pace': 'normal'
            }
            insights['mood_analysis'] = "Neutral emotional state provides optimal conditions for learning and retention."
            
        else:  # surprise, disgust
            insights['learning_recommendations'] = [
                "Your current state might be distracting from learning.",
                "Consider taking a moment to center yourself.",
                "Try engaging with familiar, comfortable topics."
            ]
            insights['content_adaptation'] = {
                'difficulty': 'maintain',
                'tone': 'neutral',
                'pace': 'normal'
            }
            insights['mood_analysis'] = "Consider returning to learning when you're in a more stable emotional state."
        
        return insights
    
    def adapt_content_style(self, emotion: str, confidence: float, 
                           base_difficulty: int, base_content: str) -> Dict[str, Any]:
        """Adapt content style based on detected emotion"""
        adaptation = {
            'difficulty_adjustment': 0,
            'content_modifications': [],
            'tone_changes': [],
            'pace_adjustments': []
        }
        
        # Difficulty adjustments
        if emotion == 'happy' and confidence > 0.7:
            adaptation['difficulty_adjustment'] = 1
            adaptation['content_modifications'].append("Increase complexity of examples")
            adaptation['content_modifications'].append("Add advanced concepts")
        elif emotion in ['sad', 'fear'] and confidence > 0.6:
            adaptation['difficulty_adjustment'] = -1
            adaptation['content_modifications'].append("Simplify explanations")
            adaptation['content_modifications'].append("Add more examples")
        
        # Tone changes
        if emotion == 'sad':
            adaptation['tone_changes'].append("Use more encouraging language")
            adaptation['tone_changes'].append("Add positive reinforcement")
        elif emotion == 'angry':
            adaptation['tone_changes'].append("Use calming, neutral language")
            adaptation['tone_changes'].append("Avoid challenging statements")
        
        # Pace adjustments
        if emotion in ['sad', 'fear']:
            adaptation['pace_adjustments'].append("Slow down content delivery")
            adaptation['pace_adjustments'].append("Add more breaks between concepts")
        elif emotion == 'happy':
            adaptation['pace_adjustments'].append("Maintain current pace")
            adaptation['pace_adjustments'].append("Allow for faster progression if desired")
        
        return adaptation
