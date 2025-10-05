import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { AgentManager } from "./agent/agent-manager";
import { verifyToken } from "./auth/auth.jwt";
import authRouter from "./auth/auth.routes";
import connectDB from "./config/mongodb";
import agentRoutes, {
  initializeAgentManager,
} from "./features/agent/agent.routes";
import chatHistoryRoutes from "./features/chat-history-endpoints/chat_history.routes";
import livekitRoutes from "./features/livekit/livekit.routes";
import elevenlabsRoutes from "./features/aquireElevenlabKey/aquireKey.routes";
import emotionRoutes from "./features/emotion/emotion.routes";

dotenv.config();

connectDB();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 video frames
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// serve static files from /public
app.use(express.static(path.join(__dirname, "../public")));

// Initialize Agent Manager
const agentManager = new AgentManager({
  livekitUrl: process.env.LIVEKIT_URL || "",
  apiKey: process.env.LIVEKIT_API_KEY || "",
  apiSecret: process.env.LIVEKIT_API_SECRET || "",
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || "", // Used for both TTS and STT!
  voiceId: process.env.ELEVENLABS_VOICE_ID,
  agentId: process.env.ELEVENLABS_AGENT_ID, // For ElevenLabs Conversational AI
});

// Initialize agent routes with manager
initializeAgentManager(agentManager);

// mount your API routes
app.use("/livekit", livekitRoutes);
app.use("/agent", agentRoutes);
app.use("/auth", authRouter);
app.use("/chat-history", chatHistoryRoutes);
app.use("/api/elevenlabs", elevenlabsRoutes);
app.use("/api/emotion", emotionRoutes);


app.get("/", (_req, res) => {
  res.send("test");
});

// protected example
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "protected data", user: (req as any).user });
});

// global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Unhandled request error:", err);
  res.status(500).json({ message: "internal_server_error" });
});

// process-level handlers
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // optional: process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);
});

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
