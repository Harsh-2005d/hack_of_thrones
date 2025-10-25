import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, render_template, jsonify, send_file, url_for
from werkzeug.utils import secure_filename
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import base64
from io import BytesIO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration based on environment
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['RESULTS_FOLDER'] = 'results'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ENV'] = os.environ.get('FLASK_ENV', 'development')

# Ensure upload and results directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)
os.makedirs('static/processed', exist_ok=True)

# YOLO Model Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'trained_model.pt')
CLASSES = [
    "OxygenTank", 
    "NitrogenTank", 
    "FirstAidBox", 
    "FireAlarm", 
    "SafetySwitchPanel", 
    "EmergencyPhone", 
    "FireExtinguisher"
]

# Class colors for visualization (BGR format)
CLASS_COLORS = {
    "OxygenTank": (0, 255, 0),        # Green
    "NitrogenTank": (255, 0, 0),      # Blue
    "FirstAidBox": (0, 0, 255),       # Red
    "FireAlarm": (0, 255, 255),       # Yellow
    "SafetySwitchPanel": (255, 0, 255), # Magenta
    "EmergencyPhone": (255, 255, 0),   # Cyan
    "FireExtinguisher": (128, 0, 128)  # Purple
}

# Global model variable
model = None

def load_model():
    """Load the YOLO model"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = YOLO(MODEL_PATH)
            logger.info(f"Model loaded successfully from {MODEL_PATH}")
        else:
            logger.error(f"Model file not found: {MODEL_PATH}")
            # Fallback to pretrained model for demo
            model = YOLO('yolov8n.pt')
            logger.warning("Using pretrained YOLOv8n model as fallback")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        model = None

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def draw_detections(image_path, detections, confidence_threshold=0.25):
    """Draw bounding boxes and labels on the image"""
    try:
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Could not read image: {image_path}")
            return None, []
        
        height, width = image.shape[:2]
        detection_results = []
        
        for detection in detections:
            confidence = float(detection.conf)
            if confidence < confidence_threshold:
                continue
                
            # Get bounding box coordinates
            x1, y1, x2, y2 = map(int, detection.xyxy[0])
            cls_id = int(detection.cls)
            
            # Get class name and color
            class_name = CLASSES[cls_id] if cls_id < len(CLASSES) else f"Class_{cls_id}"
            color = CLASS_COLORS.get(class_name, (255, 255, 255))
            
            # Draw bounding box
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
            
            # Prepare label
            label = f"{class_name}: {confidence:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
            
            # Draw label background
            cv2.rectangle(image, (x1, y1 - label_size[1] - 10), 
                         (x1 + label_size[0], y1), color, -1)
            
            # Draw label text
            cv2.putText(image, label, (x1, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Store detection info
            detection_results.append({
                'class': class_name,
                'confidence': round(confidence, 3),
                'bbox': [x1, y1, x2, y2],
                'center': [(x1 + x2) // 2, (y1 + y2) // 2]
            })
        
        return image, detection_results
    
    except Exception as e:
        logger.error(f"Error drawing detections: {str(e)}")
        return None, []

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    try:
        _, buffer = cv2.imencode('.png', image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        logger.error(f"Error converting image to base64: {str(e)}")
        return None

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and process with YOLO"""
    if model is None:
        return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500
    
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        confidence_threshold = float(request.form.get('confidence', 0.25))
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported. Please upload an image file.'}), 400
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{unique_id}.{file_extension}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save uploaded file
        file.save(filepath)
        logger.info(f"File saved: {filepath}")
        
        # Run YOLO inference
        results = model.predict(filepath, conf=confidence_threshold)
        
        if not results or results[0].boxes is None:
            return jsonify({
                'message': 'No objects detected',
                'detections': [],
                'image_url': None,
                'stats': {
                    'total_detections': 0,
                    'processing_time': 0,
                    'confidence_threshold': confidence_threshold
                }
            })
        
        # Draw detections on image
        annotated_image, detection_results = draw_detections(
            filepath, results[0].boxes, confidence_threshold
        )
        
        if annotated_image is None:
            return jsonify({'error': 'Error processing image'}), 500
        
        # Convert to base64 for frontend display
        image_base64 = image_to_base64(annotated_image)
        
        # Save annotated image
        result_filename = f"result_{unique_id}.png"
        result_path = os.path.join('static', 'processed', result_filename)
        cv2.imwrite(result_path, annotated_image)
        
        # Calculate statistics
        class_counts = {}
        total_confidence = 0
        for detection in detection_results:
            class_name = detection['class']
            class_counts[class_name] = class_counts.get(class_name, 0) + 1
            total_confidence += detection['confidence']
        
        avg_confidence = total_confidence / len(detection_results) if detection_results else 0
        
        # Prepare response
        response_data = {
            'success': True,
            'detections': detection_results,
            'image_base64': image_base64,
            'result_url': url_for('static', filename=f'processed/{result_filename}'),
            'stats': {
                'total_detections': len(detection_results),
                'class_counts': class_counts,
                'average_confidence': round(avg_confidence, 3),
                'confidence_threshold': confidence_threshold,
                'processing_time': round(results[0].speed['inference'], 2) if results[0].speed else 0
            },
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        logger.info(f"Successfully processed image with {len(detection_results)} detections")
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

if __name__ == '__main__':
    # Load model on startup
    load_model()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)
