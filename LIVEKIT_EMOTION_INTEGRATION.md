# LiveKit + Emotion Detection Integration Guide

## Overview

This integration connects LiveKit's real-time video streaming with AI-powered emotion detection. Video frames from LiveKit are captured on the frontend, sent via WebSocket to the Python emotion detection service, and results are displayed in real-time.

## Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│                 │ ──── video frames ────────> │                  │
│  LiveKit        │                             │   Python AI      │
│  Frontend       │ <─── emotion data ────────  │   Emotion API    │
│  (React)        │                             │   (Flask)        │
└─────────────────┘                             └──────────────────┘
        │                                                │
        │ LiveKit Video/Audio                           │ ViT Model
        ▼                                                ▼
   LiveKit Cloud                            Face Detection + Classification
```

## Components

### 1. **Backend: Python Emotion Detector** (`ai/emotion_detector.py`)

**Key Changes:**
- ✅ Removed standalone webcam capture loop
- ✅ Added `process_frame_from_base64()` method
- ✅ Added WebSocket event handler `video_frame`
- ✅ Added REST endpoint `/api/process_frame`

**WebSocket Events:**
- **Receive:** `video_frame` - Accepts base64 encoded frames
  ```json
  {
    "frame": "data:image/jpeg;base64,/9j/4AAQ...",
    "timestamp": 1234567890
  }
  ```

- **Emit:** `emotion_update` - Broadcasts emotion data to all clients
  ```json
  {
    "emotion": "Happy",
    "confidence": 0.95,
    "face_detected": true,
    "timestamp": 1234567890
  }
  ```

- **Emit:** `emotion_processed` - Acknowledges frame processing
  ```json
  {
    "status": "success",
    "emotion": "Happy",
    "confidence": 0.95
  }
  ```

### 2. **Frontend: Emotion Detection Client** (`frontend/src/api/emotionDetection.ts`)

**Features:**
- Connects to emotion detection WebSocket server
- Captures video frames from LiveKit's `LocalVideoTrack`
- Converts frames to base64 JPEG (80% quality)
- Sends frames at configurable rate (default: 2 FPS)
- Receives and processes emotion updates

**Usage:**
```typescript
import { emotionDetectionClient, type EmotionData } from '../api/emotionDetection';

// Connect to emotion detection service
await emotionDetectionClient.connect();

// Start sending frames
const videoTrack = liveKitApi.getLocalVideoTrack();
emotionDetectionClient.startEmotionDetection(
  videoTrack,
  (emotion: EmotionData) => {
    console.log('Emotion:', emotion.emotion, emotion.confidence);
  }
);

// Stop detection
emotionDetectionClient.stopEmotionDetection();
emotionDetectionClient.disconnect();
```

### 3. **Frontend: Call Component** (`frontend/src/pages/Call_with_emotion.tsx`)

**Integration Points:**
1. **Emotion State Management:**
   ```typescript
   const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
   const [emotionConnected, setEmotionConnected] = useState(false);
   ```

2. **Connection Lifecycle:**
   - Connects to emotion service after LiveKit room is established
   - Automatically starts frame capture when video track is available
   - Cleans up on component unmount

3. **UI Features:**
   - Real-time emotion display with emoji
   - Confidence percentage
   - Connection status indicator
   - Graceful handling of disconnection

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install socket.io-client@^4.8.4 livekit-client@^2.13.1 @phosphor-icons/react@^2.3.3
```

**Backend:**
```bash
cd ai
pip install flask flask-socketio flask-cors opencv-python torch transformers pillow
```

### 2. Environment Variables

Create `.env` files:

**Frontend** (`frontend/.env`):
```env
VITE_AI_SERVICE_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:3000
```

**Backend** (`ai/.env`):
```env
FLASK_ENV=production
PORT=5000
```

### 3. Start Services

**Terminal 1 - AI Service:**
```bash
cd ai
python emotion_detector.py
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Docker Deployment

The emotion detector is Docker-ready and included in `docker-compose.yml`:

```yaml
services:
  ai:
    build: ./ai
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
```

**Build and run:**
```bash
docker-compose up -d
```

## Configuration

### Frame Rate Adjustment

In `emotionDetection.ts`, modify the frame rate:

```typescript
private readonly FRAME_RATE = 2; // Frames per second

