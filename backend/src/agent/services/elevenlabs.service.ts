/**
 * ElevenLabs Service
 * Handles text-to-speech and voice transformation using ElevenLabs API
 */

import axios from 'axios';
import { Readable } from 'stream';

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
  modelId?: string;
  agentId?: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private modelId: string;
  private agentId?: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice by default
    this.modelId = config.modelId || 'eleven_monolingual_v1';
    this.agentId = config.agentId;
  }

  /**
   * Convert text to speech and get audio stream
   * @param text - The text to convert to speech
   * @returns Readable stream of audio data (MP3)
   */
  async textToSpeechStream(text: string): Promise<Readable> {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${this.voiceId}/stream`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        data: {
          text,
          model_id: this.modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        responseType: 'stream',
      });

      return response.data as unknown as Readable;
    } catch (error: any) {
      console.error('ElevenLabs TTS error:', error.response?.data || error.message);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  /**
   * Convert text to speech and get full audio buffer
   * @param text - The text to convert to speech
   * @returns Buffer of audio data (MP3)
   */
  async textToSpeech(text: string): Promise<Buffer> {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        data: {
          text,
          model_id: this.modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data as unknown as ArrayBuffer);
    } catch (error: any) {
      console.error('ElevenLabs TTS error:', error.response?.data || error.message);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  /**
   * Get list of available voices
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/voices`,
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return (response.data as any).voices;
    } catch (error: any) {
      console.error('ElevenLabs get voices error:', error.message);
      throw new Error(`Failed to get voices: ${error.message}`);
    }
  }

  /**
   * Set voice for TTS
   * @param voiceId - The voice ID to use
   */
  setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  /**
   * Set model for TTS
   * @param modelId - The model ID to use
   */
  setModel(modelId: string): void {
    this.modelId = modelId;
  }

  /**
   * Convert speech to text (transcription) using ElevenLabs Speech-to-Text API
   * Uses the "scribe_v1" model
   * @param audioBuffer - Audio buffer to transcribe
   * @param filename - Original filename (optional)
   * @returns Transcribed text
   */
  async speechToText(audioBuffer: Buffer, filename: string = 'audio.mp3'): Promise<string> {
    try {
      console.log(`🎤 Transcribing audio with ElevenLabs STT (${audioBuffer.length} bytes)...`);

      const FormData = require('form-data');
      const formData = new FormData();
      
      // Add the audio file
      formData.append('file', audioBuffer, {
        filename: filename,
        contentType: 'audio/webm',
      });
      
      // Add model_id
      formData.append('model_id', 'scribe_v1');
      
      // Add optional parameters
      formData.append('tag_audio_events', 'true');
      formData.append('diarize', 'false'); // Set to true if you want speaker identification
      // formData.append('language_code', 'eng'); // Optional: auto-detect if not set

      // Make the API request to correct ElevenLabs STT endpoint
      const response = await axios({
        method: 'post',
        url: 'https://api.elevenlabs.io/v1/speech-to-text',
        headers: {
          ...formData.getHeaders(),
          'xi-api-key': this.apiKey,
        },
        data: formData,
      });

      // Extract transcription from response
      const result = response.data as any;
      const transcription = result.text || result.transcript || '';
      
      console.log(`✅ ElevenLabs STT Transcription: "${transcription}"`);

      return transcription;
    } catch (error: any) {
      console.error('ElevenLabs STT error:', error.response?.data || error.message);
      throw new Error(`Failed to transcribe audio with ElevenLabs: ${error.message}`);
    }
  }

  /**
   * Use ElevenLabs Conversational AI to process user input
   * This uses your configured agent for natural AI conversations
   * @param userText - The user's message
   * @param conversationId - Optional conversation ID for context continuity
   * @param dynamicVariables - Optional dynamic variables to pass to the agent (e.g., user_name, custom data)
   * @returns AI response text and conversation ID
   */
  async conversationalAI(
    userText: string, 
    conversationId?: string,
    dynamicVariables?: Record<string, string>
  ): Promise<{ text: string; conversationId?: string; audioUrl?: string }> {
    if (!this.agentId) {
      throw new Error('ElevenLabs Agent ID not configured. Please set ELEVENLABS_AGENT_ID in .env');
    }

    try {
      console.log(`🤖 Sending message to ElevenLabs Conversational AI Agent: "${userText}"`);
      
      // Prepare the request body
      const requestBody: any = {
        text: userText,
      };

      // Add conversation ID if provided for context continuity
      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }

      // Add dynamic variables if provided (e.g., user_name, custom data)
      if (dynamicVariables && Object.keys(dynamicVariables).length > 0) {
        requestBody.dynamic_variables = dynamicVariables;
        console.log(`📝 Using dynamic variables:`, dynamicVariables);
      }

      // Call ElevenLabs Conversational AI endpoint
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/convai/conversation`,
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        data: {
          agent_id: this.agentId,
          ...requestBody,
        },
      });

      const result = response.data as any;
      const aiText = result.text || result.response || result.message || '';
      const newConversationId = result.conversation_id || conversationId;
      const audioUrl = result.audio_url;

      console.log(`ElevenLabs AI Response: "${aiText}"`);
      if (newConversationId) {
        console.log(`Conversation ID: ${newConversationId}`);
      }

      return {
        text: aiText,
        conversationId: newConversationId,
        audioUrl: audioUrl,
      };
    } catch (error: any) {
      console.error('ElevenLabs Conversational AI error:', error.response?.data || error.message);
      
      // Check if it's an API access issue
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('ElevenLabs API authentication failed. Please check your API key and agent ID.');
      } else if (error.response?.status === 404) {
        throw new Error('ElevenLabs Conversational AI endpoint not found. This feature may require specific API access or enterprise plan.');
      } else if (error.response?.data?.detail) {
        throw new Error(`ElevenLabs API error: ${error.response.data.detail}`);
      }
      
      throw new Error(`ElevenLabs Conversational AI failed: ${error.message}`);
    }
  }
}
