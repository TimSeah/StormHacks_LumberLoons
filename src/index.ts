// Load environment variables as early as possible
import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes";
import { verifyToken } from "./auth/auth.jwt";

const app = express();
const PORT = Number(process.env.PORT || 8080);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(express.json());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.send("test");
});

app.use("/api/auth", authRoutes);

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