// Lower rate = less CPU, less accurate
// Higher rate = more CPU, more accurate
// Recommended: 1-3 FPS for real-time emotion
```

### Image Quality

Adjust compression in `captureAndSendFrame()`:

```typescript
const base64Image = this.canvas.toDataURL("image/jpeg", 0.8);
//                                                      ^^^^ 0.0-1.0
// Lower = smaller size, faster transmission
// Higher = better quality, better accuracy
```

## API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emotion` | Get current emotion data |
| POST | `/api/process_frame` | Process single base64 frame |
| GET/POST | `/api/webhook/emotion` | ElevenLabs webhook |
| GET | `/api/health` | Health check |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client→Server | Initial connection |
| `disconnect` | Client→Server | Disconnection |
| `video_frame` | Client→Server | Send frame for processing |
| `emotion_update` | Server→Client | Receive emotion data (broadcast) |
| `emotion_processed` | Server→Client | Frame processing confirmation |
| `emotion_error` | Server→Client | Error notification |

## Testing

### 1. Test WebSocket Connection

```javascript
// Browser console
const socket = io('http://localhost:5000');

socket.on('connect', () => console.log('Connected!'));
socket.on('emotion_update', (data) => console.log('Emotion:', data));
```

### 2. Test Frame Processing

```bash
# Test with curl (replace with actual base64)
curl -X POST http://localhost:5000/api/process_frame \
  -H "Content-Type: application/json" \
  -d '{"frame": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

### 3. Monitor Logs

**Python logs:**
```
Client connected: AbC123XyZ
Emotion detected: Happy (95%)
Client disconnected: AbC123XyZ
```

**Browser console:**
```
Connected to emotion detection service
Emotion detected: Happy (95.3%)
```

## Performance Optimization

### 1. **Reduce Frame Rate**
- Send fewer frames per second (1-2 FPS sufficient)
- Balance between responsiveness and performance

### 2. **Image Compression**
- Use JPEG format with 70-80% quality
- Reduces bandwidth without significant accuracy loss

### 3. **Canvas Reuse**
- Canvas is created once and reused
- Avoids memory allocation overhead

### 4. **GPU Acceleration** (Python)
```python
# In EmotionDetector.__init__()
self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
self.model = self.model.to(self.device)
```

## Troubleshooting

### Issue: "Cannot connect to emotion detection service"

**Solutions:**
1. Check if AI service is running: `curl http://localhost:5000/api/health`
2. Verify CORS settings in `emotion_detector.py`
3. Check firewall/network settings
4. Verify `VITE_AI_SERVICE_URL` in frontend `.env`

### Issue: "No face detected"

**Solutions:**
1. Ensure adequate lighting
2. Face camera directly
3. Check video track is enabled
4. Verify frame quality (not too compressed)

### Issue: "High CPU usage"

**Solutions:**
1. Reduce frame rate to 1-2 FPS
2. Lower image quality to 0.7
3. Use GPU acceleration (if available)
4. Increase frame processing interval

### Issue: "Emotion detection lag"

**Solutions:**
1. Check network latency
2. Reduce image resolution
3. Use WebSocket (faster than REST)
4. Ensure Python service has sufficient resources

## Integration Checklist

- [ ] Backend emotion detector updated with base64 processing
- [ ] Frontend `socket.io-client` and `livekit-client` installed
- [ ] `emotionDetection.ts` API client created
- [ ] `Call.tsx` updated with emotion detection hooks
- [ ] Environment variables configured
- [ ] Services running and connectable
- [ ] WebSocket connection established
- [ ] Frames being sent and processed
- [ ] Emotion updates displaying in UI
- [ ] Docker configuration updated (if using Docker)

## Next Steps

1. **Add LiveKit API Method:**
   - Create `getLocalVideoTrack()` in `livekit.ts`
   - Export local video track for frame capture

2. **Update Call.tsx:**
   - Replace current simple version with `Call_with_emotion.tsx`
   - Test emotion detection in live call

3. **Enhance UI:**
   - Add emotion history chart
   - Add emotion-based UI themes
   - Show confidence trends

4. **Optimize Performance:**
   - Profile frame capture rate
   - Adjust image quality
   - Monitor WebSocket bandwidth

## Resources

- [LiveKit Client SDK](https://docs.livekit.io/client-sdk-js/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/)
- [OpenCV Python](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/)

## Support

For issues or questions:
1. Check logs in both frontend (browser console) and backend (terminal)
2. Verify all dependencies are installed
3. Ensure all services are running
4. Check firewall/network configuration
5. Review this documentation for configuration options

---

**Status:** ✅ Ready for Integration
**Last Updated:** October 4, 2025
