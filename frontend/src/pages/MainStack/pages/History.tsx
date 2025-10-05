import { ChatsTeardropIcon } from "@phosphor-icons/react";
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
          <div className="gap-4 flex flex-col lg:grid lg:grid-cols-2 lg:gap-6">
            {chatHistory?.map((chatLog) => (
              <div
                key={chatLog._id}
                onClick={() => handleChatLogClick(chatLog._id)}
                className="bg-surface rounded-3xl px-6 py-10 flex flex-row gap-4 items-center cursor-pointer hover:bg-surface/80 transition-colors"
              >
                <ChatsTeardropIcon size={24} />
                <div>
                  <p className="text-lg font-medium">
                    {chatLog.raw?.metadata.topic}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(chatLog.createdAt).toLocaleString()}
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
