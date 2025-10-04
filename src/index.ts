import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth/auth.routes";
import { verifyToken } from "./auth/auth.jwt";

dotenv.config();

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);
});
