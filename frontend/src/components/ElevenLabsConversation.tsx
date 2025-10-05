import { useConversation } from "@elevenlabs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Panda } from "lucide-react";
import { useCallback, useState } from "react";
import ElevenLabsApi from "../api/elevenlabs";

interface ConversationMessage {
  id: string;
  type: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
}

export interface ElevenLabsConversationProps {
  onError?: (error: Error) => void;
  onMessage?: (message: ConversationMessage) => void;
  className?: string;
  micMuted?: boolean;
  onMicMutedChange?: (muted: boolean) => void;
}

export default function ElevenLabsConversation({
  onError,
  onMessage,
  className = "",
  micMuted = false,
  onMicMutedChange,
}: ElevenLabsConversationProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [textInput, setTextInput] = useState("");

  const conversation = useConversation({
    micMuted,
    onConnect: () => {
      const systemMessage: ConversationMessage = {
        id: `system-${Date.now()}`,
        type: "system",
        content: "Connected to ElevenLabs agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, systemMessage]);
      onMessage?.(systemMessage);
    },

    onDisconnect: () => {
      const systemMessage: ConversationMessage = {
        id: `system-${Date.now()}`,
        type: "system",
        content: "Disconnected from ElevenLabs agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, systemMessage]);
      onMessage?.(systemMessage);
    },

    onMessage: (message) => {
      const messageType = message.source === "user" ? "user" : "agent";
      const conversationMessage: ConversationMessage = {
        id: `${messageType}-${Date.now()}-${Math.random()}`,
        type: messageType,
        content: message.message || "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, conversationMessage]);
      onMessage?.(conversationMessage);
    },

    onError: (errorEvent) => {
      const errorObj =
        typeof errorEvent === "string"
          ? new Error(errorEvent)
          : (errorEvent as Error);
      onError?.(errorObj);
    },
  });

  const handleStartConversation = useCallback(async () => {
    if (conversation.status === "connected") return;

    try {
      const conversationToken = await ElevenLabsApi.getConversationToken();
      await conversation.startSession({
        conversationToken,
        connectionType: "webrtc",
      });
    } catch (error: any) {
      onError?.(error);
    }
  }, [conversation, onError]);

  const handleEndConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setMessages([]);
    } catch (error: any) {
      onError?.(error);
    }
  }, [conversation, onError]);

  const handleSendMessage = useCallback(async () => {
    if (!textInput.trim() || conversation.status !== "connected") return;

    try {
      conversation.sendUserMessage(textInput);

      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: textInput,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      onMessage?.(userMessage);
      setTextInput("");
    } catch (error: any) {
      onError?.(error);
    }
  }, [textInput, conversation, onMessage, onError]);

  const isConnected = conversation.status === "connected";
  const isListening = conversation.isSpeaking === false && isConnected;
  const lastUserMessage = messages
    .filter((m) => m.type === "user")
    .slice(-1)[0];

  return (
    <div className={`flex flex-col h-full relative ${className}`}>
      {!isConnected && (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={handleStartConversation}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Start Chat
          </button>
        </div>
      )}

      {/* Last User Message - Top Center */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <AnimatePresence mode="wait">
          {lastUserMessage && (
            <motion.div
              key={lastUserMessage.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-md text-center shadow-lg"
            >
              {lastUserMessage.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Main Center Text */}
        <div className="flex flex-col items-center justify-center">
          <Panda size={64} className="mb-4" />
          <h1 className="text-4xl font-medium text-gray-800">
            {isListening ? "Carrie is listening" : "Carrie"}
          </h1>
        </div>
      </div>

      {/* Bottom Controls - Always Visible */}
      <div className="px-8 py-4 mx-8 mb-24 border-t flex space-x-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!textInput.trim() || !isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
        {isConnected && (
          <button
            onClick={handleEndConversation}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            End
          </button>
        )}
      </div>
    </div>
  );
}
