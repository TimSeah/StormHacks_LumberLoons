"""
Webcam + Emotion Detection API
Real-time facial emotion detection using ViT model
Provides REST and WebSocket endpoints
"""

import cv2
import torch
import numpy as np
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
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


def run_webcam_loop(detector):
    """Continuous webcam emotion detection loop"""
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    if not cap.isOpened():
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(1)
            continue

        try:
            emotion_data = detector.detect_emotion(frame)
            socketio.emit("emotion_update", emotion_data)
        except Exception as e:
            pass

        time.sleep(0.5)

    cap.release()


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
    emit("emotion_update", current_emotion_data)


@socketio.on("disconnect")
def handle_disconnect():
    pass


if __name__ == "__main__":
    detector = EmotionDetector()
    detection_thread = threading.Thread(target=run_webcam_loop, args=(detector,))
    detection_thread.daemon = True
    detection_thread.start()
    socketio.run(
        app, host="0.0.0.0", port=5000, debug=False, allow_unsafe_werkzeug=True
    )
