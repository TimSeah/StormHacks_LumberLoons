// import express from "express";
// import cors from "cors";
// import livekitRoutes from "./features/livekit/livekit.routes";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/livekit", livekitRoutes);

// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

import express from "express";
import cors from "cors";
import livekitRoutes from "./features/livekit/livekit.routes";
import agentRoutes, { initializeAgentManager } from "./features/agent/agent.routes";
import { AgentManager } from "./agent/agent-manager";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve static files from /public
app.use(express.static(path.join(__dirname, "../public")));

// Initialize Agent Manager
const agentManager = new AgentManager({
  livekitUrl: process.env.LIVEKIT_URL || '',
  apiKey: process.env.LIVEKIT_API_KEY || '',
  apiSecret: process.env.LIVEKIT_API_SECRET || '',
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || '', // Used for both TTS and STT!
  voiceId: process.env.ELEVENLABS_VOICE_ID,
  agentId: process.env.ELEVENLABS_AGENT_ID, // For ElevenLabs Conversational AI
});

// Initialize agent routes with manager
initializeAgentManager(agentManager);

// mount your API routes
app.use("/livekit", livekitRoutes);
app.use("/agent", agentRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`LiveKit URL: ${process.env.LIVEKIT_URL}`);
  console.log(`Agent Manager: Ready`);
});

