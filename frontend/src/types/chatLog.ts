export interface ChatLog {
  _id: string;
  conversationId: string;
  agentId: string;
  callSuccessful: boolean;
  messages: any[]; // You may want to define a specific Message interface
  raw?: {
    metadata: {
      topic: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}
