/**
 * Agent Routes
 * API endpoints for managing LiveKit agents with ElevenLabs
 */

import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { AgentManager } from '../../agent/agent-manager';

const router: Router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize agent manager (will be set from main app)
let agentManager: AgentManager;

/**
 * Initialize agent manager
 * Call this from your main app after loading env variables
 */
export function initializeAgentManager(manager: AgentManager) {
  agentManager = manager;
  console.log('Agent routes initialized');
}

/**
 * POST /agent/deploy
 * Deploy an AI agent to a room
 */
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    const { roomName, agentIdentity } = req.body;

    if (!roomName) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    // Deploy agent
    const agent = await agentManager.deployAgent(
      roomName,
      agentIdentity || 'ai-agent'
    );

    res.json({
      success: true,
      agent: {
        id: agent.id,
        roomName: agent.roomName,
        identity: agent.identity,
        status: agent.status,
        createdAt: agent.createdAt,
      },
      message: 'Agent deployed successfully',
    });
  } catch (error: any) {
    console.error('Error deploying agent:', error);
    res.status(500).json({
      error: 'Failed to deploy agent',
      message: error.message,
    });
  }
});

/**
 * GET /agent/list
 * List all active agents
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    const agents = agentManager.getAllAgents();

    res.json({
      success: true,
      count: agents.length,
      agents: agents.map((agent: any) => ({
        id: agent.id,
        roomName: agent.roomName,
        identity: agent.identity,
        status: agent.status,
        createdAt: agent.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error listing agents:', error);
    res.status(500).json({
      error: 'Failed to list agents',
      message: error.message,
    });
  }
});

/**
 * GET /agent/:agentId
 * Get agent details
 */
router.get('/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    const agent = agentManager.getAgent(agentId);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      success: true,
      agent: {
        id: agent.id,
        roomName: agent.roomName,
        identity: agent.identity,
        status: agent.status,
        createdAt: agent.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting agent:', error);
    res.status(500).json({
      error: 'Failed to get agent',
      message: error.message,
    });
  }
});

/**
 * DELETE /agent/:agentId
 * Remove an agent
 */
router.delete('/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    await agentManager.removeAgent(agentId);

    res.json({
      success: true,
      message: 'Agent removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing agent:', error);
    res.status(500).json({
      error: 'Failed to remove agent',
      message: error.message,
    });
  }
});

/**
 * POST /agent/speak
 * Make an agent speak (generate speech with ElevenLabs)
 */
router.post('/speak', async (req: Request, res: Response) => {
  try {
    const { text, agentId, stream } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    // If streaming is requested, use streaming endpoint
    if (stream) {
      const audioStream = await agentManager.generateSpeechStream(text);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      });

      audioStream.pipe(res);
    } else {
      // Generate speech (buffered - faster for short text)
      const audioBuffer = await agentManager.generateSpeech(text);

      // Return audio as response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
      });

      res.send(audioBuffer);
    }
  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({
      error: 'Failed to generate speech',
      message: error.message,
    });
  }
});

/**
 * GET /agent/room/:roomName
 * Get agents in a specific room
 */
router.get('/room/:roomName', async (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;

    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    const agents = agentManager.getAgentsInRoom(roomName);

    res.json({
      success: true,
      roomName,
      count: agents.length,
      agents: agents.map((agent: any) => ({
        id: agent.id,
        identity: agent.identity,
        status: agent.status,
        createdAt: agent.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error getting room agents:', error);
    res.status(500).json({
      error: 'Failed to get room agents',
      message: error.message,
    });
  }
});

/**
 * POST /agent/message
 * Send a text message to the agent and get audio response
 * This simulates the full flow: user speaks -> transcribed to text -> agent processes -> responds with TTS
 * 
 * Body parameters:
 * - text: The user's message (required)
 * - roomName: Optional room name for context
 * - conversationId: Optional conversation ID for context continuity
 * - dynamicVariables: Optional object with dynamic variables (e.g., { user_name: "John", user_id: "123" })
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { text, roomName, conversationId, dynamicVariables } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    console.log(`Processing message: "${text}"`);
    if (dynamicVariables) {
      console.log(`Dynamic variables:`, dynamicVariables);
    }

    // Process the input and generate response
    const response = await agentManager.processUserMessage(
      text, 
      roomName, 
      conversationId,
      dynamicVariables
    );

    res.json({
      success: true,
      input: text,
      response: response.text,
      conversationId: response.conversationId,
      audioUrl: '/agent/speak', // Frontend can call this with the response text
      message: 'Message processed successfully',
    });
  } catch (error: any) {
    console.error('Error processing message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message,
    });
  }
});

/**
 * POST /agent/message-with-emotion
 * Send a text message to the agent with emotion awareness and get audio response
 * This includes emotion detection context in the agent's response
 * 
 * Body parameters:
 * - text: The user's message (required)
 * - roomName: Optional room name for context
 * - conversationId: Optional conversation ID for context continuity
 * - dynamicVariables: Optional object with dynamic variables (e.g., { user_name: "John", user_id: "123" })
 */
router.post('/message-with-emotion', async (req: Request, res: Response) => {
  try {
    const { text, roomName, conversationId, dynamicVariables } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    console.log(`Processing emotion-aware message: "${text}"`);
    if (dynamicVariables) {
      console.log(`Dynamic variables:`, dynamicVariables);
    }

    // Process the input with emotion awareness
    const response = await agentManager.processUserMessageWithEmotion(
      text,
      roomName,
      conversationId,
      dynamicVariables
    );

    res.json({
      success: true,
      input: text,
      response: response.text,
      conversationId: response.conversationId,
      emotion: response.emotion,
      audioUrl: '/agent/speak', // Frontend can call this with the response text
      message: 'Message processed successfully with emotion awareness',
    });
  } catch (error: any) {
    console.error('Error processing message with emotion:', error);
    res.status(500).json({
      error: 'Failed to process message with emotion',
      message: error.message,
    });
  }
});

/**
 * POST /agent/transcribe
 * Transcribe audio to text using ElevenLabs Speech-to-Text
 * Accepts audio file upload via multipart/form-data
 */
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!agentManager) {
      return res.status(500).json({ error: 'Agent manager not initialized' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'audio file is required' });
    }

    console.log('Transcribing audio...', req.file.originalname, req.file.size, 'bytes');

    // Get audio buffer from uploaded file
    const audioBuffer = req.file.buffer;

    // Transcribe audio using ElevenLabs
    const transcription = await agentManager.transcribeAudio(audioBuffer);

    res.json({
      success: true,
      transcription,
      message: 'Audio transcribed successfully',
    });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({
      error: 'Failed to transcribe audio',
      message: error.message,
    });
  }
});

export default router;
