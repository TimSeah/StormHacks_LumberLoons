import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { verifyToken } from "./auth/auth.jwt";
import authRouter from "./auth/auth.routes";
import connectDB from "./config/mongodb";
import livekitRoutes from "./features/livekit/livekit.routes";
import chatHistoryRoutes from "./features/chat-history-endpoints/chat_history.routes";

dotenv.config();

connectDB();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// middleware
app.use(cors());
app.use(express.json());

// serve static files from /public
app.use(express.static(path.join(__dirname, "../public")));

// mount your API routes
app.use("/livekit", livekitRoutes);
app.use("/auth", authRouter);
app.use("/chat-history", chatHistoryRoutes);

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
