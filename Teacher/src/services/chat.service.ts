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

export const getMyChatRooms = () => api.get("/chat/rooms/my");

export const createChatRoom = (courseId: number) =>
  api.post("/chat/rooms", { courseId });

export const getRoomMessages = (roomId: number) =>
  api.get(`/chat/rooms/${roomId}/messages`);

/** Upload ảnh đính kèm (POST multipart). Chỉ ảnh, tối đa 5MB. */
export const uploadChatAttachment = (roomId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<ChatAttachment>(`/chat/rooms/${roomId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};