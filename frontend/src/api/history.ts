import type { ChatLog } from "../types/chatLog";

/**
 * Fetches chat history with a simulated 1-second delay
 * @returns Promise<ChatLog[]> Array of chat logs
 */
export const fetchChatHistory = async (): Promise<ChatLog[]> => {
  // Simulate API call with 1-second timeout
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return dummy data
  const dummyData: ChatLog[] = [
    {
      id: "1",
      title: "Getting Started with React",
      timestamp: new Date("2024-10-04T10:30:00Z"),
    },
    {
      id: "2",
      title: "TypeScript Best Practices",
      timestamp: new Date("2024-10-04T09:15:00Z"),
    },
    {
      id: "3",
      title: "Building Modern Web Apps",
      timestamp: new Date("2024-10-03T16:45:00Z"),
    },
    {
      id: "4",
      title: "State Management Patterns",
      timestamp: new Date("2024-10-03T14:20:00Z"),
    },
    {
      id: "5",
      title: "API Design Guidelines",
      timestamp: new Date("2024-10-02T11:10:00Z"),
    },
  ];

  return dummyData;
};
