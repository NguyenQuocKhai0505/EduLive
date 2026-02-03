import api from "../lib/axios";

export interface ChatRoom{
    id:number
    courseId:number
    teacherId:number
    isActive:boolean
    course?:{id:number,title:string}
}

export interface ChatAttachment {
  url: string;
  name: string;
  type?: string;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderRole: string;
  content: string;
  createdAt: string;
  attachments?: ChatAttachment[];
  senderName?: string;
  senderAvatar?: string;
}

export function getMyChatRooms() {
    return api.get<ChatRoom[]>("/chat/rooms/my")
}

export function getRoomMessages(roomId:number){
    return api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`)
}
export function joinByToken(token: string) {
  return api.post<{ roomId: number; courseId: number; courseTitle: string }>("/chat/join", { token });
}

/** Upload ảnh đính kèm (POST multipart). Chỉ ảnh, tối đa 5MB. Trả về AxiosResponse, dùng res.data. */
export function uploadChatAttachment(roomId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<ChatAttachment>(`/chat/rooms/${roomId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}