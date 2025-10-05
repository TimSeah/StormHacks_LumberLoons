import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  fetchChatHistory,
  fetchConversation,
  updateConversation,
  type CreateConversationPayload,
} from "../api/history";
import type { ChatLog } from "../types/chatLog";

/**
 * TanStack Query hook for fetching chat history
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param userId - Optional user ID filter
 * @param agentId - Optional agent ID filter
 * @returns UseQueryResult containing chat history data, loading state, and error state
 */
export const useHistoryQuery = (
  page = 1,
  limit = 30,
  userId?: string,
  agentId?: string
) => {
  return useQuery<ChatLog[], Error>({
    queryKey: ["chat-history", page, limit, userId, agentId],
    queryFn: () => fetchChatHistory(page, limit, userId, agentId),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};

/**
 * Hook for fetching a specific conversation by ID
 * @param conversationId - The conversation ID
 * @param fetchRemote - Whether to fetch from remote if not found locally
 * @returns UseQueryResult containing conversation data
 */
export const useConversationQuery = (
  conversationId: string,
  fetchRemote = false
) => {
  return useQuery<ChatLog, Error>({
    queryKey: ["conversation", conversationId, fetchRemote],
    queryFn: () => fetchConversation(conversationId, fetchRemote),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Mutation hook for creating a new conversation
 * @returns UseMutationResult for creating conversations
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConversationPayload) =>
      createConversation(payload),
    onSuccess: () => {
      // Invalidate and refetch chat history
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    },
  });
};

/**
 * Mutation hook for updating an existing conversation
 * @returns UseMutationResult for updating conversations
 */
export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      updates,
    }: {
      conversationId: string;
      updates: Partial<CreateConversationPayload>;
    }) => updateConversation(conversationId, updates),
    onSuccess: (data, variables) => {
      // Update the specific conversation in cache
      queryClient.setQueryData(
        ["conversation", variables.conversationId],
        data
      );
      // Invalidate chat history to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    },
  });
};
