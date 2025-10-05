# Carrie - Emotion-Aware Therapy Agent

**SFU StormSurge 2025 Entry**

AI-powered therapeutic agent using real-time facial emotion detection, mental health LLM, and optional text-to-speech.

## Features

- **Real-time Emotion Detection**: ViT model detecting 7 emotions (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral)
- **Mental Health LLM**: Context-aware therapeutic responses using `thrishala/mental_health_chatbot`
- **Optional Text-to-Speech**: ElevenLabs voice output
- **Modular Architecture**: 3 independent components + main integration

## Quick Setup

### 1. Install Dependencies
```powershell
conda create -n SFU python=3.10 -y
conda activate SFU
pip install -r ai/requirements.txt
pip install "numpy==1.26.4" --force-reinstall
```

**Note:** First run downloads mental health chatbot model (~13.5GB) - takes 10-20 minutes.

### 2. Configure ElevenLabs (Optional - for TTS)
Create `ai/.env`:
```env
ELEVENLABS_API_KEY=your_api_key_here
```
Get API key: https://elevenlabs.io/app/settings/api-keys

### 3. Run (2 Terminals)
**Terminal 1 - Emotion Detection:**
```powershell
conda activate SFU
cd ai
python emotion_detector.py
```

**Terminal 2 - Main App:**
```powershell
conda activate SFU
cd ai
python carrie.py
```

## Architecture

```
┌─────────────────┐
│ emotion_detector│  ← Webcam + CV + API
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│    carrie.py    │  ← Main App
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐ ┌──────────┐
│llm_     │ │tts_      │
│therapist│ │client    │
└─────────┘ └──────────┘
```

## Components

### 1. `emotion_detector.py` - Webcam + CV API
- **Purpose**: Real-time facial emotion detection + REST/WebSocket API
- **Model**: `abhilash88/face-emotion-detection` (ViT)
- **Detects**: 7 emotions (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral)
- **API**: Port 5000
  - `GET /api/emotion` - Current emotion
  - `GET /api/health` - Health check
  - `ws://localhost:5000` - WebSocket stream
- **Test standalone:** `python emotion_detector.py`

### 2. `llm_therapist.py` - Mental Health LLM
- **Purpose**: Mental health chatbot with emotion awareness
- **Model**: `thrishala/mental_health_chatbot` (~13.5GB, downloads on first run)
- **Features**:
  - Emotion-aware prompting
  - Emotion shift detection
  - Fallback responses
- **Test standalone:** `python llm_therapist.py`

### 3. `tts_client.py` - Text-to-Speech
- **Purpose**: Text-to-speech conversion
- **API**: ElevenLabs
- **Fallback**: Works in text-only mode without API key
- **Test standalone:** `python tts_client.py`

### Main App: `carrie.py`
- **Purpose**: Main integration connecting all components
- **Features**:
  - WebSocket emotion streaming
  - Interactive conversation
  - Commands: `summary`, `quit`

## Usage Example

```
python ai/carrie.py

DR. CARRIE - THERAPY SESSION
Commands: 'summary' | 'quit' | 'exit'

Carrie: Hi, I'm Dr. Carrie. How are you feeling today?

You: I'm feeling stressed about work
Carrie: That sounds really difficult. Tell me more about what you're experiencing.

You: quit
Carrie: Take care of yourself. Remember, I'm here whenever you need to talk.

Session Summary:
  Duration: 15.5 seconds
  Most common: Sad
  Avg confidence: 82%
```

## File Structure

```
ai/
├── emotion_detector.py    # Webcam + CV API (118 lines)
├── llm_therapist.py       # Mental health LLM (145 lines)
├── tts_client.py          # Text-to-speech (50 lines)
├── carrie.py              # Main app (95 lines)
├── requirements.txt       # Dependencies
└── .env                   # API keys (optional)
```

## API Endpoints

### REST
```http
GET http://localhost:5000/api/emotion
Response: {
  "emotion": "Happy",
  "confidence": 0.92,
  "timestamp": 1728086400.123,
  "face_detected": true
}

GET http://localhost:5000/api/health
Response: {
  "status": "healthy",
  "service": "emotion-detection-api"
}
```

### WebSocket
```javascript
socket.emit('connect', 'http://localhost:5000');
socket.on('emotion_update', (data) => {
  console.log(data.emotion, data.confidence);
});
```

## Troubleshooting

### Numpy Errors
```powershell
pip install "numpy==1.26.4" "h5py==3.11.0" --force-reinstall
```

### Webcam Not Working
- Check Windows Settings → Privacy → Camera
- Close other apps using webcam
- Try different camera: Change `cv2.VideoCapture(0)` to `cv2.VideoCapture(1)`

### Port 5000 Busy
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Model Download Slow
- First run downloads ~13.5GB
- Takes 10-20 minutes on good connection
- Cached in `~/.cache/huggingface/`

### TTS Not Working
- Add `ELEVENLABS_API_KEY` to `ai/.env`
- System works in text-only mode without it

## Performance

- **Emotion Detection**: 2 FPS, ~100ms latency
- **LLM Generation**: 2-5 seconds per response
- **TTS**: ~1 second per sentence
- **Memory**: ~8GB RAM (with LLM loaded)
- **Disk**: ~15GB (models cached)

## Safety & Ethics

⚠️ **Important**: This is an AI assistant, NOT professional therapy.

- No diagnosis or prescription capabilities
- Crisis detection protocols not implemented
- Privacy-focused (no data sent to external servers except TTS)

For mental health emergencies:
- **988 Suicide & Crisis Lifeline** (US)
- **Text HOME to 741741** (Crisis Text Line)

## Credits

- **Emotion Model**: abhilash88/face-emotion-detection (Hugging Face)
- **LLM Model**: thrishala/mental_health_chatbot (Hugging Face)
- **TTS**: ElevenLabs
- **Framework**: Flask, Socket.IO, PyTorch, Transformers

---

**Built for SFU StormSurge 2025** 🚀
