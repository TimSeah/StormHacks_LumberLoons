# 🌟 Carrie - Your AI Therapy Companion

<div align="center">

![Carrie Banner](https://img.shields.io/badge/StormHacks_2025-SFU_Hackathon-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**Experience round-the-clock support and guidance with a 24/7 AI therapist, always at your fingertips to help you navigate life's challenges.**

[Start Chatting](#-quick-start) • [Features](#-key-features) • [Demo](#-live-demo) • [Documentation](#-documentation)

</div>

---

## 📖 Table of Contents

- [About Carrie](#-about-carrie)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Team](#-team)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About Carrie

**Carrie** is an emotion-aware AI therapy companion built for **StormHacks 2025** at Simon Fraser University. Carrie combines cutting-edge AI technologies to create an empathetic, accessible mental health support system that understands not just what you say, but how you feel.

### The Problem We're Solving

- **Mental health support is expensive and inaccessible** - Traditional therapy costs $100-300/hour
- **Long wait times** - Average 2-8 weeks to get an appointment
- **Stigma and judgment** - Many people avoid seeking help due to fear of being judged
- **Limited availability** - Therapists aren't available 24/7 during crisis moments

### Our Solution

Carrie provides:
- ✅ **24/7 Availability** - Always there when you need support
- ✅ **Emotion Detection** - Real-time facial emotion recognition using computer vision
- ✅ **Empathetic Responses** - AI adapts its tone and advice based on your emotional state
- ✅ **Complete Privacy** - Anonymous, judgment-free conversations
- ✅ **Free Access** - No cost barriers to mental health support
- ✅ **Video Calling** - Face-to-face interaction with LiveKit integration
- ✅ **Conversation History** - Track your journey and progress over time

### 🏆 Built For StormHacks 2025

This project showcases advanced integration of:
- Real-time video processing
- AI/ML emotion detection
- Voice AI conversation systems
- Full-stack web development
- Cloud infrastructure and deployment

---

## ✨ Key Features

### 1. 🎭 Real-Time Emotion Detection
- **Computer Vision**: Captures webcam frames every 2 seconds
- **Face Detection**: OpenCV Haar Cascade identifies facial features
- **Emotion Classification**: ViT (Vision Transformer) model detects 7 emotions:
  - 😊 Happy
  - 😢 Sad
  - 😠 Angry
  - 😰 Fear
  - 😲 Surprise
  - 🤢 Disgust
  - 😐 Neutral
- **Confidence Scoring**: Provides 0-100% confidence for accuracy

### 2. 💬 Emotion-Aware Conversations
- **Dynamic Response Adaptation**: Carrie adjusts tone based on detected emotions
  - Happy → Upbeat and encouraging
  - Sad → Gentle and supportive
  - Angry → Calm and validating
  - Fear → Reassuring and grounding
- **Context Injection**: Emotion data seamlessly integrated into AI responses
- **Natural Language Processing**: ElevenLabs Conversational AI powers responses

### 3. 📹 Video Calling with LiveKit
- **High-Quality Video/Audio**: WebRTC-based real-time communication
- **Low Latency**: Sub-second response times
- **Cross-Platform**: Works on desktop and mobile browsers
- **Reconnection Logic**: Automatic recovery from connection drops

### 4. 🗣️ Voice Interaction
- **Text-to-Speech**: ElevenLabs generates natural, empathetic voice
- **Speech-to-Text**: Voice transcription for hands-free interaction
- **Voice Modulation**: Emotional tone matching in speech synthesis

### 5. 📊 Conversation History
- **MongoDB Storage**: Persistent conversation tracking
- **Session Management**: Organize chats by date and topic
- **Progress Tracking**: Review past conversations and growth
- **Privacy Controls**: User-owned data with deletion options

### 6. 🔐 Secure Authentication
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption for user credentials
- **Protected Routes**: Role-based access control

---

## 🛠️ Technology Stack

### Frontend
```
React 18.3.1          - UI framework
TypeScript 5.6        - Type safety
Vite 6.0.6           - Build tool & dev server
LiveKit Client 2.15.8 - Video/audio streaming
Framer Motion        - Smooth animations
TailwindCSS          - Styling
React Router 7.1.3   - Navigation
Tanstack Query       - Data fetching & caching
```

### Backend
```
Node.js 20.x         - Runtime environment
Express 4.21.2       - Web framework
TypeScript 5.6       - Type safety
LiveKit Server SDK   - Video infrastructure
MongoDB Atlas        - Cloud database
Mongoose             - ODM for MongoDB
JWT                  - Authentication
Axios 1.12.2         - HTTP client
```

### AI & ML Services
```
Python 3.10          - AI service runtime
Flask 3.1.0          - REST API framework
PyTorch              - Deep learning framework
Transformers         - Hugging Face models
OpenCV               - Computer vision
ViT Model            - Emotion classification
ElevenLabs API       - Conversational AI & TTS
```

### DevOps & Infrastructure
```
Docker               - Containerization
Docker Compose       - Multi-container orchestration
AWS ECS Fargate      - Container hosting
AWS ECR              - Container registry
AWS Secrets Manager  - Credentials management
AWS CloudWatch       - Logging & monitoring
nginx                - Frontend web server
ngrok                - Webhook tunneling
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER (Browser/Mobile)                        │
│              https://carrie-app.com (Frontend)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + LiveKit)                    │
│  - Video call interface with emotion capture                    │
│  - Captures webcam frame every 2s → Base64 encoding            │
│  - Real-time video/audio with LiveKit                           │
│  - Conversation history UI                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API + WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                    │
│  Routes:                                                         │
│  - /auth          → JWT authentication                           │
│  - /livekit       → Video room tokens                            │
│  - /agent         → ElevenLabs integration                       │
│  - /emotion       → Emotion detection proxy                      │
│  - /chat-history  → Conversation persistence                     │
│                                                                  │
│  Services:                                                       │
│  - AgentManager   → ElevenLabs API client                        │
│  - MongoDB        → User & conversation storage                  │
└──────────────┬───────────────────────┬──────────────────────────┘
               │                       │
               ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────────────┐
│   AI SERVICE (Python)    │  │    EXTERNAL SERVICES             │
│                          │  │                                  │
│  Flask REST API:         │  │  - LiveKit Cloud                 │
│  /api/process_frame      │  │    Video infrastructure          │
│  /api/emotion            │  │                                  │
│  /api/webhook/emotion    │  │  - ElevenLabs API                │
│  /api/health             │  │    Conversational AI + TTS       │
│                          │  │                                  │
│  Components:             │  │  - MongoDB Atlas                 │
│  - OpenCV face detection │  │    Cloud database                │
│  - ViT emotion model     │  │                                  │
│  - Real-time processing  │  │  - AWS Infrastructure            │
└──────────────────────────┘  └──────────────────────────────────┘
```

### Data Flow: Emotion-Aware Conversation

```
Step 1: Frame Capture (Frontend)
   User's webcam → Canvas API → Base64 JPEG (60% quality, 640px max)
   │
   ├─ Triggered: Every 2 seconds
   └─ Payload: ~50-150KB per frame

Step 2: Frame Processing (POST /api/emotion/process-frame)
   Frontend → Backend → Python AI Service
   │
   ├─ OpenCV Haar Cascade detects face
   ├─ ViT model classifies emotion (7 classes)
   └─ Returns: {emotion: "Happy", confidence: 0.92, face_detected: true}

Step 3: Emotion Storage
   Python service stores emotion in global state
   │
   └─ Available via webhook: GET /api/webhook/emotion

Step 4: User Speaks
   User: "I got a promotion today!"
   │
   └─ Audio → LiveKit → ElevenLabs STT → Text

Step 5: Context Enrichment (Backend)
   Backend fetches current emotion via webhook
   │
   ├─ Emotion: "Happy" (92% confidence)
   ├─ Context: "User appears happy and in positive mood"
   └─ Dynamic variables prepared for ElevenLabs

Step 6: AI Response Generation
   ElevenLabs Conversational AI receives:
   │
   ├─ User message: "I got a promotion today!"
   ├─ user_emotion: "Happy"
   ├─ user_emotion_confidence: "92%"
   └─ emotion_context: "User appears happy..."
   │
   └─ Generates emotion-aware response

Step 7: Voice Synthesis & Delivery
   ElevenLabs TTS → Audio → LiveKit → User hears empathetic response
   │
   Example: "That's wonderful! Your positive energy is contagious! 
            Tell me more about this exciting news!"
```

### Microservices Communication

```
Frontend (React)
    ↓ HTTP/HTTPS
Backend (Node.js) ←→ MongoDB Atlas (Cloud DB)
    ↓ WebSocket      
LiveKit Cloud
    ↓ HTTP
Python AI Service
    ↓ HTTP
ElevenLabs API
```

---

## 📁 Project Structure

```
StormHacks_LumberLoons/
│
├── frontend/                      # React + TypeScript Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Homepage with hero section
│   │   │   ├── LoginPage.tsx     # User authentication
│   │   │   ├── SignupPage.tsx    # User registration
│   │   │   ├── Call.tsx          # 🎥 Video call + emotion capture
│   │   │   ├── ChatLog.tsx       # Individual conversation view
│   │   │   └── MainStack/
│   │   │       └── pages/
│   │   │           ├── Home.tsx      # Dashboard
│   │   │           ├── History.tsx   # Conversation list
│   │   │           └── Account.tsx   # User settings
│   │   │
│   │   ├── components/
│   │   │   ├── TopNavigation.tsx        # Nav bar
│   │   │   ├── ProtectedRoute.tsx       # Auth guard
│   │   │   ├── ActivityIndicator.tsx    # Loading spinner
│   │   │   └── ui/                      # Reusable UI components
│   │   │       ├── blur-fade.tsx        # Animation effects
│   │   │       ├── ripple.tsx           # Ripple effect
│   │   │       └── light-rays.tsx       # Background effects
│   │   │
│   │   ├── api/                   # API client functions
│   │   │   ├── client.ts         # Axios base config
│   │   │   ├── auth.ts           # Authentication endpoints
│   │   │   ├── livekit.ts        # Video call functions
│   │   │   └── history.ts        # Conversation history
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Global auth state
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── auth.ts           # useAuth, useLogin, useSignup
│   │   │   └── history.ts        # useHistoryQuery
│   │   │
│   │   ├── types/                # TypeScript definitions
│   │   │   ├── auth.ts
│   │   │   ├── chatLog.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── App.tsx               # Root component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   │
│   ├── public/                   # Static assets
│   ├── Dockerfile                # Frontend container
│   ├── nginx.conf                # Production web server config
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── features/
│   │   │   ├── emotion/
│   │   │   │   └── emotion.routes.ts    # 🎭 Emotion detection proxy
│   │   │   │       ├── POST /process-frame
│   │   │   │       ├── GET /current
│   │   │   │       └── GET /webhook
│   │   │   │
│   │   │   ├── agent/
│   │   │   │   └── agent.routes.ts      # ElevenLabs integration
│   │   │   │       ├── POST /message-with-emotion
│   │   │   │       ├── POST /message
│   │   │   │       ├── POST /transcribe
│   │   │   │       └── POST /speak
│   │   │   │
│   │   │   ├── livekit/
│   │   │   │   └── livekit.routes.ts    # Video room management
│   │   │   │       ├── POST /token
│   │   │   │       └── GET /rooms
│   │   │   │
│   │   │   ├── chat-history-endpoints/
│   │   │   │   └── chat_history.routes.ts
│   │   │   │       ├── POST /start-session
│   │   │   │       ├── GET /all
│   │   │   │       ├── GET /:id
│   │   │   │       └── DELETE /:id
│   │   │   │
│   │   │   └── aquireElevenlabKey/
│   │   │       └── aquireKey.routes.ts  # API key management
│   │   │
│   │   ├── agent/
│   │   │   ├── agent-manager.ts         # 🤖 ElevenLabs API client
│   │   │   │   ├── sendMessage()
│   │   │   │   ├── processUserMessageWithEmotion()
│   │   │   │   ├── fetchEmotionData()
│   │   │   │   ├── transcribeAudio()
│   │   │   │   └── synthesizeSpeech()
│   │   │   │
│   │   │   └── services/
│   │   │       ├── elevenlabs.service.ts
│   │   │       └── audio.utils.ts
│   │   │
│   │   ├── auth/                 # Authentication system
│   │   │   ├── auth.controller.ts    # Login/signup logic
│   │   │   ├── auth.jwt.ts           # JWT generation/verification
│   │   │   ├── auth.routes.ts        # Auth endpoints
│   │   │   └── auth-header.ts        # Token middleware
│   │   │
│   │   ├── models/               # MongoDB schemas
│   │   │   ├── User.ts           # User model
│   │   │   └── Message.ts        # Chat message model
│   │   │
│   │   ├── config/
│   │   │   └── mongodb.ts        # Database connection
│   │   │
│   │   └── index.ts              # 🚀 Server entry point
│   │
│   ├── public/                   # Demo HTML files
│   ├── Dockerfile                # Backend container
│   ├── package.json
│   └── tsconfig.json
│
├── ai/                           # Python AI Service
│   ├── emotion_detector.py       # 🧠 Main emotion detection service
│   │   ├── EmotionDetector class
│   │   ├── Flask REST API
│   │   ├── SocketIO WebSocket
│   │   └── Endpoints:
│   │       ├── POST /api/process_frame
│   │       ├── GET /api/emotion
│   │       ├── GET /api/webhook/emotion
│   │       └── GET /api/health
│   │
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # AI service container
│   └── __pycache__/              # Python bytecode cache
│
├── docker-compose.yml            # 🐳 Multi-container orchestration
│
├── aws-task-definition.json      # ☁️ ECS Fargate configuration
├── deploy-to-aws.ps1             # PowerShell deployment script
├── setup-aws-infrastructure.ps1  # AWS infrastructure automation
│
├── .env.example                  # Environment variables template
├── .env.aws.example              # AWS-specific env vars
│
├── AWS_DEPLOYMENT_GUIDE.md       # 📚 Step-by-step AWS deployment
├── AWS_DEPLOYMENT_CHECKLIST.md   # Quick deployment checklist
├── NGROK_SETUP.md                # Webhook tunneling guide
├── README_DOCKER.md              # Docker setup instructions
│
├── .gitignore
├── package.json                  # Root package config
└── README.md                     # 📖 This file
```

### Key Files Explained

#### Frontend
- **`Call.tsx`**: Core video calling interface with emotion capture logic
- **`emotion capture`**: Captures frames every 2s, converts to base64, sends to backend
- **`livekit.ts`**: WebRTC connection management with reconnection logic
- **`history.ts`**: Conversation history API with React Query caching

#### Backend
- **`emotion.routes.ts`**: Proxy layer between frontend and Python AI service
- **`agent-manager.ts`**: ElevenLabs Conversational AI orchestration
- **`processUserMessageWithEmotion()`**: Enriches messages with emotion context
- **`chat_history.routes.ts`**: MongoDB CRUD for conversation persistence

#### AI Service
- **`emotion_detector.py`**: 
  - OpenCV Haar Cascade for face detection
  - Hugging Face ViT model for emotion classification
  - Flask REST API + SocketIO for real-time updates
  - Webhook endpoint formatted for ElevenLabs consumption

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required Software
Node.js 20.x or higher
Python 3.10 or higher
Docker & Docker Compose (optional)
Git
MongoDB Atlas account (free tier)
LiveKit Cloud account (free tier)
ElevenLabs API account

# Verify installations
node --version    # v20.x.x
python --version  # Python 3.10.x
docker --version  # Docker version 24.x.x
```

### 1. Clone Repository

```bash
git clone https://github.com/TimSeah/StormHacks_LumberLoons.git
cd StormHacks_LumberLoons
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# AI Service
cd ../ai
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create `.env` files in each service directory:

**`backend/.env`**
```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carrie?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxx
LIVEKIT_API_SECRET=your_livekit_api_secret

# ElevenLabs API
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# AI Service
EMOTION_DETECTOR_URL=http://localhost:5000

# Frontend URL
CLIENT_ORIGIN=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3000
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
```

**`ai/.env`** (optional)
```env
FLASK_ENV=development
PORT=5000
```

### 4. Start Services

#### Option A: Manual Start (Development)

```bash
# Terminal 1: AI Service
cd ai
python emotion_detector.py
# ✅ Running on http://localhost:5000

# Terminal 2: Backend
cd backend
npm run dev
# ✅ Running on http://localhost:3000

# Terminal 3: Frontend
cd frontend
npm run dev
# ✅ Running on http://localhost:5173
```

#### Option B: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 5. Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

1. **Sign Up** - Create a new account
2. **Login** - Authenticate with credentials
3. **Start Call** - Click "Start Session" to begin video call
4. **Enable Camera** - Grant camera permissions when prompted
5. **Talk to Carrie** - Carrie will respond based on your emotions!

---

## ⚙️ Configuration

### Emotion Detection Settings

#### Frame Capture Rate
Located in `frontend/src/pages/Call.tsx`:

```typescript
// Capture frame every X milliseconds
intervalId = window.setInterval(captureAndSendFrame, 2000);

// Options:
// 1000ms (1s)  - High responsiveness, more bandwidth
// 2000ms (2s)  - Balanced (default)
// 5000ms (5s)  - Lower bandwidth, less responsive
```

#### Image Quality
```typescript
// Adjust JPEG compression (0.1 - 1.0)
const frameData = canvas.toDataURL("image/jpeg", 0.6);

// 0.4 - Lower quality, faster upload (~30KB)
// 0.6 - Balanced (default) (~60KB)
// 0.8 - Higher quality (~100KB)
```

#### Maximum Frame Size
```typescript
// Resize large frames to max width
const maxWidth = 640; // pixels

// Options:
// 320px - Very fast, lower accuracy
// 640px - Balanced (default)
// 1280px - High quality, slower
```

### ElevenLabs Agent Configuration

1. Go to [ElevenLabs Platform](https://elevenlabs.io)
2. Navigate to **Conversational AI** → **Agents**
3. Create/Edit agent named "Carrie"

#### System Prompt Template

```
You are Carrie, a compassionate and empathetic AI mental health companion 
and therapist created for StormHacks 2025 at SFU.

EMOTION AWARENESS:
You receive real-time emotion detection through dynamic variables:
- user_emotion: Current emotion (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral)
- user_emotion_confidence: Detection confidence (0-100%)
- emotion_context: Natural language description of emotional state

RESPONSE GUIDELINES BY EMOTION:

😊 Happy (confidence > 60%)
→ Match positive energy, upbeat tone, encourage sharing
Example: "I can sense your positive energy! What's bringing you joy today?"

😢 Sad (confidence > 60%)
→ Gentle, supportive tone, validate feelings, offer comfort
Example: "I'm here with you. It's okay to feel this way. Want to talk about it?"

😠 Angry (confidence > 60%)
→ Stay calm, validate frustration, help process feelings
Example: "I hear you're really frustrated. That's completely understandable."

😰 Fear (confidence > 60%)
→ Provide reassurance, ground them, help feel safe
Example: "You're safe here. Let's take this one step at a time together."

😐 Neutral or Low Confidence (< 40%)
→ Balanced professional tone, rely more on verbal content

THERAPEUTIC TECHNIQUES:
- Active listening: "It sounds like you're saying..."
- Open questions: "How did that make you feel?"
- Validation: "That's completely understandable given..."
- Reframing: "Another way to look at this might be..."
- Mindfulness: Breathing exercises when anxiety detected

BOUNDARIES:
✅ DO: Provide emotional support, active listening, coping strategies
❌ DON'T: Diagnose conditions, prescribe medication, replace licensed therapy

CRISIS RESPONSE:
If user mentions self-harm/suicide:
"I'm really concerned about what you just shared. Please reach out to:
- 988 Suicide & Crisis Lifeline (US/Canada)
- Crisis Text Line: Text HOME to 741741
- Call emergency services: 911
I care about you, and professional help is available right now."

Remember: You're Carrie, created at StormHacks 2025. Be warm, empathetic, 
and human-like while maintaining professional boundaries.
```

#### Dynamic Variables Setup

Add these in agent configuration:
- `user_emotion` (String)
- `user_emotion_confidence` (String)
- `emotion_context` (String)
- `system__time` (String)
- `system__room` (String)

### MongoDB Configuration

#### Atlas Setup

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user with read/write permissions
3. Whitelist IP: `0.0.0.0/0` (all IPs for development)
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/carrie
   ```

#### Collections Created Automatically

- `users` - User accounts (email, password hash, profile)
- `messages` - Chat messages (user, text, emotion, timestamp)
- `sessions` - Conversation sessions (user, start time, duration)

### LiveKit Configuration

1. Sign up at [LiveKit Cloud](https://livekit.io)
2. Create project and get credentials:
   - WebSocket URL: `wss://your-project.livekit.cloud`
   - API Key: `APIxxxxxxxxxx`
   - API Secret: `your_secret_here`

3. Configure in `.env` files (backend and frontend)

---

## 📡 API Documentation

### Backend Endpoints

#### Authentication Routes (`/auth`)

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 201 Created
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Emotion Detection Routes (`/emotion`)

```http
POST /emotion/process-frame
Authorization: Bearer <token>
Content-Type: application/json

{
  "frame": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

Response: 200 OK
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

```http
GET /emotion/current
Authorization: Bearer <token>

Response: 200 OK
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

```http
GET /emotion/webhook
# Used by ElevenLabs

Response: 200 OK
{
  "emotion": "Happy",
  "confidence": 0.92,
  "face_detected": true,
  "context": "The user appears happy (confidence: 92%). They seem in a positive mood.",
  "emotional_state": "happy",
  "timestamp": 1728123456
}
```

#### Agent Routes (`/agent`)

```http
POST /agent/message-with-emotion
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "I'm feeling really stressed about work",
  "roomName": "room_123"
}

Response: 200 OK
{
  "success": true,
  "input": "I'm feeling really stressed about work",
  "response": "I hear that work is really weighing on you. Let's talk through it...",
  "emotion": {
    "emotion": "Sad",
    "confidence": 0.78,
    "context": "User appears sad..."
  },
  "conversationId": "conv_abc123"
}
```

#### LiveKit Routes (`/livekit`)

```http
POST /livekit/token
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomName": "therapy-session-123",
  "identity": "user@example.com"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "url": "wss://your-project.livekit.cloud"
}
```

#### Chat History Routes (`/chat-history`)

```http
POST /chat-history/start-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Work Stress Discussion"
}

Response: 201 Created
{
  "success": true,
  "sessionId": "session_abc123",
  "topic": "Work Stress Discussion"
}
```

```http
GET /chat-history/all
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "chatLogs": [
    {
      "_id": "log_123",
      "userId": "user_abc",
      "topic": "Work Stress Discussion",
      "createdAt": "2025-10-05T10:30:00Z",
      "messages": [...]
    }
  ]
}
```

### Python AI Service Endpoints

```http
POST /api/process_frame
Content-Type: application/json

{
  "frame": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

Response: 200 OK
{
  "emotion": "Happy",
  "confidence": 0.92,
  "face_detected": true,
  "timestamp": 1728123456
}
```

```http
GET /api/health

Response: 200 OK
{
  "status": "healthy",
  "service": "emotion-detection-api",
  "timestamp": 1728123456
}
```

---

## ☁️ Deployment

### Docker Deployment

#### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend
docker-compose build ai
```

#### Run Containers

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Stop all
docker-compose down
```

### AWS Deployment (ECS Fargate)

#### Prerequisites

```bash
# Install AWS CLI
# Windows: https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Configure AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1)

# Verify
aws sts get-caller-identity
```

#### Quick Deploy Script

```powershell
# PowerShell (Windows)
.\setup-aws-infrastructure.ps1

# This will:
# 1. Create ECR repositories
# 2. Store secrets in AWS Secrets Manager
# 3. Create VPC, subnets, security groups
# 4. Set up load balancer
# 5. Create ECS cluster and services
```

#### Manual Deployment Steps

See detailed guide: [`AWS_DEPLOYMENT_GUIDE.md`](./AWS_DEPLOYMENT_GUIDE.md)

**Summary:**
1. Create ECR repositories
2. Build and push Docker images
3. Create ECS cluster
4. Register task definition
5. Create ECS service with load balancer
6. Configure domain (optional)

### ngrok Webhook Setup

For local development with ElevenLabs webhooks:

```bash
# Start AI service
cd ai
python emotion_detector.py

# In another terminal, start ngrok
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
# Update EMOTION_DETECTOR_URL in backend .env
```

See detailed guide: [`NGROK_SETUP.md`](./NGROK_SETUP.md)

---

## 🧪 Testing

### Automated Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
node test-emotion-integration.js
```

### Manual Testing Checklist

#### 1. Emotion Detection
- [ ] Camera permission granted
- [ ] Face detected in good lighting
- [ ] Emotions change when making expressions
- [ ] Confidence scores are reasonable (>60%)
- [ ] No face detected when covered

#### 2. Video Calling
- [ ] Can join room successfully
- [ ] Video stream is smooth
- [ ] Audio is clear
- [ ] Can toggle camera on/off
- [ ] Reconnection works after disconnect

#### 3. AI Responses
- [ ] Carrie responds to messages
- [ ] Responses reflect detected emotion
- [ ] Voice synthesis works
- [ ] Conversation flows naturally
- [ ] No inappropriate responses

#### 4. Conversation History
- [ ] Sessions are saved
- [ ] Can view past conversations
- [ ] Can delete conversations
- [ ] Timestamps are correct

### Testing Different Emotions

| Emotion | How to Test | Expected Response |
|---------|-------------|-------------------|
| 😊 Happy | Smile broadly | Upbeat, encouraging tone |
| 😢 Sad | Frown, look down | Gentle, supportive words |
| 😠 Angry | Tense frown | Calm, validating response |
| 😰 Fear | Wide eyes, tense | Reassuring, grounding |
| 😐 Neutral | Relaxed face | Balanced, professional |

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: No Emotion Detected
```
Symptoms: face_detected: false, emotion: "No face detected"

Solutions:
✅ Ensure good lighting (face clearly visible)
✅ Face must be front-facing to camera
✅ Check browser camera permissions
✅ Verify Python service is running: curl http://localhost:5000/api/health
✅ Look for errors in Python console
```

#### Issue: Agent Not Responding
```
Symptoms: No response from Carrie, timeout errors

Solutions:
✅ Verify ELEVENLABS_API_KEY in .env
✅ Check ELEVENLABS_AGENT_ID is correct
✅ Test ElevenLabs API directly: curl https://api.elevenlabs.io/v1/health
✅ Review backend logs for API errors
✅ Ensure internet connection is stable
```

#### Issue: Video Not Starting
```
Symptoms: Camera not initializing, black screen

Solutions:
✅ Grant camera permissions in browser
✅ Check LIVEKIT_URL is correct
✅ Verify LiveKit token is generated: check network tab
✅ Try different browser (Chrome recommended)
✅ Restart browser and clear cache
```

#### Issue: Docker Build Fails
```
Symptoms: docker-compose build fails with errors

Solutions:
✅ Check Docker daemon is running
✅ Ensure .env files exist in each service
✅ Increase Docker memory: Docker Desktop → Settings → Resources
✅ Clear Docker cache: docker system prune -a
✅ Check Dockerfile syntax
```

#### Issue: MongoDB Connection Error
```
Symptoms: "MongoError: Authentication failed"

Solutions:
✅ Verify MONGODB_URI in .env is correct
✅ Check database user has read/write permissions
✅ Whitelist IP address in MongoDB Atlas
✅ Test connection: mongosh "mongodb+srv://..."
✅ Ensure network security group allows outbound MongoDB port
```

### Debugging Tools

```bash
# View backend logs
cd backend
npm run dev
# Watch for errors in console

# View Python logs
cd ai
python emotion_detector.py
# Check for OpenCV/model loading errors

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:5000/api/health

# Check Docker logs
docker-compose logs -f backend
docker-compose logs -f ai
docker-compose logs -f frontend

# MongoDB connection test
mongosh "your_connection_string"

# LiveKit test
curl https://your-project.livekit.cloud
```

---

## 🗺️ Roadmap

### Phase 1: StormHacks 2025 Demo ✅
- [x] Real-time emotion detection
- [x] Video calling with LiveKit
- [x] ElevenLabs voice integration
- [x] Conversation history
- [x] User authentication
- [x] Docker containerization

### Phase 2: Post-Hackathon Enhancements
- [ ] Real-time WebSocket emotion updates (vs HTTP polling)
- [ ] Emotion history timeline & visualization
- [ ] Voice tone analysis integration
- [ ] Multi-language support (26+ languages)
- [ ] Mobile app (React Native)
- [ ] Therapist matching system

### Phase 3: Production Ready
- [ ] HIPAA compliance audit
- [ ] End-to-end encryption
- [ ] Crisis intervention system
- [ ] Professional therapist marketplace
- [ ] Insurance integration
- [ ] Telemetry and analytics dashboard

### Phase 4: Advanced Features
- [ ] Group therapy sessions
- [ ] AI-powered journaling
- [ ] Mood tracking over time
- [ ] Personalized coping strategies
- [ ] Integration with wearables
- [ ] CBT/DBT structured programs

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue with detailed description
2. **Suggest Features**: Propose new ideas in discussions
3. **Submit PRs**: Fix bugs or implement features
4. **Improve Docs**: Help us make docs clearer
5. **Spread the Word**: Star the repo, share with friends!

### Development Guidelines

```bash
# Fork the repository
git clone https://github.com/YOUR_USERNAME/StormHacks_LumberLoons.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes
# - Follow existing code style
# - Add tests for new features
# - Update documentation

# Commit with clear message
git commit -m "Add amazing feature: <description>"

# Push to your fork
git push origin feature/amazing-feature

# Open Pull Request on GitHub
```

### Code Style

- **TypeScript**: Use ESLint + Prettier
- **Python**: Follow PEP 8
- **Commits**: Use conventional commits (feat:, fix:, docs:)
- **Tests**: Add tests for new features

---

## 👥 Team

**Built with ❤️ for StormHacks 2025 at Simon Fraser University**

- **Project Lead**: [Your Name]
- **Frontend Developer**: [Team Member]
- **Backend Developer**: [Team Member]
- **AI/ML Engineer**: [Team Member]
- **UI/UX Designer**: [Team Member]

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Technologies & Services
- **[ElevenLabs](https://elevenlabs.io)** - Conversational AI & Text-to-Speech
- **[LiveKit](https://livekit.io)** - Real-time video infrastructure
- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** - Cloud database
- **[Hugging Face](https://huggingface.co)** - ViT emotion detection model
- **[OpenCV](https://opencv.org)** - Computer vision library

### Inspiration
- **StormHacks 2025** - Thank you for the opportunity to build impactful tech
- **Mental Health Advocates** - For highlighting the need for accessible support
- **Open Source Community** - Standing on the shoulders of giants

### Special Thanks
- Simon Fraser University for hosting StormHacks 2025
- All contributors and testers who helped improve Carrie
- The mental health community for feedback and guidance

---

## 📞 Support & Contact

### Getting Help

- **Documentation**: Read this README and linked guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/TimSeah/StormHacks_LumberLoons/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/TimSeah/StormHacks_LumberLoons/discussions)

### Mental Health Resources

**🚨 If you're in crisis, please reach out:**
- **988 Suicide & Crisis Lifeline** (US/Canada): Dial 988
- **Crisis Text Line**: Text HOME to 741741
- **International**: [findahelpline.com](https://findahelpline.com)

**Carrie is NOT a replacement for professional mental health care. If you're struggling, please contact a licensed therapist or counselor.**

---

## 📊 Project Stats

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-10k+-blue)
![Containers](https://img.shields.io/badge/Containers-3-green)
![Languages](https://img.shields.io/badge/Languages-4-orange)
![APIs](https://img.shields.io/badge/APIs-3-purple)

**Tech Stack Breakdown:**
- Frontend: TypeScript (65%), CSS (20%), HTML (15%)
- Backend: TypeScript (95%), JSON (5%)
- AI Service: Python (100%)

---

<div align="center">

**⭐ If you found Carrie helpful, please star this repo! ⭐**

**Built for StormHacks 2025 @ SFU**

[🏠 Homepage](#-carrie---your-ai-therapy-companion) • [📚 Docs](#-documentation) • [🚀 Deploy](#-deployment) • [🐛 Issues](https://github.com/TimSeah/StormHacks_LumberLoons/issues)

---

*"Technology with empathy, AI with a heart"*

**Carrie - Because everyone deserves support, anytime, anywhere.**

</div>
