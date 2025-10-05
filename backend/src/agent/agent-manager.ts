/**
 * Agent Manager
 * Manages LiveKit agents and their lifecycle
 */

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { ElevenLabsService } from './services/elevenlabs.service';
import { EventEmitter } from 'events';
import axios from 'axios';

export interface AgentManagerConfig {
  livekitUrl: string;
  apiKey: string;
  apiSecret: string;
  elevenlabsApiKey: string;
  voiceId?: string;
  agentId?: string;
}

export interface AgentInstance {
  id: string;
  roomName: string;
  identity: string;
  token: string;
  createdAt: Date;
  status: 'pending' | 'active' | 'disconnected';
}

/**
 * Manages AI agents for LiveKit rooms
 */
export class AgentManager extends EventEmitter {
  private config: AgentManagerConfig;
  private roomService: RoomServiceClient;
  private elevenlabs: ElevenLabsService;
  private agents: Map<string, AgentInstance> = new Map();

  constructor(config: AgentManagerConfig) {
    super();
    this.config = config;

    // Initialize LiveKit room service
    this.roomService = new RoomServiceClient(
      config.livekitUrl,
      config.apiKey,
      config.apiSecret
    );

    // Initialize ElevenLabs service (handles both TTS and STT!)
    this.elevenlabs = new ElevenLabsService({
      apiKey: config.elevenlabsApiKey,
      voiceId: config.voiceId,
      agentId: config.agentId,
    });

    console.log('ElevenLabs initialized (TTS + STT + Conversational AI)');
    console.log('Agent Manager initialized');
  }

  /**
   * Deploy an agent to a room
   * @param roomName - Name of the room
   * @param agentIdentity - Identity for the agent (default: 'ai-agent')
   * @returns Agent instance details
   */
  async deployAgent(roomName: string, agentIdentity: string = 'ai-agent'): Promise<AgentInstance> {
    try {
      console.log(`Deploying agent to room: ${roomName}`);

      // Create access token for the agent
      const token = await this.createAgentToken(roomName, agentIdentity);

      // Create agent instance
      const agent: AgentInstance = {
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        roomName,
        identity: agentIdentity,
        token,
        createdAt: new Date(),
        status: 'pending',
      };

      // Store agent instance
      this.agents.set(agent.id, agent);

      console.log(`Agent deployed: ${agent.id}`);
      this.emit('agentDeployed', agent);

      // In a full implementation, you would:
      // 1. Spawn a worker process/thread that connects to LiveKit
      // 2. The worker subscribes to audio tracks
      // 3. Processes audio and sends to ElevenLabs
      // 4. Publishes ElevenLabs response back to room

      return agent;
    } catch (error: any) {
      console.error('Failed to deploy agent:', error.message);
      throw error;
    }
  }

