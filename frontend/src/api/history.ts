import type { ChatLog } from "../types/chatLog";
import ApiClient from "./client";

export interface ConversationResponse {
  success: boolean;
  data: any;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateConversationPayload {
  conversationId?: string;
  userId?: string;
  agentId?: string;
  callSuccessful?: boolean;
  callStart?: string;
  messages: Array<{
    role: string;
    text: string;
    timestamp?: string;
  }>;
  summary?: string;
  raw?: any;
}

/**
 * Fetches chat history from the backend
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param userId - Optional user ID filter
 * @param agentId - Optional agent ID filter
 * @returns Promise<ChatLog[]> Array of chat logs
 */
export const fetchChatHistory = async (
  page = 1,
  limit = 30,
  userId?: string,
  agentId?: string
): Promise<ChatLog[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (userId) params.append("user_id", userId);
  if (agentId) params.append("agent_id", agentId);

  const response = await ApiClient.get(`/chat-history?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch chat history");
  }

  const result: ConversationResponse = await response.json();

  console.log("Fetched chat history:", result.data);
  return result.data;
};

/**
 * Fetches a specific conversation by ID
 * @param conversationId - The conversation ID
 * @param fetchRemote - Whether to fetch from remote if not found locally
 * @returns Promise<ChatLog> The conversation data
 */
export const fetchConversation = async (
  conversationId: string,
  fetchRemote = false
): Promise<ChatLog> => {
  const params = fetchRemote ? "?fetch_remote=true" : "";
  const response = await ApiClient.get(
    `/chat-history/${conversationId}${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }

  const result: ConversationResponse = await response.json();
  return result.data;
};

/**
 * Creates a new conversation
 * @param payload - The conversation data
 * @returns Promise<ChatLog> The created conversation
 */
export const createConversation = async (
  payload: CreateConversationPayload
): Promise<ChatLog> => {
  const response = await ApiClient.post("/chat-history", payload);

  if (!response.ok) {
    throw new Error("Failed to create conversation");
  }

  const result: ConversationResponse = await response.json();
  return result.data;
};

/**
 * Updates an existing conversation
 * @param conversationId - The conversation ID
 * @param updates - Partial updates to apply
 * @returns Promise<ChatLog> The updated conversation
 */
export const updateConversation = async (
  conversationId: string,
  updates: Partial<CreateConversationPayload>
): Promise<ChatLog> => {
  const response = await ApiClient.put(
    `/chat-history/${conversationId}`,
    updates
  );

  if (!response.ok) {
    throw new Error("Failed to update conversation");
  }

  const result: ConversationResponse = await response.json();
  return result.data;
};
