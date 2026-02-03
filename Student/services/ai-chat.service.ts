import api from '../lib/axios'

export interface AiChatMessageItem{
    role:string
    content:string
    createdAt:string
}
export type AiChatHistoryRes ={
    conversationId:number 
    messages: AiChatMessageItem[]
}

export type sendMessageRes ={
  reply:string
  conversationId:number 
}
export async function getAiChatHistory(): Promise<AiChatHistoryRes> {
  const { data } = await api.get<AiChatHistoryRes>('/ai-chat/history')
  return data
}

export async function sendMessage(message:string):Promise<sendMessageRes>{
    const {data} = await api.post<sendMessageRes>('/ai-chat/message',{message})
    return data
}