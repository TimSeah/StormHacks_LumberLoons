import { useQuery } from "@tanstack/react-query";
import { fetchChatHistory } from "../api/history";
import type { ChatLog } from "../types/chatLog";

/**
 * TanStack Query hook for fetching chat history
 * @returns UseQueryResult containing chat history data, loading state, and error state
 */
export const useHistoryQuery = () => {
  return useQuery<ChatLog[], Error>({
    queryKey: ["chat-history"],
    queryFn: fetchChatHistory,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};

/**
 * Hook for getting a specific chat log by ID
 * @param id - The ID of the chat log to find
 * @returns The chat log or undefined if not found
 */
export const useChatLogById = (id: string): ChatLog | undefined => {
  const { data: chatHistory } = useHistoryQuery();

  return chatHistory?.find((chatLog: ChatLog) => chatLog.id === id);
};
