"""
LiveKit Video Stream + Emotion Detection API
Real-time facial emotion detection using ViT model
Receives video frames from LiveKit via WebSocket
Provides REST and WebSocket endpoints
"""

import cv2
import torch
import numpy as np
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import base64
import io
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global emotion data
current_emotion_data = {
    "emotion": "Neutral",
    "confidence": 0.0,
    "timestamp": time.time(),
    "face_detected": False,
}


class EmotionDetector:
    def __init__(self):
        model_name = "abhilash88/face-emotion-detection"
        self.processor = ViTImageProcessor.from_pretrained(model_name)
        self.model = ViTForImageClassification.from_pretrained(model_name)
        self.model.eval()

        self.emotions = [
            "Angry",
            "Disgust",
            "Fear",
            "Happy",
            "Sad",
            "Surprise",
            "Neutral",
        ]
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

    def detect_emotion(self, frame):
        """Detect emotion from video frame"""
        global current_emotion_data

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48)
        )

        if len(faces) > 0:
            x, y, w, h = faces[0]
            face_roi = frame[y : y + h, x : x + w]
            face_pil = Image.fromarray(cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB))

            inputs = self.processor(images=face_pil, return_tensors="pt")

            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class = torch.argmax(predictions, dim=-1).item()
                confidence = predictions[0][predicted_class].item()

            current_emotion_data = {
                "emotion": self.emotions[predicted_class],
                "confidence": float(confidence),
                "timestamp": time.time(),
                "face_detected": True,
            }
        else:
            current_emotion_data = {
                "emotion": "No face detected",
                "confidence": 0.0,
                "timestamp": time.time(),
                "face_detected": False,
            }

        return current_emotion_data

    def process_frame_from_base64(self, base64_image):
        """Process a base64 encoded image frame from LiveKit"""
        try:
            # Decode base64 image (remove data:image prefix if present)
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            
            image_data = base64.b64decode(base64_image)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert PIL image to numpy array for OpenCV
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Detect emotion from the frame
            return self.detect_emotion(frame)
        except Exception as e:
            print(f"Error processing frame: {e}")
            return {
                "emotion": "Error",
                "confidence": 0.0,
                "timestamp": time.time(),
                "face_detected": False,
                "error": str(e)
            }


# Initialize detector globally
detector = EmotionDetector()


# REST API Endpoints
@app.route("/api/emotion", methods=["GET"])
def get_emotion():
    """Get current emotion data"""
    return jsonify(current_emotion_data)


@app.route("/api/webhook/emotion", methods=["GET", "POST"])
def webhook_emotion():
    """
    Webhook endpoint for ElevenLabs agent
    Returns current emotion in a format suitable for LLM context injection
    """
    emotion = current_emotion_data.get("emotion", "Neutral")
    confidence = current_emotion_data.get("confidence", 0.0)
    face_detected = current_emotion_data.get("face_detected", False)

    if not face_detected or emotion == "No face detected":
        return jsonify(
            {
                "emotion": "Neutral",
                "confidence": 0.0,
                "face_detected": False,
                "context": "No face detected. Proceed with neutral conversation.",
                "emotional_state": "unknown",
            }
        )

    # Map emotions to conversational context
    emotion_contexts = {
        "Happy": f"The user appears happy (confidence: {confidence:.0%}). They seem in a positive mood.",
        "Sad": f"The user appears sad (confidence: {confidence:.0%}). They may need empathy and support.",
        "Angry": f"The user appears angry (confidence: {confidence:.0%}). Approach with care and validation.",
        "Fear": f"The user appears fearful or anxious (confidence: {confidence:.0%}). Provide reassurance.",
        "Surprise": f"The user appears surprised (confidence: {confidence:.0%}). They may be processing new information.",
        "Disgust": f"The user appears uncomfortable or disgusted (confidence: {confidence:.0%}). Be gentle and understanding.",
        "Neutral": f"The user appears calm and neutral (confidence: {confidence:.0%}).",
    }

    context = emotion_contexts.get(emotion, f"The user's emotion is {emotion}.")

    # Return webhook response
    return jsonify(
        {
            "emotion": emotion,
            "confidence": float(confidence),
            "face_detected": True,
            "context": context,
            "emotional_state": emotion.lower(),
            "timestamp": current_emotion_data.get("timestamp", time.time()),
        }
    )


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "emotion-detection-api",
            "timestamp": time.time(),
        }
    )


# WebSocket Handlers
@socketio.on("connect")
def handle_connect():
    """Handle client connection"""
    print(f"Client connected: {request.sid}")
    emit("emotion_update", current_emotion_data)


@socketio.on("disconnect")
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")


@socketio.on("video_frame")
def handle_video_frame(data):
    """
    Receive video frame from LiveKit frontend and process emotion
    Expected data format: {"frame": "base64_encoded_image", "timestamp": 1234567890}
    """
    try:
        frame_data = data.get("frame")
        if not frame_data:
            emit("emotion_error", {"error": "No frame data provided"})
            return
        
        # Process the frame
        emotion_data = detector.process_frame_from_base64(frame_data)
        
        # Emit emotion update to all connected clients
        socketio.emit("emotion_update", emotion_data, broadcast=True)
        
        # Also emit back to sender with acknowledgment
        emit("emotion_processed", {
            "status": "success",
            "emotion": emotion_data.get("emotion"),
            "confidence": emotion_data.get("confidence")
        })
        
    except Exception as e:
        print(f"Error handling video frame: {e}")
        emit("emotion_error", {"error": str(e)})


@app.route("/api/process_frame", methods=["POST"])
def process_frame_rest():
    """
    REST endpoint to process a single frame
    Accepts base64 encoded image in JSON body
    """
    try:
        data = request.get_json()
        frame_data = data.get("frame")
        
        if not frame_data:
            return jsonify({"error": "No frame data provided"}), 400
        
        emotion_data = detector.process_frame_from_base64(frame_data)
        return jsonify(emotion_data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("="*60)
    print("Starting Emotion Detection API with LiveKit integration...")
    print("="*60)
    print("📡 WebSocket: ws://localhost:5000")
    print("   - Event 'video_frame': Send base64 encoded frames")
    print("   - Event 'emotion_update': Receive emotion data")
    print("🌐 REST API: http://localhost:5000")
    print("   - POST /api/process_frame: Process single frame")
    print("   - GET  /api/emotion: Get current emotion")
    print("   - GET  /api/webhook/emotion: ElevenLabs webhook")
    print("="*60)
    
    socketio.run(
        app, host="0.0.0.0", port=5000, debug=False, allow_unsafe_werkzeug=True
    )
