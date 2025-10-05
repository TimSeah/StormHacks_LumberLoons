import { ArrowLeft, MessageCircle } from "lucide-react";
import React from "react";
import { Link, useNavigate, useParams } from "react-router";
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
              On{" "}
              {new Date(chatLog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-3xl px-6 py-10">
          <div className="flex items-center gap-4 mb-6">
            <MessageCircle />
            <h2 className="text-xl font-semibold">Your conversation</h2>
          </div>

          <div className="space-y-4">
            <div className="mt-6 space-y-4">
              {chatLog.messages
                ?.filter((message) => message.role !== "system")
                .map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : message.role === "system"
                          ? "bg-muted text-muted-foreground text-sm"
                          : "bg-surface-foreground/10"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <Link
          to="/carrie"
          className="py-4 w-full bg-surface rounded-full mt-4 block items-center text-center"
        >
          Follow up with Carrie
        </Link>
      </div>
    </PageWrapper>
  );
};

export default ChatLog;
