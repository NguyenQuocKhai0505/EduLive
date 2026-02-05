"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getAiChatHistory,
  sendMessage,
  type AiChatMessageItem,
} from "@/services/ai-chat.service";
import { toast } from "sonner";
import {
  Bot,
  Send,
  X,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
} from "lucide-react";

/**
 * Chatbox AI: icon robot cố định góc phải (có hiệu ứng nhảy), click mở panel.
 * Panel: bên trái = sidebar lịch sử (đóng/mở), bên phải = khung chat (tin nhắn + input).
 */
export function AiChatBox() {
  const [open, setOpen] = useState(false);
  /** Đóng/mở sidebar "Lịch sử": true = rộng 140px, false = thu về 0; nút trong header sidebar toggle */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<AiChatMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load lịch sử khi mở panel lần đầu
  useEffect(() => {
    if (!open || historyLoaded) return;
    setHistoryLoaded(true);
    getAiChatHistory()
      .then((res) => setMessages(res.messages ?? []))
      .catch(() => toast.error("Không tải được lịch sử chat"));
  }, [open, historyLoaded]);

  // Scroll xuống tin mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || loading) return;

    setInputText("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, createdAt: new Date().toISOString() },
    ]);
    setLoading(true);

    try {
      const res = await sendMessage(text);
      const reply = res?.reply ?? "";
      if (!reply.trim()) {
        toast.error("Không nhận được phản hồi từ AI");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Gửi tin thất bại";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút robot cố định góc phải - có animation nhảy */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105",
          "bg-primary text-primary-foreground",
          "animate-bounce-soft"
        )}
        aria-label="Mở chat AI"
      >
        <Bot className="h-7 w-7" />
      </button>

      {/* Panel chat - hiện khi open */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-6 right-6 z-50 flex h-[420px] w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-xl border bg-card shadow-xl md:w-[400px] md:h-[480px]"
        >
          {/* Sidebar lịch sử (bên trái) - có thể đóng/mở */}
          <div
            className={cn(
              "flex flex-col border-r bg-muted/30 transition-all duration-200",
              sidebarOpen ? "w-[140px] min-w-[140px]" : "w-0 min-w-0 overflow-hidden"
            )}
          >
            <div className="flex items-center justify-between border-b px-2 py-2">
              <span className="truncate text-xs font-medium text-muted-foreground">
                Lịch sử
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Thu gọn" : "Mở rộng"}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-y-auto p-2">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Chưa có tin nhắn</p>
                ) : (
                  <ul className="space-y-1">
                    {messages.map((m, i) => (
                      <li
                        key={i}
                        className={cn(
                          "flex items-start gap-1 rounded p-1.5 text-xs",
                          m.role === "user"
                            ? "bg-primary/10 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {m.role === "user" ? (
                          <span className="shrink-0">Bạn:</span>
                        ) : (
                          <Bot className="mt-0.5 h-3 w-3 shrink-0" />
                        )}
                        <span className="line-clamp-2 break-words">
                          {m.content}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Khung chat chính (bên phải) */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Header: tiêu đề + nút đóng */}
            <div className="flex items-center justify-between border-b px-3 py-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">Trợ lý học tập</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Đóng chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
                  <MessageSquare className="h-10 w-10" />
                  <p>Chào bạn! Hỏi tôi bất kỳ câu nào về học tập.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Đang trả lời...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Ô nhập + nút gửi */}
            <form
              onSubmit={handleSend}
              className="flex gap-2 border-t p-2"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="min-w-0 flex-1"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
