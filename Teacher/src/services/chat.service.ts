import api from "../lib/api";

export type ChatRoom = {
  id: number;
  courseId: number;
  teacherId: number;
  joinToken: string;
  joinTokenExpiresAt: string | null;
  isActive: boolean;
  course?: {
    id: number;
    title: string;
  };
  joinUrl?: string;
};

export type ChatMessage = {
  id: number;
  roomId: number;
  senderId: number;
  senderRole: string;
  content: string;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
};

export const getMyChatRooms = () => api.get("/chat/rooms/my");

export const createChatRoom = (courseId: number) =>
  api.post("/chat/rooms", { courseId });

export const getRoomMessages = (roomId: number) =>
  api.get(`/chat/rooms/${roomId}/messages`);