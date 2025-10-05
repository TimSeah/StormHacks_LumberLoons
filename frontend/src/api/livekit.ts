import {
  Room,
  RoomEvent,
  createLocalAudioTrack,
  createLocalVideoTrack,
} from "livekit-client";
import ApiClient from "./client";

export interface LiveKitConnectionOptions {
  identity: string;
  roomName: string;
  enableVideo?: boolean;
  enableAudio?: boolean;
}

export interface LiveKitService {
  room: Room | null;
  isConnected: boolean;
}

class LiveKitApi {
  private room: Room | null = null;
  private wsUrl = "wss://stormhacks-blar11m6.livekit.cloud";

  /**
   * Fetch a token from the backend for LiveKit room access
   */
  async fetchToken(identity: string, roomName: string): Promise<string> {
    try {
      const response = await ApiClient.authenticatedFetch("/livekit/token", {
        method: "POST",
        body: JSON.stringify({
          identity,
          roomName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching LiveKit token:", error);
      throw error;
    }
  }

  /**
   * Connect to a LiveKit room
   */
  async connectToRoom(options: LiveKitConnectionOptions): Promise<Room> {
    try {
      // Clean up any existing connection
      if (this.room) {
        await this.disconnectFromRoom();
      }

      // Fetch token from backend
      const token = await this.fetchToken(options.identity, options.roomName);

      // Create new room instance with connection options
      this.room = new Room({
        adaptiveStream: true, // Adjust quality based on connection
        dynacast: true, // Optimize bandwidth usage
        reconnectPolicy: {
          nextRetryDelayInMs: (context) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
            // Stop after 5 attempts by returning -1
            if (context.retryCount >= 5) return -1;
            return Math.min(1000 * Math.pow(2, context.retryCount), 10000);
          },
        },
      });

      // Set up event listeners
      this.setupRoomEventListeners();

      // Connect to LiveKit Cloud with timeout
      await this.room.connect(this.wsUrl, token, {
        autoSubscribe: true,
      });

      // Publish audio track if enabled (default: true)
      if (options.enableAudio !== false) {
        await this.publishAudioTrack();
      }

      // Publish video track if enabled (default: false)
      if (options.enableVideo === true) {
        await this.publishVideoTrack();
      }

      console.log("Successfully connected to LiveKit room:", options.roomName);
      return this.room;
    } catch (error) {
      console.error("Failed to connect to LiveKit room:", error);
      throw error;
    }
  }

  /**
   * Disconnect from the current room
   */
  async disconnectFromRoom(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      console.log("Disconnected from LiveKit room");
    }
  }

  /**
   * Publish audio track to the room
   */
  private async publishAudioTrack(): Promise<void> {
    if (!this.room) return;

    try {
      const audioTrack = await createLocalAudioTrack();
      await this.room.localParticipant.publishTrack(audioTrack);
      console.log("Audio track published");
    } catch (error) {
      console.error("Failed to publish audio track:", error);
    }
  }

  /**
   * Publish video track to the room
   */
  private async publishVideoTrack(): Promise<void> {
    if (!this.room) return;

    try {
      const videoTrack = await createLocalVideoTrack();
      await this.room.localParticipant.publishTrack(videoTrack);
      console.log("Video track published");
    } catch (error) {
      console.error("Failed to publish video track:", error);
    }
  }

  /**
   * Set up event listeners for the room
   */
  private setupRoomEventListeners(): void {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      console.log("Connected to room");
    });

    this.room.on(RoomEvent.Disconnected, (reason) => {
      console.log("Disconnected from room:", reason);
      // Don't auto-reconnect on intentional disconnect or duplicate connections
      if (reason !== undefined && reason !== 2) {
        console.log("Will not auto-reconnect, reason:", reason);
      }
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      console.log("Attempting to reconnect...");
    });

    this.room.on(RoomEvent.Reconnected, () => {
      console.log("Successfully reconnected to room");
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log("Participant connected:", participant.identity);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log("Participant disconnected:", participant.identity);
    });

    this.room.on(
      RoomEvent.TrackSubscribed,
      (track, _publication, participant) => {
        console.log(
          "Track subscribed:",
          track.kind,
          "from",
          participant.identity
        );
      }
    );

    this.room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
      console.log(
        "Connection quality changed:",
        quality,
        "for",
        participant?.identity || "local"
      );
    });
  }

  /**
   * Get current room instance
   */
  getCurrentRoom(): Room | null {
    return this.room;
  }

  /**
   * Check if currently connected to a room
   */
  isConnected(): boolean {
    return this.room?.state === "connected";
  }

  /**
   * Toggle audio on/off
   */
  async toggleAudio(): Promise<boolean> {
    if (!this.room) return false;

    const isCurrentlyEnabled = !this.isAudioMuted();
    await this.room.localParticipant.setMicrophoneEnabled(!isCurrentlyEnabled);
    console.log(`Audio ${isCurrentlyEnabled ? "muted" : "unmuted"}`);
    return !isCurrentlyEnabled;
  }

  /**
   * Toggle video on/off
   */
  async toggleVideo(): Promise<boolean> {
    if (!this.room) return false;

    const isCurrentlyEnabled = !this.isVideoMuted();
    await this.room.localParticipant.setCameraEnabled(!isCurrentlyEnabled);
    console.log(`Video ${isCurrentlyEnabled ? "muted" : "unmuted"}`);
    return !isCurrentlyEnabled;
  }

  /**
   * Get current audio mute status
   */
  isAudioMuted(): boolean {
    if (!this.room) return true;

    const audioPublication = this.room.localParticipant.audioTrackPublications
      .values()
      .next().value;

    return audioPublication ? audioPublication.isMuted : true;
  }

  /**
   * Get current video mute status
   */
  isVideoMuted(): boolean {
    if (!this.room) return true;

    const videoPublication = this.room.localParticipant.videoTrackPublications
      .values()
      .next().value;

    return videoPublication ? videoPublication.isMuted : true;
  }

  /**
   * Get the local video track element for display
   */
  getLocalVideoElement(): HTMLVideoElement | null {
    if (!this.room) return null;

    const videoPublication = this.room.localParticipant.videoTrackPublications
      .values()
      .next().value;
    if (!videoPublication?.track) return null;

    const videoElement = document.createElement("video");
    videoPublication.track.attach(videoElement);
    videoElement.muted = true; // Mute local video to prevent feedback
    videoElement.autoplay = true;
    videoElement.playsInline = true;

    return videoElement;
  }
}

// Export a singleton instance
const liveKitApi = new LiveKitApi();
export default liveKitApi;
