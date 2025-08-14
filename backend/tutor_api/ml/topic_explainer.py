import os
import json
import requests
from typing import Dict, List, Any
from transformers import pipeline, AutoTokenizer


class TopicExplainer:
    """AI-powered topic explanation generator using Hugging Face models"""
    
    def __init__(self):
        self.api_key = os.environ.get('HUGGINGFACE_API_KEY', '')
        self.base_url = "https://api.huggingface.co/models"
        
        # For now, use fallback explanations only to avoid model loading delays
        # In production, you would pre-download and cache the models
        self.summarizer = None
        self.generator = None
        print("ℹ️ Using fallback explanations (ML models not loaded)")
    
    def explain_topic(self, topic_name: str, learning_style: str = 'visual') -> Dict[str, Any]:
        """
        Generate comprehensive topic explanation with AI
        
        Args:
            topic_name: The topic to explain
            learning_style: Preferred learning style (visual, auditory, kinesthetic, reading)
            
        Returns:
            Dictionary containing explanation, key points, and applications
        """
        try:
            # Generate main explanation
            explanation = self._generate_explanation(topic_name, learning_style)
            
            # Extract key points
            key_points = self._extract_key_points(explanation)
            
            # Generate real-world applications
            applications = self._generate_applications(topic_name)
            
            # Generate diagrams/visual elements for visual learners
            diagrams = []
            if learning_style == 'visual':
                diagrams = self._generate_visual_elements(topic_name)
            
            return {
                'explanation_text': explanation,
                'key_points': key_points,
                'diagrams': diagrams,
                'real_world_applications': applications,
                'learning_style': learning_style
            }
            
        except Exception as e:
            print(f"Error generating topic explanation: {e}")
            return self._fallback_explanation(topic_name, learning_style)
    
    def _generate_explanation(self, topic: str, learning_style: str) -> str:
        """Generate main explanation using AI models"""
        
        # Try Hugging Face API first
        if self.api_key:
            try:
                prompt = self._create_explanation_prompt(topic, learning_style)
                response = requests.post(
                    f"{self.base_url}/gpt2",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"inputs": prompt, "max_length": 500}
                )
                if response.status_code == 200:
                    return response.json()[0]['generated_text']
            except Exception as e:
                print(f"API call failed: {e}")
        
        # Fallback to local models
        if self.generator:
            try:
                prompt = self._create_explanation_prompt(topic, learning_style)
                result = self.generator(prompt, max_length=500, do_sample=True)
                return result[0]['generated_text']
            except Exception as e:
                print(f"Local generation failed: {e}")
        
        # Final fallback
        return self._create_basic_explanation(topic, learning_style)
    
    def _extract_key_points(self, explanation: str) -> List[str]:
        """Extract key points from explanation"""
        try:
            if self.summarizer:
                summary = self.summarizer(explanation, max_length=100, min_length=30)
                key_points = summary[0]['summary_text'].split('. ')
                return [point.strip() for point in key_points if point.strip()]
        except Exception as e:
            print(f"Key point extraction failed: {e}")
        
        # Fallback: intelligent extraction based on content
        sentences = explanation.split('. ')
        key_points = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and len(sentence) > 10:  # Filter out very short sentences
                # Look for sentences that start with key indicators
                if any(sentence.startswith(indicator) for indicator in ['Key concepts', 'Core concepts', 'Fundamental', 'Understanding', 'Learning']):
                    key_points.append(sentence)
                elif any(keyword in sentence.lower() for keyword in ['important', 'essential', 'crucial', 'fundamental', 'core', 'basic']):
                    key_points.append(sentence)
                elif sentence.count('-') > 0:  # Bullet points
                    key_points.append(sentence)
        
        # If we don't have enough key points, add some general ones
        if len(key_points) < 3:
            remaining_sentences = [s.strip() for s in sentences if s.strip() and s.strip() not in key_points]
            key_points.extend(remaining_sentences[:5-len(key_points)])
        
        return key_points[:5]  # Return max 5 key points
    
    def _generate_applications(self, topic: str) -> List[str]:
        """Generate real-world applications for the topic"""
        applications = [
            f"Understanding {topic} helps in problem-solving",
            f"Knowledge of {topic} is essential for career development",
            f"{topic} has applications in various industries",
            f"Learning {topic} improves critical thinking skills",
            f"{topic} is fundamental for advanced studies"
        ]
        return applications
    
    def _generate_visual_elements(self, topic: str) -> List[str]:
        """Generate visual elements for visual learners"""
        visual_elements = [
            f"Flowchart showing {topic} process",
            f"Mind map of {topic} concepts",
            f"Diagram illustrating {topic} relationships",
            f"Timeline of {topic} development",
            f"Comparison chart of {topic} approaches"
        ]
        return visual_elements
    
    def _create_explanation_prompt(self, topic: str, learning_style: str) -> str:
        """Create a prompt for explanation generation"""
        style_instructions = {
            'visual': 'with clear examples and visual descriptions',
            'auditory': 'with conversational tone and audio-friendly explanations',
            'kinesthetic': 'with hands-on activities and practical examples',
            'reading': 'with detailed explanations and comprehensive coverage'
        }
        
        instruction = style_instructions.get(learning_style, 'with clear examples')
        
        return f"Explain {topic} {instruction}. Make it engaging and educational for students."
    
    def _create_basic_explanation(self, topic: str, learning_style: str) -> str:
        """Create a comprehensive basic explanation when AI models fail"""
        
        # Topic-specific explanations
        topic_explanations = {
            'python': f"""
            {topic} is a high-level, interpreted programming language known for its simplicity and readability. 
            It's widely used in web development, data science, artificial intelligence, and automation.
            
            Key concepts include:
            - Variables and data types (strings, integers, lists, dictionaries)
            - Control structures (if/else, loops, functions)
            - Object-oriented programming principles
            - File handling and data processing
            - Libraries and frameworks (NumPy, Pandas, Django, Flask)
            
            Python's syntax emphasizes code readability with significant whitespace and clear structure.
            """,
            'machine learning': f"""
            {topic} is a subset of artificial intelligence that enables computers to learn and improve from experience 
            without being explicitly programmed. It focuses on developing algorithms that can access data and learn from it.
            
            Core concepts include:
            - Supervised learning (classification, regression)
            - Unsupervised learning (clustering, dimensionality reduction)
            - Neural networks and deep learning
            - Model training, validation, and testing
            - Feature engineering and data preprocessing
            
            Applications range from recommendation systems to autonomous vehicles and medical diagnosis.
            """,
            'data structures': f"""
            {topic} are specialized formats for organizing, processing, retrieving, and storing data. 
            They provide efficient ways to manage information in computer programs.
            
            Fundamental structures include:
            - Arrays and linked lists for sequential data
            - Stacks and queues for ordered operations
            - Trees and graphs for hierarchical relationships
            - Hash tables for fast data retrieval
            - Heaps for priority-based operations
            
            Understanding data structures is crucial for writing efficient algorithms and programs.
            """,
            'web development': f"""
            {topic} involves creating websites and web applications using various technologies and programming languages. 
            It encompasses both frontend (user interface) and backend (server-side logic) development.
            
            Key areas include:
            - HTML, CSS, and JavaScript for frontend
            - Server-side languages (Python, Node.js, PHP)
            - Databases and data management
            - APIs and web services
            - Security and performance optimization
            
            Modern web development emphasizes responsive design, accessibility, and user experience.
            """
        }
        
        # Check if we have a specific explanation for this topic
        topic_lower = topic.lower()
        for key, explanation in topic_explanations.items():
            if key in topic_lower:
                return explanation.strip()
        
        # Generic explanation for other topics
        base_explanation = f"""
        {topic} is a fundamental concept that involves understanding core principles and their applications. 
        It's important to grasp the basic concepts first before moving to advanced topics.
        
        Key aspects include:
        - Understanding the fundamental principles
        - Learning through examples and practice
        - Applying knowledge to real-world situations
        - Building a strong foundation for advanced learning
        - Connecting concepts to related fields
        
        This topic is essential for developing critical thinking and problem-solving skills.
        """
        
        return base_explanation.strip()
    
    def _fallback_explanation(self, topic: str, learning_style: str) -> Dict[str, Any]:
        """Provide fallback explanation when everything else fails"""
        return {
            'explanation_text': self._create_basic_explanation(topic, learning_style),
            'key_points': [
                f"Understanding {topic} fundamentals",
                "Practice and application",
                "Real-world examples",
                "Continuous learning",
                "Building strong foundation"
            ],
            'diagrams': [
                f"Basic {topic} concept map",
                f"{topic} learning path",
                f"{topic} application examples"
            ],
            'real_world_applications': [
                f"Career development in {topic}",
                f"Problem-solving with {topic}",
                f"Academic advancement",
                f"Industry applications",
                f"Research opportunities"
            ],
            'learning_style': learning_style
        }
