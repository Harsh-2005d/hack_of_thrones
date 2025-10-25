# YOLO Web App Deployment Guide

This guide provides instructions for deploying your YOLO space station safety equipment detection web application on various platforms.

## 🚀 Quick Start

Your application is now deployment-ready! All hardcoded paths have been fixed and deployment files have been created.

## 📋 Pre-Deployment Checklist

- ✅ Trained model copied to project directory
- ✅ Hardcoded paths fixed
- ✅ Requirements.txt updated for deployment
- ✅ Deployment files created (Procfile, Dockerfile, etc.)
- ✅ Environment configuration added

## 🌐 Deployment Options

### Option 1: Heroku (Recommended for beginners)

1. **Install Heroku CLI** from https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app:**
   ```bash
   heroku create your-yolo-app-name
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key-here
   heroku config:set FLASK_ENV=production
   ```

5. **Deploy:**
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Option 2: Render (Good free option)

1. Go to https://render.com and create an account
2. Connect your GitHub repository
3. Choose "Web Service"
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn app:app`
6. Set environment variables:
   - `SECRET_KEY`: your-secret-key-here
   - `FLASK_ENV`: production

### Option 3: Railway

1. Go to https://railway.app
2. Connect your GitHub repository
3. Railway will auto-detect Flask and deploy
4. Set environment variables in the Railway dashboard

### Option 4: Docker (Advanced)

1. **Build the Docker image:**
   ```bash
   docker build -t yolo-webapp .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 yolo-webapp
   ```

## 🔧 Environment Variables

Set these environment variables on your deployment platform:

- `SECRET_KEY`: A secure random string for Flask sessions
- `FLASK_ENV`: Set to `production` for production deployments
- `PORT`: Port number (usually set automatically by the platform)

## 📁 Important Files

- `Procfile`: Tells Heroku how to run your app
- `requirements.txt`: Python dependencies
- `Dockerfile`: For containerized deployments
- `runtime.txt`: Specifies Python version
- `.env.example`: Template for environment variables

## 🚨 Troubleshooting

### Common Issues:

1. **Model loading errors**: The app will fall back to YOLOv8n if your trained model isn't found
2. **Memory issues**: Consider using CPU-only PyTorch versions for smaller deployments
3. **Build timeouts**: Some platforms have build time limits for large dependencies

### Large File Handling:

Your trained model (52MB) should deploy fine on most platforms. If you encounter size issues:
- Consider using Git LFS for the model file
- Or host the model externally and download it at startup

## 🔍 Testing Your Deployment

1. Visit your deployed app URL
2. Upload a test image
3. Verify that detection works correctly
4. Check the logs for any errors

## 📞 Support

If you encounter issues:
1. Check the deployment platform's logs
2. Verify all environment variables are set
3. Ensure the trained model file is included in the deployment

Your YOLO web application is now ready for deployment! 🎉