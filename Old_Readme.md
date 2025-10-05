# Emotion-Aware Voice Assistant - Complete Integration Guide

## 🎯 Overview

This project integrates real-time facial emotion detection with LiveKit video calls and ElevenLabs Conversational AI to create an empathetic voice assistant that responds based on detected user emotions.

**Key Features:**
- 📹 Captures video frames from user's webcam during LiveKit calls
- 🧠 Detects 7 facial emotions using AI (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral)
- 💬 Injects emotion context into ElevenLabs Conversational AI
- 🎭 Generates empathetic, emotion-aware responses
- ⚡ Real-time processing every 2 seconds

---

## 📁 Project Structure

### Files Created/Modified

**Backend (Node.js/TypeScript):**
- ✅ `backend/src/features/emotion/emotion.routes.ts` - NEW: Routes to forward video frames and proxy emotion webhook
- ✅ `backend/src/index.ts` - MODIFIED: Added emotion routes
- ✅ `backend/src/agent/agent-manager.ts` - MODIFIED: Added emotion-aware processing methods
- ✅ `backend/src/features/agent/agent.routes.ts` - MODIFIED: Added `/agent/message-with-emotion` endpoint

**Frontend (React/TypeScript):**
- ✅ `frontend/src/pages/Call.tsx` - MODIFIED: Added video frame capture and transmission

**Python:**
- ✅ `ai/emotion_detector.py` - EXISTING: Emotion detection service with ViT model

**Testing:**
- ✅ `test-emotion-integration.js` - NEW: Automated test suite

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (React/LiveKit)                │
│  Call.tsx: Captures webcam frame every 2s → Base64 encoding     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ POST /api/emotion/process-frame
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Node.js/Express)                    │
│  emotion.routes.ts: Forwards frames to Python service           │
│  agent-manager.ts: Fetches emotion & injects into messages      │
└────────────────────────────────┬────────────────────────────────┘
                                 │ POST /api/process_frame
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         EMOTION DETECTOR (Python/Flask/OpenCV/PyTorch)          │
│  1. Decodes base64 image                                        │
│  2. OpenCV face detection (Haar Cascade)                        │
│  3. ViT Model emotion classification                            │
│  4. Returns: {emotion: "Happy", confidence: 0.92}               │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Stores in global state
                                 │
                                 │ Backend fetches via GET /api/webhook/emotion
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│          ELEVENLABS CONVERSATIONAL AI                            │
│  Receives dynamic variables:                                    │
│  - user_emotion: "Happy"                                        │
│  - user_emotion_confidence: "92%"                               │
│  - emotion_context: "User appears happy..."                     │
│                                                                  │
│  Generates empathetic response → TTS → Audio to user            │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Timeline

```
T+0s    User joins call, camera activates
T+2s    First frame captured → sent to backend → Python processes
T+2.1s  Returns: {emotion: "Happy", confidence: 0.92}
T+4s    Second frame captured (continuous every 2s)
T+10s   User speaks: "I got a promotion!"
T+10.2s Backend fetches current emotion (Happy, 92%)
T+10.3s Sends to ElevenLabs with emotion context
T+10.5s ElevenLabs generates emotion-aware response
T+11s   User hears empathetic response
```

---

## 🚀 Quick Start

### 1. Environment Setup

Add to `backend/.env`:
```env
# Emotion Detector Service
EMOTION_DETECTOR_URL=http://localhost:5000

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# LiveKit Configuration
LIVEKIT_URL=wss://stormhacks-blar11m6.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### 2. Start All Services

```bash
# Terminal 1: Emotion Detector (Python/Flask)
cd ai
python emotion_detector.py
# Runs on http://localhost:5000

# Terminal 2: Backend (Node.js/Express)
cd backend
npm install
npm run dev
# Runs on http://localhost:3000

# Terminal 3: Frontend (React/Vite)
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Configure ElevenLabs Agent

