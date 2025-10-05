import { Router, Request, Response } from "express";
import { verifyToken } from "../../auth/auth.jwt";
import "dotenv/config";

const router = Router();


router.get("/key", verifyToken, (req: Request, res: Response) => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return res.status(500).json({ success: false, error: "ElevenLabs API key not configured" });
  }
  // Return the key (or a signed token in a real deployment)
  return res.json({ success: true, apiKey: key });
});

export default router;