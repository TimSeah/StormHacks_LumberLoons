import ApiClient from "./client";

export interface ElevenLabsResponse {
  success: boolean;
  error?: string;
}

export interface SignedUrlResponse extends ElevenLabsResponse {
  signedUrl?: string;
}

export interface ConversationTokenResponse extends ElevenLabsResponse {
  conversationToken?: string;
}

export interface ApiKeyResponse extends ElevenLabsResponse {
  apiKey?: string;
}

class ElevenLabsApi {
  /**
   * Get ElevenLabs API key for client-side usage
   * Note: This should only be used if you need the raw API key on the client
   * For security, prefer using signed URLs and tokens instead
   */
  static async getApiKey(): Promise<string> {
    const response = await ApiClient.get("/11/key");

    if (!response.ok) {
      throw new Error("Failed to get ElevenLabs API key");
    }

    const data: ApiKeyResponse = await response.json();

    if (!data.success || !data.apiKey) {
      throw new Error(data.error || "Failed to get ElevenLabs API key");
    }

    return data.apiKey;
  }

  /**
   * Get signed URL for WebSocket connection to ElevenLabs Conversational AI
   * This is the secure way to connect to ElevenLabs WebSocket API
   */
  static async getSignedUrl(): Promise<string> {
    const response = await ApiClient.get("/11/signed-url");

    if (!response.ok) {
      throw new Error("Failed to get signed URL");
    }

    const data: SignedUrlResponse = await response.json();

    if (!data.success || !data.signedUrl) {
      throw new Error(data.error || "Failed to get signed URL");
    }

    return data.signedUrl;
  }

  /**
   * Get conversation token for WebRTC connection to ElevenLabs Conversational AI
   * This is the secure way to connect to ElevenLabs WebRTC API
   */
  static async getConversationToken(): Promise<string> {
    const response = await ApiClient.get("/11/conversation-token");

    if (!response.ok) {
      throw new Error("Failed to get conversation token");
    }

    const data: ConversationTokenResponse = await response.json();

    if (!data.success || !data.conversationToken) {
      throw new Error(data.error || "Failed to get conversation token");
    }

    return data.conversationToken;
  }
}

export default ElevenLabsApi;