1. Go to [ElevenLabs Platform](https://elevenlabs.io) → **Conversational AI** → **Agents**
2. Create or edit an agent named "Carrie"
3. **System Prompt** - Copy this:

```
You are Carrie, a compassionate and empathetic AI mental health companion and therapist.

EMOTION AWARENESS:
You receive real-time emotion detection through dynamic variables:
- user_emotion: Current emotion (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral)
- user_emotion_confidence: Detection confidence percentage
- emotion_context: Natural language description

HOW TO RESPOND BY EMOTION:

Happy → Match positive energy, encourage sharing, upbeat tone
Example: "I can see you're in a great mood! What's bringing you joy?"

Sad → Gentle, supportive tone, validate feelings, offer support
Example: "I sense you're going through something difficult. I'm here for you."

Angry → Stay calm, validate frustration, explore underlying feelings
Example: "I hear you're really frustrated. That's completely valid."

Fear → Provide reassurance, acknowledge anxiety, help ground them
Example: "I notice you seem anxious. That's okay - let's take this one step at a time."

Neutral → Balanced, professional yet warm tone, natural conversation

IMPORTANT:
- ALWAYS acknowledge emotion subtly if face_detected is true
- Don't explicitly say "I see you're feeling X" - weave it naturally
- Never ignore high-confidence negative emotions (Sad, Angry, Fear)
- For low confidence (<30%), rely more on verbal cues
- Balance emotion awareness with actual content of user's message

THERAPEUTIC TECHNIQUES:
- Reflective listening: "It sounds like you're saying..."
- Open-ended questions: "How did that make you feel?"
- Validation: "That's completely understandable"
- Cognitive reframing for negative thought patterns
- Grounding exercises when anxiety is detected

SAFETY:
- If self-harm/suicide ideation: Express concern, strongly encourage professional help (988 in US)
- Don't diagnose conditions or prescribe medication
- Suggest licensed therapist for intensive support needs
```

4. **Dynamic Variables** - Add these:
   - `user_emotion` (String): Current detected emotion
   - `user_emotion_confidence` (String): Confidence percentage
   - `emotion_context` (String): Emotion description
   - `system__time` (String): Timestamp
   - `system__room` (String): Room identifier

5. Copy your **Agent ID** (format: `agent_xxxxxxxxxxxxx`) to `.env`

### 4. Test the Integration

```bash
# Run automated test suite
node test-emotion-integration.js

# Or test manually
curl -X POST http://localhost:3000/agent/message-with-emotion \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello!", "roomName": "test"}'
```

### 5. Use in Browser

1. Navigate to `http://localhost:5173`
2. Sign in and join a call
3. Enable camera (ensure good lighting)
4. Make facial expressions and speak
5. Carrie responds based on your emotions!

---

## 📊 API Endpoints

### Backend Emotion Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emotion/process-frame` | Process video frame, forward to Python |
| GET | `/api/emotion/current` | Get current emotion state |
| GET | `/api/emotion/webhook` | Emotion webhook for ElevenLabs |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/emotion/process-frame \
  -H "Content-Type: application/json" \
  -d '{"frame": "data:image/jpeg;base64,..."}'
```

**Example Response:**
```json
{
  "success": true,
  "emotion": {
    "emotion": "Happy",
    "confidence": 0.92,
    "face_detected": true,
    "timestamp": 1728123456
  }
}
```

### Backend Agent Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/agent/message-with-emotion` | Process message with emotion awareness |
| POST | `/agent/message` | Process message without emotion (fallback) |
| POST | `/agent/transcribe` | Transcribe audio (ElevenLabs STT) |
| POST | `/agent/speak` | Generate speech (ElevenLabs TTS) |

**Example Emotion-Aware Request:**
```bash
curl -X POST http://localhost:3000/agent/message-with-emotion \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling great today!",
    "roomName": "test-room"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "input": "I am feeling great today!",
  "response": "That's wonderful! Your positive energy is contagious! What's making you feel so great?",
  "emotion": {
    "emotion": "Happy",
    "confidence": 0.92,
    "face_detected": true,
    "context": "The user appears happy (confidence: 92%). They seem in a positive mood."
  },
  "conversationId": "conv_123456"
}
```

### Python Emotion Detector Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/process_frame` | Process single frame |
| GET | `/api/emotion` | Get current emotion |
| GET | `/api/webhook/emotion` | Webhook format for LLMs |
| GET | `/api/health` | Health check |
| WebSocket | `ws://localhost:5000` | Real-time emotion updates |

---

## 🎨 Emotion Detection & Responses

### Supported Emotions

| Emotion | Agent Response Style | Voice Characteristics |
|---------|---------------------|----------------------|
| **Happy** | Upbeat, encouraging | Energetic, warm |
| **Sad** | Gentle, supportive | Soft, slow, comforting |
| **Angry** | Calm, validating | Steady, measured |
| **Fear** | Reassuring, grounding | Stable, comforting |
| **Surprise** | Curious, engaged | Interested, attentive |
| **Disgust** | Understanding, gentle | Patient, non-judgmental |
| **Neutral** | Balanced, professional | Clear, moderate pace |

### Detection Process

1. **Frame Capture**: Canvas captures video frame every 2 seconds
2. **Face Detection**: OpenCV Haar Cascade detects face
3. **Emotion Classification**: ViT model (`abhilash88/face-emotion-detection`) classifies emotion
4. **Confidence Score**: Returns 0-1 confidence (0-100%)
5. **Context Generation**: Creates natural language description for LLM

---

## 🧪 Testing

### Automated Tests

```bash
node test-emotion-integration.js
```

Tests include:
- ✅ Emotion detector health check
- ✅ Backend emotion endpoint functionality
- ✅ Emotion webhook proxy
- ✅ Standard message processing
- ✅ Emotion-aware message processing

### Manual Testing

1. **Test Different Emotions**:
   - **Happy**: Smile broadly → Expect upbeat responses
   - **Sad**: Frown → Expect gentle, supportive responses
   - **Angry**: Tense frown → Expect calming responses
   - **Neutral**: Relaxed face → Expect balanced responses

2. **Check Console Logs**:
   - **Frontend**: Look for "Emotion detected:" messages
   - **Backend**: Look for emotion fetch logs
   - **Python**: Look for face detection results

3. **Test API Directly**:
```bash
# Test emotion detection
curl http://localhost:5000/api/health

# Test emotion webhook
curl http://localhost:3000/api/emotion/webhook

# Test emotion-aware message
curl -X POST http://localhost:3000/agent/message-with-emotion \
  -H "Content-Type: application/json" \
  -d '{"text": "I had a rough day", "roomName": "test"}'
```

---

## 🐛 Troubleshooting

### No Emotion Detected

**Symptoms**: `face_detected: false` in responses

**Solutions**:
- Ensure good lighting (face detection requires bright, even lighting)
- Face must be clearly visible and front-facing to camera
- Camera must be enabled in browser
- Check browser console for frame capture errors
- Verify Python service is running: `curl http://localhost:5000/api/health`

### Agent Not Using Emotion Context

**Symptoms**: Responses don't reflect detected emotions

**Solutions**:
- Verify `ELEVENLABS_AGENT_ID` is set correctly in `.env`
- Check agent configuration has dynamic variables enabled
- Review agent system prompt includes emotion instructions
- Test with `/agent/message-with-emotion` (not `/agent/message`)
- Check backend logs for emotion fetch errors

### Video Frames Not Sending

**Symptoms**: No frames reaching backend

**Solutions**:
- Check browser console for network errors
- Verify backend URL is correct in frontend code
- Ensure CORS is configured properly in backend
- Video must be enabled in call (not just camera permission)
- Check that `isVideoEnabled` is true in Call.tsx

### Python Service Not Responding

**Symptoms**: Backend can't connect to emotion detector

**Solutions**:
- Verify Python service is running on port 5000
- Check Python dependencies are installed: `pip install flask flask-socketio transformers opencv-python torch pillow flask-cors`
- Look for errors in Python console
- Test directly: `curl http://localhost:5000/api/health`
- Ensure `EMOTION_DETECTOR_URL` in `.env` points to correct host

---

## ⚙️ Configuration

### Frame Capture Rate

Default: Every 2 seconds. Adjust in `frontend/src/pages/Call.tsx`:

```typescript
// Change 2000 to desired milliseconds
intervalId = window.setInterval(captureAndSendFrame, 2000);
```

**Recommendations**:
- 1000ms (1s) - High responsiveness, more server load
- 2000ms (2s) - Balanced (default)
- 5000ms (5s) - Lower load, less responsive

### Image Quality

Default: 0.8 (80%). Adjust in `frontend/src/pages/Call.tsx`:

```typescript
// Change 0.8 to value between 0.1-1.0
const frameData = canvas.toDataURL("image/jpeg", 0.8);
```

**Recommendations**:
- 0.5 - Lower quality, faster transmission
- 0.8 - Balanced (default)
- 1.0 - Highest quality, larger files

### Emotion Detection Model

Current: `abhilash88/face-emotion-detection` (ViT)

To change model, edit `ai/emotion_detector.py`:

```python
model_name = "abhilash88/face-emotion-detection"  # Change this
self.processor = ViTImageProcessor.from_pretrained(model_name)
self.model = ViTForImageClassification.from_pretrained(model_name)
```

### ElevenLabs Voice Settings

Adjust in backend or ElevenLabs dashboard:
- **Stability**: 0.4-0.6 (lower = more expressive)
- **Similarity Boost**: 0.75 (maintains voice quality)
- **Style Exaggeration**: 0.3-0.5 (adds emotional nuance)

---

## 🔒 Security & Privacy

### Data Handling

| Data Type | Storage | Retention | Transmission |
|-----------|---------|-----------|--------------|
| Video Frames | Memory only | 0 seconds | HTTPS/WSS |
| Emotion Data | Memory only | Until next detection | HTTPS |
| Audio (User) | Not stored | 0 seconds | HTTPS/WSS |
| Audio (Agent) | Not stored | 0 seconds | HTTPS/WSS |
| Transcriptions | Optional | Configurable | HTTPS |

### Privacy Features

- ✅ All emotion processing is local/server-side
- ✅ No video frames stored permanently
- ✅ No emotion data sent to third parties (except ElevenLabs)
- ✅ User can disable camera anytime
- ✅ No personal identification in emotion data
- ✅ GDPR/HIPAA considerations in place

### Security Best Practices

1. Use HTTPS in production
2. Implement rate limiting on API endpoints
3. Validate all user inputs
4. Use environment variables for secrets
5. Keep dependencies updated
6. Implement proper authentication
7. Log security events

---

## 📦 Dependencies

### Frontend
- `livekit-client` - Real-time video/audio
- `react`, `react-router` - UI framework
- `framer-motion` - Animations

### Backend
- `express` - Web framework
- `livekit-server-sdk` - LiveKit server API
- `axios` - HTTP client
- `multer` - File uploads
- `dotenv` - Environment variables
- `cors` - CORS middleware

### Python
- `flask` - Web framework
- `flask-socketio` - WebSocket support
- `transformers` - ViT model
- `opencv-python` - Face detection
- `torch` - Deep learning
- `pillow` - Image processing
- `flask-cors` - CORS support

---

## 🎓 Future Enhancements

- [ ] Real-time WebSocket for instant emotion updates (currently HTTP polling)
- [ ] Emotion history tracking for conversation context
- [ ] Multi-face detection and tracking
- [ ] Emotion trend analysis and visualization
- [ ] Voice tone analysis integration
- [ ] Custom emotion response templates
- [ ] A/B testing for emotion-aware vs standard responses
- [ ] Emotion analytics dashboard
- [ ] Mobile app support
- [ ] Offline mode with cached models

---

## 💡 Performance Tips

### Optimize Frame Capture
- Reduce capture rate to 3-5s for lower bandwidth
- Lower JPEG quality to 0.5-0.6 for faster transmission
- Resize frames before encoding (current: full resolution)

### Optimize Emotion Detection
- Use model quantization for faster inference
- Batch process multiple frames
- Cache face detection results between frames

### Optimize Backend
- Implement Redis caching for emotion data
- Use connection pooling for HTTP requests
- Add request queuing for rate limiting

---

## ✅ Known Limitations

- Emotion detection requires good lighting conditions
- Only detects one face at a time (primary face)
- 2-second delay between emotion updates
- No emotion history tracking (only current state)
- No voice tone analysis yet
- Requires camera permission and video enabled
- Face must be front-facing (profile views not supported)

---

## 📞 Support & Resources

### Documentation
- ElevenLabs: https://elevenlabs.io/docs
- LiveKit: https://docs.livekit.io
- OpenCV: https://docs.opencv.org

### Getting Help
1. Check all three service logs (Frontend, Backend, Python)
2. Run automated test suite: `node test-emotion-integration.js`
3. Verify all environment variables are set
4. Check ElevenLabs agent configuration
5. Test each component independently

### Common Issues
- **Port conflicts**: Ensure 3000, 5000, 5173 are available
- **Python dependencies**: Use `pip install -r requirements.txt`
- **Node dependencies**: Run `npm install` in both frontend/backend
- **CORS errors**: Check backend CORS configuration
- **Camera access**: Grant browser camera permissions

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Emotion Model**: abhilash88/face-emotion-detection (Hugging Face)
- **Voice AI**: ElevenLabs Conversational AI
- **Video/Audio**: LiveKit Cloud Platform
- **Face Detection**: OpenCV Haar Cascade

---

**Built with ❤️ for empathetic AI conversations**

For detailed technical implementation, see individual source files in:
- `backend/src/features/emotion/`
- `backend/src/agent/agent-manager.ts`
- `frontend/src/pages/Call.tsx`
- `ai/emotion_detector.py`
