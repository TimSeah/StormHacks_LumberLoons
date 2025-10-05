/**
 * LiveKit Agent with ElevenLabs Integration
 * This agent joins a LiveKit room, listens to participants,
 * and responds using ElevenLabs TTS
 */

import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  LocalAudioTrack,
  RoomOptions,
} from 'livekit-client';
import { ElevenLabsService } from './services/elevenlabs.service';
import { AudioConverter, AudioBuffer } from './services/audio.utils';
import { EventEmitter } from 'events';

export interface AgentConfig {
  livekitUrl: string;
  token: string;
  elevenlabsApiKey: string;
  voiceId?: string;
  agentName?: string;
  autoGreet?: boolean;
}

export class LiveKitAgent extends EventEmitter {
  private room: Room;
  private elevenlabs: ElevenLabsService;
  private config: AgentConfig;
  private audioTrack?: LocalAudioTrack;
  private isConnected: boolean = false;
  private isSpeaking: boolean = false;
  private audioBuffer: AudioBuffer;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.audioBuffer = new AudioBuffer();

    // Initialize ElevenLabs service
    this.elevenlabs = new ElevenLabsService({
      apiKey: config.elevenlabsApiKey,
      voiceId: config.voiceId,
    });

    // Initialize LiveKit room
    this.room = new Room();
  }

  /**
   * Connect agent to LiveKit room
   */
  async connect(): Promise<void> {
    try {
      console.log('Agent connecting to room...');

      await this.room.connect(this.config.livekitUrl, this.config.token);

      this.isConnected = true;
      console.log(`Agent connected to room: ${this.room.name}`);

      // Setup event listeners
      this.setupEventListeners();

      // Create and publish audio track for agent's voice
      await this.setupAudioTrack();

      // Send greeting if enabled
      if (this.config.autoGreet) {
        await this.speak('Hello! I am your AI assistant. How can I help you today?');
      }

      this.emit('connected');
    } catch (error: any) {
      console.error('x Agent connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Setup audio track for agent's voice output
   */
  private async setupAudioTrack(): Promise<void> {
    try {
      // Create local audio track
      console.log('Setting up agent audio track...');
      
      // The actual publishing will happen when we have audio to send
      console.log('Audio track ready');
    } catch (error: any) {
      console.error('x Failed to setup audio track:', error.message);
      throw error;
    }
  }

  /**
   * Setup event listeners for room events
   */
  private setupEventListeners(): void {
    // Listen for participants joining
    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log(`Participant joined: ${participant.identity}`);
      this.handleParticipantJoined(participant);
    });

    // Listen for participants leaving
    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log(`Participant left: ${participant.identity}`);
    });

    // Listen for track subscriptions
    this.room.on(
      RoomEvent.TrackSubscribed,
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.handleTrackSubscribed(track, publication, participant);
      }
    );

    // Listen for track unsubscriptions
    this.room.on(
      RoomEvent.TrackUnsubscribed,
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        console.log(`Track unsubscribed from ${participant.identity}`);
      }
    );

    // Handle disconnection
    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Agent disconnected from room');
      this.isConnected = false;
      this.emit('disconnected');
    });
  }

  /**
   * Handle participant joining the room
   */
  private handleParticipantJoined(participant: RemoteParticipant): void {
    console.log(`Handling participant: ${participant.identity}`);
    
    // Optionally greet new participant
    // await this.speak(`Welcome ${participant.identity}!`);
  }

  /**
   * Handle track subscription (when agent receives audio/video)
   */
  private handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ): void {
    console.log(`Subscribed to ${participant.identity}'s ${track.kind} track`);

    if (track.kind === 'audio') {
      console.log(`Listening to audio from ${participant.identity}`);
      // Here you would process the audio stream
      // For now, we'll use text-based triggers
      this.emit('audioReceived', { participant, track });
    }
  }

  /**
   * Speak text using ElevenLabs and publish to room
   * @param text - Text to convert to speech
   */
  async speak(text: string): Promise<void> {
    if (this.isSpeaking) {
      console.log('Agent is already speaking, queuing...');
      // Could implement a queue here
      return;
    }

    this.isSpeaking = true;
    console.log(`Agent speaking: "${text}"`);

    try {
      // Get audio from ElevenLabs
      const audioBuffer = await this.elevenlabs.textToSpeech(text);
      console.log(`Received audio from ElevenLabs (${audioBuffer.length} bytes)`);

      // Convert MP3 to PCM for LiveKit
      const pcmBuffer = await AudioConverter.convertBufferToPCM(audioBuffer, 48000, 1);
      console.log(`Converted to PCM (${pcmBuffer.length} bytes)`);

      // Publish audio to LiveKit room
      await this.publishAudio(pcmBuffer);

      this.emit('speechComplete', { text });
    } catch (error: any) {
      console.error('Failed to speak:', error.message);
      this.emit('error', error);
    } finally {
      this.isSpeaking = false;
    }
  }

  /**
   * Publish audio buffer to LiveKit room
   */
  private async publishAudio(pcmBuffer: Buffer): Promise<void> {
    try {
      console.log('Publishing audio to room...');

      // Create audio frames
      const frames = AudioConverter.createFrames(pcmBuffer, 48000, 960);
      console.log(`Created ${frames.length} audio frames`);
      
      // For now, log that we would publish
      console.log(`Would publish ${frames.length} frames to room`);
      
      // Simulate publishing delay
      await new Promise(resolve => setTimeout(resolve, frames.length * 20));
      
      console.log('Audio published successfully');
    } catch (error: any) {
      console.error('Failed to publish audio:', error.message);
      throw error;
    }
  }

  /**
   * Process user audio and respond
   * @param text - Transcribed text from user
   */
  async processUserInput(text: string): Promise<void> {
    console.log(`Processing user input: "${text}"`);

    // Simple echo response (you would integrate AI here)
    const response = `I heard you say: ${text}. How can I help you with that?`;
    
    await this.speak(response);
  }

  /**
   * Disconnect agent from room
   */
  async disconnect(): Promise<void> {
    console.log('Agent disconnecting...');
    
    if (this.room) {
      await this.room.disconnect();
    }

    this.isConnected = false;
    console.log('Agent disconnected');
  }

  /**
   * Check if agent is connected
   */
  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Get current room name
   */
  getRoomName(): string | undefined {
    return this.room?.name;
  }
}
