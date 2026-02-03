"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
import {
  ChatAttachment,
  ChatMessage,
  ChatRoom,
  getMyChatRooms,
  getRoomMessages,
  uploadChatAttachment,
} from "../../../services/chat.service";

export default function MyChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRooms = rooms.filter((room) =>
    (room.course?.title || `Room #${room.id}`)
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || null;

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

  const handleSelectRoom = async (roomId: number) => {
    setSelectedRoomId(roomId);
    try {
      const res = await getRoomMessages(roomId);
      setMessages(res.data);
    } catch {
      toast.error("Failed to load messages");
      return;
    }
    socketRef.current?.emit("joinRoom", { roomId });
  };

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRoomId) return;
    const text = input.trim();
    if (!text && !pendingAttachments.length) return;
    socketRef.current?.emit("sendMessage", {
      roomId: selectedRoomId,
      content: text || "",
      attachments: pendingAttachments.length ? pendingAttachments : undefined,
    });
    setInput("");
    setPendingAttachments([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !selectedRoomId) return;
    setUploading(true);
    try {
      const results: ChatAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadChatAttachment(selectedRoomId, files[i]);
        results.push({ url: res.data.url, name: res.data.name, type: res.data.type });
      }
      setPendingAttachments((prev) => [...prev, ...results]);
    } catch {
      toast.error("Upload failed. Images only (jpg, png, gif, webp), max 5MB.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="grid min-h-[70vh] grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 text-white lg:grid-cols-12">
      <aside className="border-b border-white/10 bg-slate-950/70 lg:col-span-4 lg:border-b-0 lg:border-r">
        <div className="p-4">
          <div className="text-lg font-semibold">My Chat</div>
          <div className="text-xs text-slate-400">
            Select a room to chat with students.
          </div>
        </div>
        <div className="px-4 pb-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search a course..."
            className="border-white/10 bg-slate-900 text-sm text-slate-100"
          />
        </div>
        <div className="max-h-[70vh] space-y-1 overflow-y-auto px-2 pb-4">
          {filteredRooms.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-400">
              No chat rooms yet.
            </div>
          ) : (
            filteredRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => handleSelectRoom(room.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  selectedRoomId === room.id
                    ? "bg-slate-800/80 text-white"
                    : "text-slate-300 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold">
                  {(room.course?.title || "C").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">
                    {room.course?.title || `Room #${room.id}`}
                  </div>
                  <div className="text-xs text-slate-400">Room ID: {room.id}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col lg:col-span-8">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold">
              {(selectedRoom?.course?.title || "C").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {selectedRoom?.course?.title || "Select a room"}
              </div>
              <div className="text-xs text-emerald-400">● Online</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-950/60 px-6 py-6">
          {!selectedRoomId ? (
            <div className="text-sm text-slate-400">
              Select a room to start chatting.
            </div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-slate-400">No messages yet.</div>
          ) : (
            messages.map((message) => {
              const isTeacher = message.senderRole === "teacher";
              return (
                <div
                  key={message.id}
                  className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${isTeacher ? "text-right" : ""}`}>
                    <div
                      className={`inline-block max-w-full rounded-2xl px-4 py-2 text-sm shadow ${
                        isTeacher
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-800 text-slate-100"
                      }`}
                    >
                      {message.content && <p className="break-words">{message.content}</p>}
                      {message.attachments?.length ? (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((att, i) =>
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
                    <div className="mt-1 text-xs text-slate-400">
                      {message.senderName || "Unknown"} •{" "}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-white/10 bg-slate-950/70 px-6 py-4">
          {pendingAttachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {pendingAttachments.map((att, i) => (
                <div key={i} className="relative inline-block">
                  {att.type?.startsWith("image/") ? (
                    <img src={att.url} alt={att.name} className="h-16 w-16 rounded object-cover" />
                  ) : (
                    <span className="rounded bg-slate-700 px-2 py-1 text-xs">{att.name}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(i)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-2">
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
              className="text-slate-400 hover:text-indigo-400"
              title="Attach image"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              placeholder="Type a message..."
              onChange={(event) => setInput(event.target.value)}
              disabled={!selectedRoomId}
              className="border-0 bg-transparent text-sm text-slate-100 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              disabled={!selectedRoomId || (!input.trim() && !pendingAttachments.length) || uploading}
              className="rounded-xl"
            >
              Send
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
