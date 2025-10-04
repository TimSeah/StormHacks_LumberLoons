import React from "react";
import ActivityIndicator from "../components/ActivityIndicator";
import PageWrapper from "../components/PageWrapper";
import { useHistoryQuery } from "../hooks/history";

const History: React.FC = () => {
  const { data: chatHistory, isLoading } = useHistoryQuery();

  return (
    <PageWrapper>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <ActivityIndicator />
        </div>
      ) : (
        <div className="py-20">
          <h1 className="text-4xl font-bold mb-4">Your conversations</h1>
          {chatHistory?.map((chatLog) => (
            <div key={chatLog.id} className="border-b border-muted py-2">
              <h2 className="text-lg font-semibold">{chatLog.title}</h2>
              <p className="text-sm text-muted-foreground">
                {chatLog.timestamp.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default History;
