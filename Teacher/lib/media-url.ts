/**
 * Chuẩn hoá URL ảnh từ API: đường dẫn tương đối hoặc host localhost (dev)
 * được ghi vào DB sẽ không load được trên Teacher (Vercel) — gắn base API.
 */
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (url == null || String(url).trim() === "") return null;
  const u = String(url).trim();
  const api =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
      : "";

  if (u.startsWith("/")) {
    return api ? `${api}${u}` : u;
  }

  if (
    api &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(u)
  ) {
    return u.replace(/^https?:\/\/[^/]+/i, api);
  }

  return u;
}
