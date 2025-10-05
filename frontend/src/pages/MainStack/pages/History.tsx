import { MessageCircleDashed } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import ActivityIndicator from "../../../components/ActivityIndicator";
import { useHistoryQuery } from "../../../hooks/history";
import PageWrapper from "../PageWrapper";

const History: React.FC = () => {
  const { data: chatHistory, isLoading } = useHistoryQuery();
  const navigate = useNavigate();

  const handleChatLogClick = (chatLogId: string) => {
    navigate(`/history/${chatLogId}`);
  };

  return (
    <PageWrapper>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <ActivityIndicator />
        </div>
      ) : (
        <div className="py-20">
          <h1 className="text-4xl font-bold mb-7">Your conversations</h1>
          <div className="gap-4 flex flex-col">
            {chatHistory?.map((chatLog) => (
              <div
                key={chatLog.id}
                onClick={() => handleChatLogClick(chatLog.id)}
                className="bg-surface rounded-3xl px-6 py-10 flex flex-row gap-4 items-center cursor-pointer hover:bg-surface/80 transition-colors"
              >
                <MessageCircleDashed />
                <div>
                  <p className="text-lg font-medium">{chatLog.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {chatLog.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default History;
