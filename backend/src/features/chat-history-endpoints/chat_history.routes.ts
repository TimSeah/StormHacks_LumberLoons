import { Router, Request, Response } from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { verifyToken } from "../../auth/auth.jwt";
import "dotenv/config";

const router = Router();

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// List all conversations with optional filtering
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const {
      cursor,
      agent_id,
      call_successful,
      call_start_before_unix,
      call_start_after_unix,
      user_id,
      page_size = 30,
      summary_mode = "exclude"
    } = req.query;

    console.log("Fetching conversations with params:", req.query);

    // Build the request parameters
    const params: any = {};
    
    if (cursor) params.cursor = cursor as string;
    if (agent_id) params.agent_id = agent_id as string;
    if (call_successful) params.call_successful = call_successful as string;
    if (call_start_before_unix) params.call_start_before_unix = parseInt(call_start_before_unix as string);
    if (call_start_after_unix) params.call_start_after_unix = parseInt(call_start_after_unix as string);
    if (user_id) params.user_id = user_id as string;
    if (page_size) params.page_size = parseInt(page_size as string);
    if (summary_mode) params.summary_mode = summary_mode as string;

    // Make API call to ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat history",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get detailed conversation by ID
router.get("/:conversationId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    console.log(`Fetching conversation details for ID: ${conversationId}`);

    // Make API call to ElevenLabs for specific conversation
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          error: "Conversation not found",
        });
      }
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Error fetching conversation details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversation details",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;