import mongoose, { Document, Schema } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IMessage {
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  conversationId?: string; // external id from ElevenLabs (optional)
  remoteId?: string; // external id from ElevenLabs (optional)
  userId?: string;
  agentId?: string;
  callSuccessful?: boolean;
  callStart?: Date;
  messages: IMessage[];
  summary?: string;
  raw?: any; // store raw ElevenLabs response if desired
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: { type: String, index: true, sparse: true },
    remoteId: { type: String, index: true, sparse: true },
    userId: { type: String, index: true, sparse: true },
    agentId: { type: String, index: true, sparse: true },
    callSuccessful: { type: Boolean, default: false },
    callStart: { type: Date },
    messages: { type: [MessageSchema], default: [] },
    summary: { type: String },
    raw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);