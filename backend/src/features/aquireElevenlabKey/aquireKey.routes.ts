import "dotenv/config";
import { Request, Response, Router } from "express";
import { verifyToken } from "../../auth/auth.jwt";

const router = Router();

// Get signed URL for WebSocket connection to ElevenLabs Conversational AI
router.get("/signed-url", verifyToken, async (req: Request, res: Response) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey) {
    return res
      .status(500)
      .json({ success: false, error: "ElevenLabs API key not configured" });
  }

  if (!agentId) {
    return res
      .status(500)
      .json({ success: false, error: "ElevenLabs Agent ID not configured" });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs signed URL error:", errorText);
      return res.status(500).json({
        success: false,
        error: "Failed to get signed URL from ElevenLabs",
      });
    }

    const body = await response.json();
    return res.json({ success: true, signedUrl: body.signed_url });
  } catch (error: any) {
    console.error("ElevenLabs signed URL error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to get signed URL" });
  }
});

// Get conversation token for WebRTC connection to ElevenLabs Conversational AI
router.get(
  "/conversation-token",
  verifyToken,
  async (req: Request, res: Response) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, error: "ElevenLabs API key not configured" });
    }

    if (!agentId) {
      return res
        .status(500)
        .json({ success: false, error: "ElevenLabs Agent ID not configured" });
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
        {
          headers: {
            "xi-api-key": apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs conversation token error:", errorText);
        return res.status(500).json({
          success: false,
          error: "Failed to get conversation token from ElevenLabs",
        });
      }

      const body = await response.json();
      return res.json({ success: true, conversationToken: body.token });
    } catch (error: any) {
      console.error("ElevenLabs conversation token error:", error.message);
      return res
        .status(500)
        .json({ success: false, error: "Failed to get conversation token" });
    }
  }
);

export default router;
