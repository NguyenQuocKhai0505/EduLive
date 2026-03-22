# Hướng dẫn deploy EduLive

Dự án gồm **4 phần** độc lập:

| App | Công nghệ | Build | Chạy prod |
|-----|-----------|-------|-----------|
| **Server** | NestJS + TypeORM + PostgreSQL | `npm run build` | `npm run start:prod` |
| **Student** | Next.js 14 | `npm run build` | `npm run start` |
| **Teacher** | Next.js 16 | `npm run build` | `npm run start` |
| **Admin** | Next.js 16 (mặc định port **3003**) | `npm run build` | `npm run start` |

---

## 1. Kiểm tra trước khi deploy

Trên máy local, từng thư mục:

```bash
cd Server && npm ci && npm run build
cd ../Student && npm ci && npm run build
cd ../Teacher && npm ci && npm run build
cd ../Admin && npm ci && npm run build
```

- Nếu build lỗi → sửa trước khi đưa lên host.
- **Teacher**: đã có `@types/js-cookie`; sau khi pull, chạy `npm install` trong `Teacher`.

---

## 2. Thứ tự deploy khuyến nghị

1. **PostgreSQL** (managed DB: Neon, Supabase, Railway Postgres, …)  
2. **Server (API)** — lấy URL public, ví dụ `https://api.yourdomain.com`  
3. **Student / Teacher / Admin** — build static/SSR trên Vercel hoặc tương đương  
4. Cập nhật **biến môi trường** + **CORS** + **OAuth redirect** theo URL thật  

---

## 3. Biến môi trường — Server (`Server/.env` trên host)

**Bắt buộc (tối thiểu):**

| Biến | Ý nghĩa |
|------|--------|
| `NODE_ENV` | Đặt `production` → **tắt `synchronize` TypeORM** (không tự đổi schema DB). |
| `PORT` | Port lắng nghe (Railway/Render thường inject sẵn). |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Kết nối PostgreSQL. |
| `JWT_SECRET` | Secret ký JWT (và các secret refresh/access nếu bạn dùng trong code). |
| `STUDENT_APP_URL` | URL đầy đủ frontend Student, ví dụ `https://student.yourdomain.com` |
| `TEACHER_APP_URL` | URL Teacher |
| `ADMIN_APP_URL` | URL Admin |

**CORS + Socket.IO:** Server chỉ cho phép origin trong `main.ts` và `chat.gateway.ts` từ các biến trên (+ localhost). **Phải khớp chính xác** URL deploy (kể cả `https`, không dấu `/` thừa).

**Tùy chọn theo tính năng:**

- Thanh toán: `STRIPE_*`, `PAYPAL_*` (xem `payment` module).
- Đăng nhập Google/Facebook: `GOOGLE_*`, `FACEBOOK_*` + cập nhật **Authorized redirect URI** trên console OAuth trỏ về API của bạn.
- Upload: Cloudinary (nếu dùng).
- AI chat: xem `Server/docs/AI_CHAT_ENV.md`.

**Lần đầu lên production:** với `NODE_ENV=production`, TypeORM **không** tự tạo/sửa bảng. Bạn cần:

- **DB đã có bảng** (export từ local / chạy app local một lần với DB prod tạm rồi tắt), **hoặc**
- dùng migration TypeORM sau này.

*Nếu DB production đang trống và bạn cần tạo bảng nhanh:* có thể chạy **một lần** Server với biến tạm (ví dụ chỉ local/staging) bật sync — **không** khuyến nghị để sync `true` trên DB prod đang có dữ liệu.

---

## 4. Biến môi trường — Next.js (mỗi app)

Trong **Vercel / Netlify / dashboard host**, thêm:

| Biến | Ví dụ |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` (URL API **không** có `/` cuối) |

- Student dùng trong `lib/axios.ts`, chat socket, auth redirect.  
- Teacher / Admin dùng trong `lib/api.ts`.  

**Socket chat:** Student (và các app khác nếu có) kết nối tới cùng host API — đảm bảo `NEXT_PUBLIC_API_URL` đúng và CORS/Socket origin đã set.

---

## 5. Gợi ý nền tảng

### A. API (Nest) — Railway / Render / Fly.io / VPS

- **Build command:** `npm ci && npm run build`  
- **Start command:** `npm run start:prod`  
- **Root directory:** `Server` (nếu repo monorepo).  
- Gắn biến môi trường + PostgreSQL plugin hoặc external DB.

### B. Frontend Next — Vercel (3 project hoặc 3 folder)

- **Root directory:** `Student` | `Teacher` | `Admin`  
- **Framework preset:** Next.js  
- Build: mặc định `next build`  
- Thêm `NEXT_PUBLIC_API_URL` cho từng project.

**Admin** script `start` dùng port `3003` — trên Vercel không cần quan tâm port; chỉ cần khi tự host Docker/PM2.

### C. Ảnh Next.js (`next/image`)

Nếu dùng domain ảnh mới (CDN riêng), thêm `remotePatterns` / `domains` trong `next.config` của từng app.

---

## 6. Checklist sau deploy

- [ ] `GET https://api.../` (root) trả nội dung hello từ Nest — xác nhận API sống.  
- [ ] Đăng nhập từ Student/Teacher/Admin thành công.  
- [ ] Không lỗi CORS trên console trình duyệt.  
- [ ] Chat realtime (nếu dùng) kết nối được.  
- [ ] Stripe/PayPal webhook URL trỏ đúng API production (nếu bật thanh toán).  

---

## 7. Không có Docker trong repo

Hiện chưa có `Dockerfile`. Nếu cần, có thể bổ sung sau: image Node cho Server + image Node cho từng Next app, hoặc một `docker-compose` với Postgres.

---

*Tài liệu này mô tả đúng cấu hình trong code tại thời điểm tạo; nếu đổi port/CORS, cập nhật `Server/src/main.ts` và `chat.gateway.ts` tương ứng.*
