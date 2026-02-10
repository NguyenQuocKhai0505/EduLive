"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, ChevronRight } from "lucide-react";
import {toast} from "sonner";
import { getAllChatRooms,getRoomMessages,getSocket,joinRoom,sendMessage,type ChatRoom,type ChatMessage } from "@/src/services/chat.service";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export default function ChatMonitorPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [rooms,setRooms] = useState<ChatRoom[]>([])
  const [messages,setMessages] = useState<ChatMessage[]>([])
  const [loadingRooms,setLoadingRooms] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText,setInputText] = useState("")

  const selectedRoomIdRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  //Load rooms 
  useEffect(() =>{
    const fetchRooms = async () =>{
      try{
        setLoadingRooms(true)
        const data = await getAllChatRooms()
        setRooms(Array.isArray(data) ? data : [])
      }catch(error){
        console.error("Error fetching rooms:",error)
        toast.error("Lỗi khi tải phòng chat")
      }finally{
        setLoadingRooms(false)
      }
    }
    fetchRooms()
  },[])

  //Update reference after changing selected room
  useEffect(() =>{
    selectedRoomIdRef.current = selectedRoomId
  },[selectedRoomId])
  
  // Load Messages and Join Room when selected room changes
  useEffect(() => {
    if (selectedRoomId === null) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const data = await getRoomMessages(selectedRoomId);
        setMessages(Array.isArray(data) ? data : []);

        // Join room through socket
        joinRoom(selectedRoomId);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Cleanup: Leave room khi đổi phòng hoặc unmount
    return () => {
      // Socket sẽ tự động leave khi disconnect, nhưng có thể thêm logic leave room nếu cần
    };
  }, [selectedRoomId]);

  // Listen for new messages from socket
  useEffect(() => {
    const socket = getSocket();
    
    const handleMessage = (msg: ChatMessage) => {
      // Chỉ thêm message nếu thuộc phòng đang được chọn
      if (msg.roomId !== selectedRoomIdRef.current) return;
      setMessages((prev) => {
        // Tránh duplicate message (kiểm tra nếu đã có message với cùng id)
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []); // Dependency rỗng vì dùng ref để check selectedRoomId

  //Listen error from socket 
  useEffect(()=>{
    const socket = getSocket()
    
    const handleError = (payload:{action:string,message:string}) =>{
      toast.error(payload.message)
    }
    socket.on("chatError", handleError);
    return () => {
      socket.off("chatError", handleError);
    };
  },[])

  //Scroll
  useEffect(() =>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  // Handle send message
  const handleSend = () => {
    if (!inputText.trim() || selectedRoomId === null) {
      toast.error("Vui lòng nhập tin nhắn và chọn phòng chat");
      return;
    }

    try {
      sendMessage(selectedRoomId, inputText.trim());
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Không thể gửi tin nhắn");
    }
  };

  // Cleanup socket khi unmount component
  useEffect(() => {
    return () => {
      // Có thể disconnect socket nếu muốn, nhưng thường giữ kết nối để nhận tin nhắn
      // disconnectSocket();
    };
  }, []);
  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      <div className="w-80 shrink-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> Phòng chat
          </h2>
          <p className="text-xs text-slate-500 mt-1">Chọn phòng để xem và trò chuyện</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
           {loadingRooms ? (
            <div className="px-3 py-4 text-center text-sm text-slate-500">Đang tải phòng...</div>
           ): rooms.length ===0 ?(
            <div className="px-3 py-4 text-center text-sm text-slate-500">Chưa có phòng chat</div>
           ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoomId(room.id)}
                className={`w-full text-left rounded-lg px-3 py-2.5 flex items-center gap-2 transition-colors ${
                  selectedRoomId === room.id
                    ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">
                  {room.course?.title ?? `Phòng #${room.id}`}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ))
           )}
        </div>
      </div>
      <div className="flex-1 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
        {selectedRoomId ? (
          <>
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
              <h3 className="font-medium text-slate-800 dark:text-white">
                {rooms.find((r) => r.id === selectedRoomId)?.course?.title ?? "Phòng chat"}
              </h3>
              <p className="text-xs text-slate-500">Admin có thể xem và gửi tin nhắn</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="py-6 text-center text-sm text-slate-500">Đang tải tin nhắn...</div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg px-3 py-2 max-w-[85%] ${
                        msg.senderRole === "teacher"
                          ? "bg-sky-500/10 text-slate-800 dark:text-slate-200 ml-0"
                          : msg.senderRole === "admin"
                            ? "bg-amber-500/10 text-slate-800 dark:text-slate-200 ml-0 border border-amber-200 dark:border-amber-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mr-0 ml-auto"
                      }`}
                    >
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {msg.senderName} · {msg.senderRole} ·{" "}
                        {typeof msg.createdAt === "string"
                          ? new Date(msg.createdAt).toLocaleString("vi-VN")
                          : msg.createdAt}
                      </p>
                      <p className="text-sm mt-0.5">{msg.content}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex gap-2">
              <Input
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1"
              />
              <Button type="button" onClick={handleSend} disabled={!inputText.trim()}>
                Gửi
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Chọn một phòng chat bên trái để xem nội dung
          </div>
        )}
      </div>
    </div>
  );
}
