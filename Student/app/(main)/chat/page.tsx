"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MOCK_CONTACTS, MOCK_MESSAGES, ChatMessage } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Search, Phone, Video, MoreVertical, Send, Smile, Paperclip, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function ChatPage() {
    // STATE QUAN LI
    const [selectedContact,setSelectedContact] = useState(MOCK_CONTACTS[0])
    //Danh sach tin nhan 
    const [messages,setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES)
    
    //TEXT O NHAP LIEU
    const [inputText,setInputText] = useState("")
    // 4. Ref để tự động cuộn xuống tin nhắn mới nhất
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(MOCK_MESSAGES.length);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        const prevCount = prevCountRef.current;
        if (messages.length > prevCount) {
            scrollToBottom();
        }
        prevCountRef.current = messages.length;
    }, [messages])

    //Gui tin nhan 
    const handleSendMessage = (e:React.FormEvent) =>{ 
        e.preventDefault()
        if(!inputText.trim()) return
        const newMessage: ChatMessage = {
            id: Date.now(),
            senderId:"me",
            text:inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages([...messages,newMessage])
        setInputText("")
        // Giả lập người kia trả lời sau 1 giây
        setTimeout(() => {
            const reply: ChatMessage = {
                id: Date.now() + 1,
                senderId: selectedContact.id,
                text: "Đây là tin nhắn trả lời tự động ạ ^^",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    }
    return (
        <div className="flex h-full min-h-full w-full bg-white dark:bg-slate-950 border-t dark:border-slate-800">
          
          {/* --- 1. SIDEBAR TRÁI (DANH SÁCH USER) --- */}
          <div className="w-80 border-r dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
            
            {/* Header Sidebar */}
            <div className="p-4 border-b dark:border-slate-800">
                <Link className="text-xl font-bold mb-4" href={"/"}>Back to Home<ArrowLeft className="w-4 h-4" /></Link>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm..." 
                        className="w-full bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>
    
            {/* List Users (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
                {MOCK_CONTACTS.map(contact => (
                    <div 
                        key={contact.id}
                        onClick={() => {
                            setSelectedContact(contact);
                            // Khi đổi người, reset tin nhắn về mặc định (demo)
                            setMessages(MOCK_MESSAGES); 
                        }}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                            selectedContact.id === contact.id ? "bg-purple-50 dark:bg-slate-800 border-l-4 border-purple-600" : ""
                        }`}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden border dark:border-slate-700">
                                 <Image src={contact.avatar} alt={contact.name} width={48} height={48} className="object-cover h-full w-full" />
                            </div>
                            {contact.status === 'online' && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`text-sm font-semibold truncate ${selectedContact.id === contact.id ? 'text-purple-700 dark:text-purple-400' : ''}`}>
                                    {contact.name}
                                </h3>
                                <span className="text-xs text-slate-500">{contact.time}</span>
                            </div>
                            <p className={`text-xs truncate ${contact.unread > 0 ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                                {contact.lastMessage}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
    
          {/* --- 2. KHUNG CHAT CHÍNH (BÊN PHẢI) --- */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
            
            {/* Chat Header */}
            <div className="h-16 border-b dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-950 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border relative">
                        <Image src={selectedContact.avatar} alt="Active" fill className="object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{selectedContact.name}</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            ● Đang hoạt động
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-400"><Phone className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400"><Video className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400"><MoreVertical className="w-5 h-5" /></Button>
                </div>
            </div>
    
            {/* Chat Messages Area (Cuộn ở đây) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-black/20 space-y-6">
                <div className="text-center text-xs text-slate-400 my-4">Hôm nay, 10:00 AM</div>
                
                {messages.map((msg) => {
                    const isMe = msg.senderId === 'me';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar nhỏ bên cạnh tin nhắn */}
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border mt-1">
                                        <Image src={selectedContact.avatar} alt="Sender" width={32} height={32} />
                                    </div>
                                )}
                                
                                {/* Bong bóng chat */}
                                <div>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                                        isMe 
                                        ? 'bg-purple-600 text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <span className={`text-[10px] text-slate-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {/* Element ảo để cuộn xuống đáy */}
                <div ref={messagesEndRef} />
            </div>
    
            {/* Chat Input Footer */}
            <div className="p-4 bg-white dark:bg-slate-950 border-t dark:border-slate-800">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end bg-slate-100 dark:bg-slate-900 p-2 rounded-xl">
                    <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-purple-600 rounded-full">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    
                    <textarea 
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 text-sm max-h-32"
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
    
                    <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-yellow-500 rounded-full">
                        <Smile className="w-5 h-5" />
                    </Button>
                    
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!inputText.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
    
          </div>
        </div>
      );
}
