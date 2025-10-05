/**
 * Emotion Detection Routes
 * API endpoints for forwarding video frames to emotion detector
 */

import express, { Request, Response, Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();

// Emotion detector service URL
const EMOTION_DETECTOR_URL = process.env.EMOTION_DETECTOR_URL || 'http://localhost:5000';

/**
 * POST /emotion/process-frame
 * Forward video frame to emotion detector
 */
router.post('/process-frame', async (req: Request, res: Response) => {
  try {
    const { frame } = req.body;

    if (!frame) {
      return res.status(400).json({ error: 'Frame data is required' });
    }

    // Forward frame to emotion detector API
    const response = await axios.post(
      `${EMOTION_DETECTOR_URL}/api/process_frame`,
      { frame },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      }
    );

    res.json({
      success: true,
      emotion: response.data,
    });
  } catch (error: any) {
    console.error('Error processing frame:', error.message);
    res.status(500).json({
      error: 'Failed to process frame',
      message: error.message,
    });
  }
});

/**
 * GET /emotion/current
 * Get current emotion data from detector
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${EMOTION_DETECTOR_URL}/api/emotion`, {
      timeout: 5000,
    });

    res.json({
      success: true,
      emotion: response.data,
    });
  } catch (error: any) {
    console.error('Error getting emotion:', error.message);
    res.status(500).json({
      error: 'Failed to get emotion',
      message: error.message,
    });
  }
});

/**
 * GET /emotion/webhook
 * Webhook endpoint for ElevenLabs to fetch emotion context
 * This proxies the emotion detector's webhook endpoint
 */
router.get('/webhook', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      `${EMOTION_DETECTOR_URL}/api/webhook/emotion`,
      { timeout: 5000 }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching emotion webhook:', error.message);
    
    // Return neutral emotion on error
    res.json({
      emotion: 'Neutral',
      confidence: 0.0,
      face_detected: false,
      context: 'Emotion detection unavailable. Proceed with neutral conversation.',
      emotional_state: 'unknown',
    });
  }
});

export default router;
