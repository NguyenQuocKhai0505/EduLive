import api from "../lib/axios";

export interface ChatRoom{
    id:number
    courseId:number
    teacherId:number
    isActive:boolean
    course?:{id:number,title:string}
}

export interface ChatMessage{
    id:number
    roomId:number 
    senderId:number 
    senderRole:string
    content:string
    createdAt:string
    senderName?:string
    senderAvatar?:string
}

export function getMyChatRooms(){
    return api.get<ChatRoom[]>("/chat/rooms/my")
}

export function getRoomMessages(roomId:number){
    return api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`)
}
export function joinByToken(token:string){
    return api.post<{roomId:number,courseId:number,courseTitle:string}>("/chat/join",{token})
}