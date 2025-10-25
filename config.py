import os
from pathlib import Path

class Config:
    """Base configuration class"""
    
    # Basic Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    RESULTS_FOLDER = os.environ.get('RESULTS_FOLDER') or 'results'
    
    # YOLO Model configuration
    MODEL_PATH = os.environ.get('MODEL_PATH') or r"C:\Users\shado\OneDrive\project-folder\duality_ai_space_station_submission\trained_model.pt"
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
    
    # Detection classes
    CLASSES = [
        "OxygenTank", 
        "NitrogenTank", 
        "FirstAidBox", 
        "FireAlarm", 
        "SafetySwitchPanel", 
        "EmergencyPhone", 
        "FireExtinguisher"
    ]
    
    # Class colors for visualization (BGR format for OpenCV)
    CLASS_COLORS = {
        "OxygenTank": (0, 255, 0),        # Green
        "NitrogenTank": (255, 0, 0),      # Blue
        "FirstAidBox": (0, 0, 255),       # Red
        "FireAlarm": (0, 255, 255),       # Yellow
        "SafetySwitchPanel": (255, 0, 255), # Magenta
        "EmergencyPhone": (255, 255, 0),   # Cyan
        "FireExtinguisher": (128, 0, 128)  # Purple
    }
    
    # Default confidence threshold
    DEFAULT_CONFIDENCE = 0.25
    
    # Logging configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    LOG_FILE = os.environ.get('LOG_FILE') or 'yolo_webapp.log'
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        # Ensure required directories exist
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.RESULTS_FOLDER, exist_ok=True)
        os.makedirs('static/processed', exist_ok=True)
        
        # Validate model path
        if not os.path.exists(Config.MODEL_PATH):
            print(f"Warning: Model file not found at {Config.MODEL_PATH}")
            print("The application will use a fallback pretrained model.")

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Use environment variables for sensitive information in production
    SECRET_KEY = os.environ.get('SECRET_KEY')
    MODEL_PATH = os.environ.get('MODEL_PATH')
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Log to stderr in production
        import logging
        from logging import StreamHandler
        file_handler = StreamHandler()
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    # Use in-memory database or test-specific settings

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
