#!/usr/bin/env python3
"""
YOLO Web Application Runner

This script starts the Flask web application for YOLO-based 
space station safety equipment detection.

Usage:
    python run.py [--host HOST] [--port PORT] [--debug]
    
Examples:
    python run.py                          # Run on localhost:5000
    python run.py --host 0.0.0.0 --port 8080 --debug  # Custom settings
"""

import argparse
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app import app, load_model
from config import config

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description='YOLO Space Station Safety Equipment Detection Web App'
    )
    
    parser.add_argument(
        '--host', 
        default='127.0.0.1',
        help='Host to bind to (default: 127.0.0.1)'
    )
    
    parser.add_argument(
        '--port', 
        type=int, 
        default=5000,
        help='Port to bind to (default: 5000)'
    )
    
    parser.add_argument(
        '--debug', 
        action='store_true',
        help='Enable debug mode'
    )
    
    parser.add_argument(
        '--config',
        choices=['development', 'production', 'testing'],
        default='development',
        help='Configuration to use (default: development)'
    )
    
    return parser.parse_args()

def main():
    """Main function to run the application"""
    args = parse_arguments()
    
    # Set up configuration
    config_name = args.config
    app.config.from_object(config[config_name])
    
    # Initialize the app
    config[config_name].init_app(app)
    
    print("🚀 Starting YOLO Web Application...")
    print(f"📊 Configuration: {config_name}")
    print(f"🌐 Host: {args.host}")
    print(f"🔌 Port: {args.port}")
    print(f"🐛 Debug: {args.debug}")
    
    # Load the YOLO model
    print("🤖 Loading YOLO model...")
    load_model()
    print("✅ Model loaded successfully!")
    
    print(f"🌟 Application ready! Visit: http://{args.host}:{args.port}")
    print("🛑 Press Ctrl+C to stop the server")
    
    try:
        # Run the Flask app
        app.run(
            host=args.host,
            port=args.port,
            debug=args.debug,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
