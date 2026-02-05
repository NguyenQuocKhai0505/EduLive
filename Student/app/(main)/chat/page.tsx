"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Smile, Paperclip, ArrowLeft, PanelLeft, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChatAttachment,
  ChatMessage,
  ChatRoom,
  getMyChatRooms,
  getRoomMessages,
  uploadChatAttachment,
} from "@/services/chat.service";
import { getMyProfile } from "@/services/user.service";

export default function ChatPage() {
    const searchParams = useSearchParams();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [search, setSearch] = useState("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
    const [uploading, setUploading] = useState(false);
    /** Đóng/mở sidebar danh sách phòng: true = hiện, false = ẩn; nút PanelLeftClose thu gọn, PanelLeft mở lại */
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasOpenedRoomFromUrlRef = useRef(false);

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null;

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await getMyChatRooms();
                setRooms(res.data);
            } catch {
                toast.error("Failed to load chat rooms");
            }
        };
        fetchRooms();
    }, []);

    // Mở phòng từ URL khi redirect từ trang Join (vd /chat?roomId=5)
    useEffect(() => {
        if (rooms.length === 0 || hasOpenedRoomFromUrlRef.current) return;
        const roomIdParam = searchParams.get("roomId");
        if (!roomIdParam) return;
        const roomId = Number(roomIdParam);
        if (!Number.isFinite(roomId) || !rooms.some((r) => r.id === roomId)) return;
        hasOpenedRoomFromUrlRef.current = true;
        handleSelectRoom(roomId);
    }, [rooms, searchParams]);

    // Lấy user hiện tại (chạy 1 lần khi mount)
    useEffect(() => {
        getMyProfile()
            .then((profile) => setCurrentUserId(profile.id))
            .catch(() => setCurrentUserId(null));
    }, []);

    // Socket: kết nối 1 lần khi mount; lắng nghe "message" và "chatError"; cleanup khi rời trang
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const socket = io(socketUrl, { withCredentials: true });
        socketRef.current = socket;
        socket.on("message", (message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
        });
        socket.on("chatError", (payload: { action: string; message: string }) => {
            toast.error(payload.message);
        });
        return () => {
            socket.disconnect();
        };
    }, []);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [messages]);

    //SELECT ROOM 
    const handleSelectRoom = async (roomId:number) =>{
        setSelectedRoomId(roomId)
        try{
            const res = await getRoomMessages(roomId)
            setMessages(Array.isArray(res.data) ? res.data : [])
        } catch {
            toast.error("Failed to load messages")
            return
        }
        socketRef.current?.emit("joinRoom",{roomId})
    }
    // Gửi tin (có thể kèm ảnh đã upload)
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoomId) return;
        const text = inputText.trim();
        if (!text && !pendingAttachments.length) return;
        socketRef.current?.emit("sendMessage", {
            roomId: selectedRoomId,
            content: text || "",
            attachments: pendingAttachments.length ? pendingAttachments : undefined,
        });
        setInputText("");
        setPendingAttachments([]);
    };

    // Chọn ảnh -> upload lên server -> thêm vào pending, gửi kèm khi bấm Send
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length || !selectedRoomId) return;
        setUploading(true);
        try {
            const results: ChatAttachment[] = [];
            for (let i = 0; i < files.length; i++) {
                const res = await uploadChatAttachment(selectedRoomId, files[i]);
                const data = res.data;
                results.push({ url: data.url, name: data.name, type: data.type });
            }
            setPendingAttachments((prev) => [...prev, ...results]);
        } catch {
            toast.error("Tải ảnh lên thất bại. Chỉ hỗ trợ ảnh (jpg, png, gif, webp), tối đa 5MB.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const removePendingAttachment = (index: number) => {
        setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    //FILTER ROOMS 
    const filteredRooms = useMemo(()=>{
        const keyword = search.trim().toLowerCase()
        if(!keyword) return rooms 
        return rooms.filter((room) => (room.course?.title || `Room #${room.id}`).toLowerCase().includes(keyword))
    },[rooms,search])

    const isMe = (msg:ChatMessage) =>msg.senderId === currentUserId


    return (
        <div className="px-4 pb-8 pt-6 sm:px-6">
          <div className="grid min-h-[70vh] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-950/70 text-gray-900 dark:text-white lg:grid-cols-12">
          <aside className={`border-b border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950/70 lg:border-b-0 lg:border-r ${sidebarOpen ? "block lg:col-span-4" : "hidden"}`}>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white" href={"/"}>
                        <ArrowLeft className="inline-block h-4 w-4" /> Back to Home
                    </Link>
                    <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">My Chats</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">Select a room to chat.</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Thu gọn danh sách phòng"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
            </div>
            <div className="px-4 pb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search a course..."
                        className="border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-slate-900 pl-9 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                    />
                </div>
            </div>
            <div className="max-h-[70vh] space-y-1 overflow-y-auto px-2 pb-4">
                {filteredRooms.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500 dark:text-slate-400">
                        Chưa có phòng. Mua/đăng ký khóa học hoặc dùng link từ giáo viên (Join Chat).
                    </div>
                ) : (
                    filteredRooms.map((room) => (
                        <button
                            key={room.id}
                            type="button"
                            onClick={() => handleSelectRoom(room.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                                selectedRoomId === room.id
                                    ? "bg-gray-200 dark:bg-slate-800/80 text-gray-900 dark:text-white"
                                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-900/70"
                            }`}
                        >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 dark:border-slate-700 bg-gray-200 dark:bg-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-200">
                                {(room.course?.title || "R").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                    {room.course?.title || `Room #${room.id}`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">Room #{room.id}</div>
                            </div>
                        </button>
                    ))
                )}
            </div>
          </aside>

          <section className={`flex min-h-[70vh] flex-col bg-gray-50 dark:bg-slate-950/70 ${sidebarOpen ? "lg:col-span-8" : "lg:col-span-12"}`}>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 px-6 py-4 bg-white dark:bg-slate-950/80">
                <div className="flex items-center gap-3">
                    {!sidebarOpen && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Mở danh sách phòng"
                      >
                        <PanelLeft className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 dark:border-slate-700 bg-gray-200 dark:bg-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-200">
                        {(selectedRoom?.course?.title || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedRoom?.course?.title || "Chọn một phòng"}
                        </div>
                        <div className="text-xs text-emerald-500 dark:text-emerald-400">● Online</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto bg-gray-100/50 dark:bg-slate-950/60 px-6 py-6">
                {!selectedRoomId ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">
                        Chọn một phòng để bắt đầu chat.
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">
                        Chưa có tin nhắn.
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const me = isMe(msg);
                            return (
                                <div key={msg.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[70%] ${me ? "text-right" : ""}`}>
                                        <div
                                            className={`inline-block max-w-full rounded-2xl px-4 py-2 text-sm shadow ${
                                                me
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700"
                                            }`}
                                        >
                                            {msg.content && <p className="break-words">{msg.content}</p>}
                                            {msg.attachments?.length ? (
                                                <div className="mt-2 space-y-2">
                                                    {msg.attachments.map((att, i) =>
                                                        att.type?.startsWith("image/") ? (
                                                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                                                <img src={att.url} alt={att.name} className="max-h-48 rounded-lg object-cover" />
                                                            </a>
                                                        ) : (
                                                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block text-xs underline">
                                                                {att.name}
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                            {me ? "Bạn" : (msg.senderName || "Unknown")} •{" "}
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950/70 px-6 py-4">
                {pendingAttachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {pendingAttachments.map((att, i) => (
                            <div key={i} className="relative inline-block">
                                {att.type?.startsWith("image/") ? (
                                    <img src={att.url} alt={att.name} className="h-16 w-16 rounded object-cover" />
                                ) : (
                                    <span className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-slate-700">{att.name}</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removePendingAttachment(i)}
                                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                                    aria-label="Xóa"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!selectedRoomId || uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                        title="Đính kèm ảnh"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        value={inputText}
                        placeholder="Nhập tin nhắn..."
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={!selectedRoomId}
                        className="border-0 bg-transparent text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60"
                    />
                    <Button type="button" variant="ghost" size="icon" className="text-gray-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-yellow-500">
                        <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!selectedRoomId || (!inputText.trim() && !pendingAttachments.length) || uploading}
                        className="rounded-xl"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
          </section>
        </div>
        </div>
      );
}
