export interface ChatMessage {
  role: "user" | "agent" | "system";
  text: string;
  timestamp: string;
}

export interface ChatLog {
  _id: string;
  conversationId: string;
  agentId: string;
  callSuccessful: boolean;
  messages: ChatMessage[];
  raw?: {
    metadata: {
      topic: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}
