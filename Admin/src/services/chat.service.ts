import api from "@/lib/api";
import { io, type Socket } from "socket.io-client";

const CHAT_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

/** Admin: lấy tất cả phòng chat (giám sát). Trả về data (mảng rooms). */
export const getAllChatRooms = () =>
  api.get<ChatRoom[]>("/chat/rooms/all").then((res) => res.data);

/** Lấy tin nhắn trong phòng. Trả về data (mảng messages). */
export const getRoomMessages = (roomId: number) =>
  api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`).then((res) => res.data);

let socket: Socket | null = null;

/** Lấy hoặc tạo Socket client (withCredentials để gửi cookie accessToken). */
export function getSocket(): Socket {
  if (socket?.connected) return socket;
  socket = io(CHAT_SERVER, { withCredentials: true });
  return socket;
}

/** Emit joinRoom để server add client vào phòng (cần trước khi gửi/nhận tin). */
export function joinRoom(roomId: number): void {
  getSocket().emit("joinRoom", { roomId });
}

/** Gửi tin nhắn qua Socket (server lưu DB rồi emit "message" cho cả phòng). */
export function sendMessage(roomId: number, content: string): void {
  getSocket().emit("sendMessage", { roomId, content });
}

/** Ngắt kết nối Socket (có thể gọi khi logout / rời trang chat). */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
