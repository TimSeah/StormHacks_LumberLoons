import "dotenv/config";
import { Request, Response, Router } from "express";
import fetch from "node-fetch";
import { verifyToken } from "../../auth/auth.jwt";
import Conversation, { IConversation } from "../../models/Message";

const router = Router();

// List conversations from DB (supports simple filtering / pagination)
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "30", user_id, agent_id } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSize = Math.min(100, parseInt(limit as string, 10));

    const filter: any = {};
    if (user_id) filter.userId = user_id;
    if (agent_id) filter.agentId = agent_id;

    const docs = await Conversation.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    const total = await Conversation.countDocuments(filter).exec();

    res.json({
      success: true,
      data: docs,
      meta: { page: pageNum, limit: pageSize, total },
    });
  } catch (error) {
    console.error("Error listing conversations:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to list conversations" });
  }
});

// Get one by conversationId (DB lookup). Optionally fetch remote and upsert if ?fetch_remote=true
router.get(
  "/:conversationId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const fetchRemote = req.query.fetch_remote === "true";

      // Try to find by MongoDB _id first (for internal navigation), then by conversationId (external ID)
      let doc = null;

      // Check if the parameter looks like a MongoDB ObjectId (24 char hex string)
      if (/^[0-9a-fA-F]{24}$/.test(conversationId)) {
        doc = await Conversation.findById(conversationId).lean().exec();
      }

      // If not found by _id, try finding by conversationId field
      if (!doc) {
        doc = await Conversation.findOne({ conversationId }).lean().exec();
      }

      if (!doc && fetchRemote) {
        // fallback to ElevenLabs remote fetch then upsert
        const resp = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
          {
            method: "GET",
            headers: {
              "xi-api-key": process.env.ELEVENLABS_API_KEY!,
              "Content-Type": "application/json",
            },
          }
        );
        if (!resp.ok) {
          if (resp.status === 404)
            return res
              .status(404)
              .json({ success: false, error: "Conversation not found" });
          throw new Error(`ElevenLabs API error: ${resp.statusText}`);
        }
        const remote = await resp.json();
        // transform remote into our shape if needed
        const upsert: Partial<IConversation> = {
          conversationId,
          raw: remote,
          // try to map fields if remote provides them (example)
          // messages: remote.messages?.map(m => ({ role: m.role, text: m.text, timestamp: new Date(m.timestamp) })) || []
        };
        doc = await Conversation.findOneAndUpdate(
          { conversationId },
          upsert as any,
          { upsert: true, new: true }
        )
          .lean()
          .exec();
      }

      if (!doc)
        return res
          .status(404)
          .json({ success: false, error: "Conversation not found" });

      res.json({ success: true, data: doc });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch conversation" });
    }
  }
);

// Create a new conversation record (client or server can call this)
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    // minimal validation
    if (!payload.messages || !Array.isArray(payload.messages)) {
      return res
        .status(400)
        .json({ success: false, error: "messages array required" });
    }
    const conv = new Conversation({
      conversationId: payload.conversationId,
      userId: payload.userId,
      agentId: payload.agentId,
      callSuccessful: payload.callSuccessful,
      callStart: payload.callStart ? new Date(payload.callStart) : undefined,
      messages: payload.messages.map((m: any) => ({
        role: m.role,
        text: m.text,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      })),
      summary: payload.summary,
      raw: payload.raw,
    });
    await conv.save();
    res.status(201).json({ success: true, data: conv });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create conversation" });
  }
});

// Update summary or messages
router.put(
  "/:conversationId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const updates: any = {};
      if (req.body.summary) updates.summary = req.body.summary;
      if (req.body.messages && Array.isArray(req.body.messages)) {
        updates.messages = req.body.messages.map((m: any) => ({
          role: m.role,
          text: m.text,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
      }
      const updated = await Conversation.findOneAndUpdate(
        { conversationId },
        updates,
        { new: true }
      )
        .lean()
        .exec();
      if (!updated)
        return res
          .status(404)
          .json({ success: false, error: "Conversation not found" });
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Error updating conversation:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to update conversation" });
    }
  }
);

export default router;