  /**
   * Create access token for an agent
   */
  private async createAgentToken(roomName: string, identity: string): Promise<string> {
    const at = new AccessToken(this.config.apiKey, this.config.apiSecret, {
      identity,
      metadata: JSON.stringify({ role: 'agent', type: 'elevenlabs' }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return await at.toJwt();
  }

  /**
   * Process text and generate speech
   * @param text - Text to convert to speech
   * @returns Audio buffer
   */
  async generateSpeech(text: string): Promise<Buffer> {
    console.log(`Generating speech: "${text}"`);
    
    try {
      const audioBuffer = await this.elevenlabs.textToSpeech(text);
      console.log(`Speech generated (${audioBuffer.length} bytes)`);
      return audioBuffer;
    } catch (error: any) {
      console.error('Failed to generate speech:', error.message);
      throw error;
    }
  }

  /**
   * Process text and generate speech as stream (for faster playback)
   * @param text - Text to convert to speech
   * @returns Readable stream of audio data
   */
  async generateSpeechStream(text: string): Promise<NodeJS.ReadableStream> {
    console.log(`Generating speech stream: "${text}"`);
    
    try {
      const audioStream = await this.elevenlabs.textToSpeechStream(text);
      console.log(`Speech stream started`);
      return audioStream;
    } catch (error: any) {
      console.error('Failed to generate speech stream:', error.message);
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentInstance | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents in a room
   */
  getAgentsInRoom(roomName: string): AgentInstance[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.roomName === roomName
    );
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  /**
   * Remove agent
   */
  async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      console.log(`Removing agent: ${agentId}`);
      agent.status = 'disconnected';
      this.agents.delete(agentId);
      this.emit('agentRemoved', agent);
    }
  }

  /**
   * Get participants in a room
   */
  async getRoomParticipants(roomName: string) {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants;
    } catch (error: any) {
      console.error(`Failed to get participants for room ${roomName}:`, error.message);
      return [];
    }
  }

  /**
   * Transcribe audio to text using ElevenLabs Speech-to-Text
   * @param audioBuffer - Audio buffer to transcribe
   * @returns Transcribed text
   */
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      console.log('🎤 Transcribing audio with ElevenLabs...');
      
      // Use ElevenLabs STT
      const transcription = await this.elevenlabs.speechToText(audioBuffer);
      
      console.log(`✅ Transcription: "${transcription}"`);
      return transcription;
    } catch (error: any) {
      console.error('Transcription error:', error.message);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Process user message and generate AI response
   * This do the full conversational flow:
   * 1. User speaks (audio) -> transcribed to text (not implemented yet)
   * 2. Text is processed by AI
   * 3. ElevenLabsAI generates response text -> NOTE: Currently it was not working. (Oct 05 2025 00:35)
   * 4. Response is converted to speech via ElevenLabs
   * 
   * @param userText - The transcribed user input
   * @param roomName - Optional room name for context
   * @param conversationId - Optional conversation ID for context continuity
   * @param dynamicVariables - Optional dynamic variables to pass to ElevenLabs Agent (e.g., user_name, user_id, custom data)
   * @returns Response object with text and audio
   */
  async processUserMessage(
    userText: string, 
    roomName?: string, 
    conversationId?: string,
    dynamicVariables?: Record<string, string>
  ): Promise<{ text: string; audio?: Buffer; conversationId?: string }> {
    console.log(`Processing user message: "${userText}"`);

    try {
      let responseText: string;
      let newConversationId: string | undefined = conversationId;
      
      // Try to use ElevenLabs Conversational AI if agent ID is configured
      if (this.config.agentId) {
        try {
          // Prepare dynamic variables with system context
          const enhancedDynamicVars = {
            ...(dynamicVariables || {}),
            system__time: new Date().toISOString(),
            system__room: roomName || 'unknown',
          };

          const aiResponse = await this.elevenlabs.conversationalAI(
            userText, 
            conversationId,
            enhancedDynamicVars
          );
          responseText = aiResponse.text;
          newConversationId = aiResponse.conversationId;
          console.log(`ElevenLabs AI response: "${responseText}"`);
        } catch (error: any) {
          console.error('ElevenLabs AI failed, falling back to simple responses:', error.message);
          responseText = this.getSimpleResponse(userText);
        }
      } else {
        // Fallback to simple keyword-based responses
        console.log('No agent ID configured, using simple responses');
        responseText = this.getSimpleResponse(userText);
      }

      console.log(`Final response: "${responseText}"`);

      // Generate audio for the response
      const audioBuffer = await this.generateSpeech(responseText);

      return {
        text: responseText,
        audio: audioBuffer,
        conversationId: newConversationId,
      };
    } catch (error: any) {
      console.error('Failed to process user message:', error.message);
      throw error;
    }
  }

  /**
   * Get simple keyword-based response as fallback
   */
  private getSimpleResponse(userText: string): string {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return "Hey there! How can I help you today?";
    } else if (lowerText.includes('how are you')) {
      return "I'm doing great, thanks for asking! What can I do for you?";
    } else if (lowerText.includes('weather')) {
      return "I don't have access to weather data right now, but I'd be happy to help with something else!";
    } else if (lowerText.includes('time')) {
      const time = new Date().toLocaleTimeString();
      return `It's ${time} right now.`;
    } else if (lowerText.includes('help')) {
      return "I'm here to assist you! You can ask me questions, have a chat, or just talk to me about anything.";
    } else if (lowerText.includes('testing')) {
      return "I hear you loud and clear! The system is working perfectly.";
    } else if (lowerText.includes('thank')) {
      return "You're welcome! Happy to help anytime!";
    } else if (lowerText.includes('bye') || lowerText.includes('goodbye')) {
      return "Goodbye! Have a great day!";
    } else if (lowerText.includes('name')) {
      return "I'm your AI voice assistant. You can just call me Assistant!";
    } else if (lowerText.includes('who are you')) {
      return "I'm an AI assistant here to chat with you and help out however I can!";
    } else if (lowerText.includes('what can you do')) {
      return "I can have conversations with you, answer questions, and help with various tasks. What would you like to talk about?";
    } else {
      // More natural fallback responses
      const fallbackResponses = [
        "That's interesting! Tell me more about that.",
        "I see what you mean. What else would you like to know?",
        "Good point! Anything else on your mind?",
        "Interesting thought! What made you think of that?",
        "I understand. Is there anything specific you'd like help with?",
        "Got it! What would you like to explore next?",
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  }

  /**
   * Fetch current emotion data from emotion detector service
   * @returns Emotion data or null if unavailable
   */
  async fetchEmotionData(): Promise<any> {
    try {
      const emotionDetectorUrl = process.env.EMOTION_DETECTOR_URL || 'http://localhost:5000';
      const response = await axios.get(`${emotionDetectorUrl}/api/webhook/emotion`, {
        timeout: 3000,
      });
      return response.data;
    } catch (error: any) {
      console.log('Could not fetch emotion data:', error.message);
      return null;
    }
  }

  /**
   * Process user message with emotion context
   * This enhances the conversation by including the user's current emotion
   * 
   * @param userText - The transcribed user input
   * @param roomName - Optional room name for context
   * @param conversationId - Optional conversation ID for context continuity
   * @param dynamicVariables - Optional dynamic variables to pass to ElevenLabs Agent
   * @returns Response object with text and audio
   */
  async processUserMessageWithEmotion(
    userText: string,
    roomName?: string,
    conversationId?: string,
    dynamicVariables?: Record<string, string>
  ): Promise<{ text: string; audio?: Buffer; conversationId?: string; emotion?: any }> {
    console.log(`Processing user message with emotion: "${userText}"`);

    try {
      // Fetch current emotion data
      const emotionData = await this.fetchEmotionData();
      
      // Enhance dynamic variables with emotion context
      const enhancedDynamicVars: Record<string, string> = {
        ...(dynamicVariables || {}),
        system__time: new Date().toISOString(),
        system__room: roomName || 'unknown',
      };

      // Add emotion context if available
      if (emotionData && emotionData.face_detected) {
        enhancedDynamicVars.user_emotion = emotionData.emotion || 'Neutral';
        enhancedDynamicVars.user_emotion_confidence = (emotionData.confidence * 100).toFixed(0) + '%';
        enhancedDynamicVars.emotion_context = emotionData.context || '';
        
        console.log(`📊 User emotion detected: ${emotionData.emotion} (${(emotionData.confidence * 100).toFixed(0)}%)`);
      }

      let responseText: string;
      let newConversationId: string | undefined = conversationId;

      // Try to use ElevenLabs Conversational AI if agent ID is configured
      if (this.config.agentId) {
        try {
          const aiResponse = await this.elevenlabs.conversationalAI(
            userText,
            conversationId,
            enhancedDynamicVars
          );
          responseText = aiResponse.text;
          newConversationId = aiResponse.conversationId;
          console.log(`🤖 ElevenLabs AI response: "${responseText}"`);
        } catch (error: any) {
          console.error('ElevenLabs AI failed, falling back to simple responses:', error.message);
          responseText = this.getSimpleResponseWithEmotion(userText, emotionData);
        }
      } else {
        // Fallback to simple emotion-aware responses
        console.log('No agent ID configured, using simple emotion-aware responses');
        responseText = this.getSimpleResponseWithEmotion(userText, emotionData);
      }

      console.log(`Final response: "${responseText}"`);

      // Generate audio for the response
      const audioBuffer = await this.generateSpeech(responseText);

      return {
        text: responseText,
        audio: audioBuffer,
        conversationId: newConversationId,
        emotion: emotionData,
      };
    } catch (error: any) {
      console.error('Failed to process user message with emotion:', error.message);
      throw error;
    }
  }

  /**
   * Get simple emotion-aware response as fallback
   */
  private getSimpleResponseWithEmotion(userText: string, emotionData: any): string {
    const lowerText = userText.toLowerCase();
    const emotion = emotionData?.emotion || 'Neutral';
    const faceDetected = emotionData?.face_detected || false;

    // Emotion-aware greetings
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      if (faceDetected) {
        if (emotion === 'Happy') {
          return "Hey! You're looking cheerful today! How can I help you?";
        } else if (emotion === 'Sad') {
          return "Hi there. I'm here for you. What's on your mind?";
        } else if (emotion === 'Angry') {
          return "Hello. I'm here to help. Take your time and let me know what's bothering you.";
        }
      }
      return "Hey there! How can I help you today?";
    }

    // Emotion-aware "how are you" responses
    if (lowerText.includes('how are you')) {
      if (faceDetected) {
        if (emotion === 'Happy') {
          return "I'm doing great, and it looks like you are too! What can I do for you?";
        } else if (emotion === 'Sad') {
          return "I'm here for you. It seems like you might be going through something. Want to talk about it?";
        }
      }
      return "I'm doing great, thanks for asking! What can I do for you?";
    }

    // Default fallback with emotion awareness
    if (faceDetected && emotion === 'Sad') {
      return "I'm here to listen and support you. How can I help make things better?";
    } else if (faceDetected && emotion === 'Angry') {
      return "I understand you might be upset. Take your time, and let me know how I can assist you.";
    } else if (faceDetected && emotion === 'Happy') {
      return "That's wonderful! What would you like to talk about?";
    }

    // Standard fallback
    return this.getSimpleResponse(userText);
  }

//   /**
//    * Send data message to room (for coordination)
//    */
//   async sendMessageToRoom(roomName: string, message: any): Promise<void> {
//     // In a full implementation, you would use LiveKit's data messages
//     console.log(`Would send message to room ${roomName}:`, message);
//   }
}
