=======
# 🚀 YOLO Space Station Safety Equipment Detector

A professional web application for detecting critical safety equipment in space station environments using advanced YOLO (You Only Look Once) computer vision technology.

![Application Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![YOLO](https://img.shields.io/badge/YOLO-v8-orange)

## 🌟 Features

### 🎯 Core Detection Capabilities
- **7 Safety Equipment Classes**: OxygenTank, NitrogenTank, FirstAidBox, FireAlarm, SafetySwitchPanel, EmergencyPhone, FireExtinguisher
- **High Accuracy**: Trained model with 85.53% mAP@0.5 and 76.49% mAP@0.5:0.95
- **Real-time Processing**: Fast inference with GPU acceleration support
- **Adjustable Confidence**: Dynamic confidence threshold slider (0.1 - 0.9)

### 🖥️ Modern Web Interface
- **Drag & Drop Upload**: Intuitive file upload with visual feedback
- **Live Preview**: Image preview with metadata display
- **Interactive Results**: Detailed detection results with bounding boxes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Professional gradient background with glassmorphism effects

### 📊 Advanced Analytics
- **Detection Statistics**: Total objects, average confidence, processing time
- **Class Distribution**: Visual breakdown of detected equipment types
- **Detailed Table**: Comprehensive detection data with coordinates
- **Export Options**: Download annotated images with detections

### 🚀 User Experience
- **Real-time Progress**: Animated progress indicators during processing
- **Keyboard Shortcuts**: Power user shortcuts (Ctrl+O, Enter, F, D, Escape)
- **Fullscreen View**: High-resolution result viewing
- **Toast Notifications**: Instant feedback for all user actions
- **Error Handling**: Graceful error recovery with user-friendly messages

## 📋 Requirements

### System Requirements
- **Python**: 3.8 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **GPU**: Optional but recommended for faster processing

### Python Dependencies
```txt
Flask==3.0.0
ultralytics==8.3.203
opencv-python==4.10.0.84
torch==2.1.0
numpy==1.24.3
Pillow==10.4.0
```

## 🛠️ Installation

### Method 1: Quick Setup
```bash
# Clone or navigate to the project directory
cd yolo_webapp

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
```

### Method 2: Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv yolo_env

# Activate virtual environment
# Windows:
yolo_env\Scripts\activate
# macOS/Linux:
source yolo_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
```

### Method 3: Docker Setup
```bash
# Build Docker image
docker build -t yolo-webapp .

# Run container
docker run -p 5000:5000 yolo-webapp
```

## 🚀 Usage

### Starting the Application

#### Basic Usage
```bash
python run.py
```
Open your browser and navigate to: `http://localhost:5000`

#### Advanced Usage
```bash
# Custom host and port
python run.py --host 0.0.0.0 --port 8080

# Enable debug mode
python run.py --debug

# Production configuration
python run.py --config production --host 0.0.0.0 --port 5000
```

### Using the Web Interface

1. **Upload Image**
   - Drag and drop an image file onto the upload area
   - Or click to browse and select a file
   - Supported formats: JPG, PNG, JPEG, GIF, BMP, TIFF, WEBP
   - Maximum file size: 16MB

2. **Configure Detection**
   - Adjust the confidence threshold slider (default: 0.25)
   - Lower values detect more objects but may include false positives
   - Higher values are more selective but may miss objects

3. **Process Image**
   - Click "Process Image" button
   - Watch the real-time progress indicator
   - Results will appear automatically when processing completes

4. **View Results**
   - Browse detection statistics and class distribution
   - View the annotated image with bounding boxes
   - Check the detailed detection table
   - Use fullscreen mode for better visibility

5. **Export Results**
   - Click "Download Result" to save the annotated image
   - Use "New Analysis" to process another image

### Keyboard Shortcuts
- **Ctrl+O**: Open file dialog
- **Enter**: Process current image
- **F**: Toggle fullscreen view
- **D**: Download results
- **Escape**: Close fullscreen or reset application

## 📁 Project Structure

```
yolo_webapp/
├── app.py                  # Main Flask application
├── run.py                  # Application runner script
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css      # Application styles
│   ├── js/
│   │   └── main.js        # Frontend JavaScript
│   └── processed/         # Generated result images
├── uploads/               # Temporary uploaded files
└── results/               # Processing results
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
# Flask Configuration
SECRET_KEY=your-production-secret-key
FLASK_ENV=production

# Model Configuration
MODEL_PATH=/path/to/your/trained_model.pt

# Server Configuration
HOST=0.0.0.0
PORT=5000

# Upload Configuration
UPLOAD_FOLDER=uploads
RESULTS_FOLDER=results
MAX_FILE_SIZE=16777216

# Logging
LOG_LEVEL=INFO
LOG_FILE=yolo_webapp.log
```

### Model Configuration
The application expects your trained YOLO model at:
```
C:\Users\shado\OneDrive\project-folder\duality_ai_space_station_submission\trained_model.pt
```

To use a different model path, either:
1. Update the path in `config.py`
2. Set the `MODEL_PATH` environment variable
3. Modify the `MODEL_PATH` constant in `app.py`

## 🌐 API Endpoints

### POST /upload
Upload and process an image for object detection.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Image file (required)
  - `confidence`: Confidence threshold (optional, default: 0.25)

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "class": "OxygenTank",
      "confidence": 0.945,
      "bbox": [100, 150, 200, 250],
      "center": [150, 200]
    }
  ],
  "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "stats": {
    "total_detections": 7,
    "class_counts": {"OxygenTank": 4, "NitrogenTank": 3},
    "average_confidence": 0.823,
    "processing_time": 362.4
  }
}
```

### GET /health
Check application and model status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🎨 Customization

### Adding New Classes
1. Update `CLASSES` list in `config.py`
2. Add corresponding colors to `CLASS_COLORS`
3. Update the legend in the HTML template
4. Retrain your YOLO model with new classes

### Styling Modifications
- Edit `static/css/style.css` for visual changes
- Modify CSS variables at the top of the file for color schemes
- Update `templates/index.html` for layout changes

### Performance Tuning
- Adjust batch size in model configuration
- Modify image preprocessing parameters
- Configure GPU settings in PyTorch

## 🔧 Troubleshooting

### Common Issues

**Model Loading Error**
```
Error: Model file not found
```
**Solution**: Check the model path in `config.py` and ensure the file exists.

**CUDA Out of Memory**
```
RuntimeError: CUDA out of memory
```
**Solution**: Reduce batch size or use CPU inference by setting `device='cpu'`.

**Port Already in Use**
```
OSError: [Errno 48] Address already in use
```
**Solution**: Use a different port: `python run.py --port 8080`

**File Upload Error**
```
413 Request Entity Too Large
```
**Solution**: Check file size (must be < 16MB) or increase `MAX_CONTENT_LENGTH`.

### Debug Mode
Enable debug mode for detailed error messages:
```bash
python run.py --debug
```

### Logs
Check application logs:
- Console output for immediate feedback
- `yolo_webapp.log` for persistent logging
- Browser developer tools for frontend issues

## 🚀 Deployment

### Development
```bash
python run.py --debug
```

### Production with Gunicorn
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["python", "run.py", "--host", "0.0.0.0"]
```

### Cloud Deployment (AWS, GCP, Azure)
1. Package the application
2. Configure environment variables
3. Set up load balancing (if needed)
4. Configure SSL/HTTPS
5. Set up monitoring and logging

## 📈 Performance Metrics

### Model Performance
- **mAP@0.5**: 85.53%
- **mAP@0.5:0.95**: 76.49%
- **Precision**: 91.98%
- **Recall**: 73.71%
- **F1-Score**: 81.84%

### System Performance
- **Average Processing Time**: ~360ms per image
- **Memory Usage**: ~2GB with GPU
- **Supported File Formats**: 7 image types
- **Maximum File Size**: 16MB
- **Concurrent Users**: Configurable with Gunicorn

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **YOLO Team**: For the incredible object detection framework
- **Ultralytics**: For the easy-to-use YOLOv8 implementation
- **Flask Team**: For the lightweight web framework
- **OpenCV Community**: For computer vision tools
- **Duality AI**: For the space station challenge dataset

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the configuration options

---

**Made with ❤️ for space station safety and computer vision excellence**
>>>>>>> 97cc98c (Initial commit)
