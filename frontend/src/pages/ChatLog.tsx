import { ArrowLeft, MessageCircle } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router";
import ActivityIndicator from "../components/ActivityIndicator";
import { useConversationQuery } from "../hooks/history";
import PageWrapper from "./MainStack/PageWrapper";

const ChatLog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chatLog, isLoading } = useConversationQuery(id || "", false);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <ActivityIndicator />
        </div>
      </PageWrapper>
    );
  }

  if (!chatLog) {
    return (
      <PageWrapper>
        <div className="py-20">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/history")}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-4xl font-bold">Chat Not Found</h1>
          </div>
          <div className="bg-surface rounded-3xl px-6 py-10 text-center">
            <MessageCircle
              className="mx-auto mb-4 text-muted-foreground"
              size={48}
            />
            <p className="text-lg text-muted-foreground">
              The requested chat log could not be found.
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="py-20">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/history")}
            className="p-2 hover:bg-surface rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold">
              {chatLog.raw?.metadata.topic}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {chatLog.createdAt.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-3xl px-6 py-10">
          <div className="flex items-center gap-4 mb-6">
            <MessageCircle />
            <h2 className="text-xl font-semibold">Conversation Details</h2>
          </div>

          {/* Placeholder for actual chat messages - you can extend this based on your chat data structure */}
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <p>Chat ID: {chatLog._id}</p>
              <p>Started: {chatLog.createdAt.toLocaleString()}</p>
            </div>

            {/* Add your actual chat messages here when you have the data structure */}
            <div className="mt-6 p-4 bg-background rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">
                Chat messages will be displayed here when the full chat data
                structure is available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ChatLog;
