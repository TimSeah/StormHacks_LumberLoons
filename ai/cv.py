import cv2
import torch
import numpy as np
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import time

# Initialize the emotion detection model
print("Loading emotion detection model...")
model_name = "abhilash88/face-emotion-detection"
processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(model_name)
model.eval()  # Set to evaluation mode

# Emotion labels
emotions = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Initialize webcam
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FPS, 30)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# Performance optimization variables
frame_count = 0
process_every_n_frames = 2  # Process every 2nd frame for speed
last_emotions = {}  # Cache emotions for detected faces
fps_start_time = time.time()
fps = 0

print("Starting webcam feed... Press 'q' to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    frame_count += 1

    # Calculate FPS
    if frame_count % 30 == 0:
        fps = 30 / (time.time() - fps_start_time)
        fps_start_time = time.time()

    # Convert to grayscale for face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(48, 48),
        flags=cv2.CASCADE_SCALE_IMAGE,
    )

    # Process emotions only every N frames for performance
    if frame_count % process_every_n_frames == 0:
        for i, (x, y, w, h) in enumerate(faces):
            # Extract face region
            face_roi = frame[y : y + h, x : x + w]

            # Convert to PIL Image
            face_pil = Image.fromarray(cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB))

            # Preprocess for model
            inputs = processor(images=face_pil, return_tensors="pt")

            # Predict emotion (no gradient computation for speed)
            with torch.no_grad():
                outputs = model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class = torch.argmax(predictions, dim=-1).item()
                confidence = predictions[0][predicted_class].item()

            # Cache the result
            last_emotions[i] = {
                "emotion": emotions[predicted_class],
                "confidence": confidence,
            }

    # Draw rectangles and labels for all detected faces
    for i, (x, y, w, h) in enumerate(faces):
        # Get cached emotion or default
        if i in last_emotions:
            emotion = last_emotions[i]["emotion"]
            confidence = last_emotions[i]["confidence"]
        else:
            emotion = "Processing..."
            confidence = 0.0

        # Choose color based on emotion
        color_map = {
            "Happy": (0, 255, 0),  # Green
            "Sad": (255, 0, 0),  # Blue
            "Angry": (0, 0, 255),  # Red
            "Surprise": (0, 255, 255),  # Yellow
            "Fear": (128, 0, 128),  # Purple
            "Disgust": (0, 128, 128),  # Olive
            "Neutral": (255, 255, 255),  # White
        }
        color = color_map.get(emotion, (255, 255, 255))

        # Draw rectangle around face
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

        # Prepare label text
        label = f"{emotion} ({confidence*100:.1f}%)"

        # Draw label background
        (label_width, label_height), _ = cv2.getTextSize(
            label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
        )
        cv2.rectangle(
            frame, (x, y - label_height - 10), (x + label_width, y), color, -1
        )

        # Draw label text
        cv2.putText(
            frame, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2
        )

    # Display FPS
    cv2.putText(
        frame, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
    )

    # Display the frame
    cv2.imshow("Real-time Emotion Detection", frame)

    # Exit on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
print("Program terminated")
