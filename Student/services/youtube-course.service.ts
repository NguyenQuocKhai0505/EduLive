import api from "@/lib/axios";
import type { YoutubeCourseResponse } from "@/lib/types/api.types";

export type { YoutubeCourseResponse } from "@/lib/types/api.types";

/**
 * GET /youtube-courses — public, không cần JWT.
 * Admin tạo/sửa qua các route khác; Student chỉ đọc danh sách.
 */
export async function getYoutubeCourses(): Promise<YoutubeCourseResponse[]> {
  const { data } = await api.get<YoutubeCourseResponse[]>("/youtube-courses");
  return Array.isArray(data) ? data : [];
}

/** Giống logic backend: lấy videoId để build thumbnail mặc định từ YouTube. */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** tags lưu DB có thể là "a, b" hoặc JSON array string — parse an toàn. */
export function parseYoutubeTags(tags: string | null): string[] {
  if (!tags?.trim()) return [];
  try {
    const parsed = JSON.parse(tags) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {
    /* không phải JSON */
  }
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
