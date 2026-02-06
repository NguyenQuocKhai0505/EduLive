import api from "@/lib/api";

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
};

export type ChatAttachment = {
  url: string;
  name: string;
  type?: string;
};

export type ChatMessage = {
  id: number;
  roomId: number;
  senderId: number;
  senderRole: string;
  content: string;
  createdAt: string;
  attachments?: ChatAttachment[];
  senderName?: string;
  senderAvatar?: string;
};

/** Admin: lấy tất cả phòng chat (giám sát). Cần đăng nhập role admin. */
export const getAllChatRooms = () => api.get<ChatRoom[]>("/chat/rooms/all");

/** Lấy tin nhắn trong phòng (Admin có quyền xem mọi phòng). */
export const getRoomMessages = (roomId: number) =>
  api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
