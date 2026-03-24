"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Link2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinByToken } from "@/services/chat.service";

/**
 * Lấy token từ chuỗi user nhập:
 * - Dán full link (vd: http://localhost:3000/chat/join?token=abc123) → trích token từ query
 * - Chỉ dán token → dùng luôn chuỗi đã trim
 */
function parseTokenFromInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("token=")) {
      const url = new URL(
        trimmed.startsWith("http") ? trimmed : `https://x?${trimmed.split("?")[1] || trimmed}`
      );
      return url.searchParams.get("token") || trimmed;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

export default function JoinChatPage() {
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const [joining, setJoining] = useState(false);
  const [banner, setBanner] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Prefill token từ URL khi student mở link từ giáo viên (vd: /chat/join?token=xxx)
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) setInputValue(tokenFromUrl);
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = parseTokenFromInput(inputValue);
    if (!token) {
      setBanner({ type: "error", text: "Vui lòng dán link tham gia hoặc token vào ô bên dưới." });
      return;
    }
    setJoining(true);
    try {
      const res = await joinByToken(token);
      const data = res.data as { roomId?: number; courseTitle?: string };
      setBanner({ type: "success", text: "Tham gia phòng chat thành công, đang chuyển trang..." });
      // Redirect sang My Chats và mở luôn phòng vừa join (nếu backend trả roomId)
      const roomId = data?.roomId;
      window.location.href = roomId != null ? `/chat?roomId=${roomId}` : "/chat";
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setBanner({ type: "error", text: msg || "Không thể tham gia. Kiểm tra link/token hoặc đăng nhập." });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6">
      <div className="mx-auto max-w-lg space-y-6">
        {banner && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              banner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {banner.text}
          </div>
        )}
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Phòng chat của tôi
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tham gia chat</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Dán link tham gia phòng chat từ giáo viên hoặc nhập token vào ô dưới.
          </p>
        </div>

        <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <Link2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Tham gia phòng chat
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-slate-400">
              Giáo viên gửi link dạng: .../chat/join?token=... — bạn có thể dán nguyên link hoặc chỉ phần token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="join-input" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Link hoặc token
                </label>
                <Input
                  id="join-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Dán link tham gia hoặc token..."
                  className="border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  disabled={joining}
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={joining || !inputValue.trim()}
              >
                {joining ? "Đang tham gia..." : "Tham gia chat"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
