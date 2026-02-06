"use client";

import { useState } from "react";
import { MessageCircle, ChevronRight } from "lucide-react";

type Room = {
  id: number;
  courseTitle: string;
  teacherId: number;
};

type Message = {
  id: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
};

const mockRooms: Room[] = [
  { id: 1, courseTitle: "Khóa học A", teacherId: 1 },
  { id: 2, courseTitle: "Khóa học B", teacherId: 2 },
];

const mockMessages: Message[] = [
  { id: 1, senderName: "GV A", senderRole: "teacher", content: "Chào cả lớp.", createdAt: "10:00" },
  { id: 2, senderName: "Học sinh 1", senderRole: "student", content: "Dạ em chào thầy ạ.", createdAt: "10:01" },
];

export default function ChatMonitorPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages] = useState<Message[]>(mockMessages);

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      <div className="w-80 shrink-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> Phòng chat
          </h2>
          <p className="text-xs text-slate-500 mt-1">Chọn phòng để xem (UI mẫu)</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {mockRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedRoomId(room.id)}
              className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                selectedRoomId === room.id
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span className="truncate font-medium">{room.courseTitle}</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
        {selectedRoomId ? (
          <>
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
              <h3 className="font-medium text-slate-800 dark:text-white">
                {mockRooms.find((r) => r.id === selectedRoomId)?.courseTitle ?? "Phòng chat"}
              </h3>
              <p className="text-xs text-slate-500">Chỉ xem — không gửi tin (Admin)</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg px-3 py-2 max-w-[85%] ${
                    msg.senderRole === "teacher"
                      ? "bg-sky-500/10 text-slate-800 dark:text-slate-200 ml-0"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mr-0 ml-auto"
                  }`}
                >
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {msg.senderName} · {msg.senderRole} · {msg.createdAt}
                  </p>
                  <p className="text-sm mt-0.5">{msg.content}</p>
                </div>
              ))}
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
