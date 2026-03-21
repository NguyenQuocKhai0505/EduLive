# Cấu hình Trợ lý AI (Student chat box)

Chọn **một hoặc nhiều** provider trong `.env` (thư mục `Server`).

## `AI_CHAT_PROVIDER`

| Giá trị | Ý nghĩa |
|--------|---------|
| `auto` (mặc định) | Thử Gemini → nếu hết quota thì Groq → nếu không có Groq thì `OPENAI_COMPAT_*` |
| `gemini` | Chỉ Google Gemini |
| `groq` | Chỉ Groq |
| `openai_compat` | Chỉ endpoint tương thích OpenAI (OpenRouter, Together, Ollama, …) |

---

## 1. Google Gemini

```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
```

---

## 2. Groq

```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## 3. OpenAI-compatible (thay thế khi không vào được Groq)

Cùng một định dạng `POST .../chat/completions` như OpenAI.

### OpenRouter (nhiều model, có model free)

1. Đăng ký: https://openrouter.ai  
2. Trong `.env`:



```env
AI_CHAT_PROVIDER=openai_compat
OPENAI_COMPAT_URL=https://openrouter.ai/api/v1/chat/completions
OPENAI_COMPAT_API_KEY=sk-or-v1-...
OPENAI_COMPAT_MODEL=openrouter/free
```

(Tên model free có thể đổi theo trang OpenRouter → Models.)

Tuỳ chọn (OpenRouter khuyến nghị):

```env
OPENAI_COMPAT_HTTP_REFERER=http://localhost:3000
OPENAI_COMPAT_X_TITLE=EduLive
```

### Together.ai

```env
OPENAI_COMPAT_URL=https://api.together.xyz/v1/chat/completions
OPENAI_COMPAT_API_KEY=...
OPENAI_COMPAT_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

### Ollama (máy local)

```env
OPENAI_COMPAT_URL=http://localhost:11434/v1/chat/completions
OPENAI_COMPAT_API_KEY=ollama
OPENAI_COMPAT_MODEL=llama3.2
```

(Key có thể đặt bất kỳ nếu Ollama không bật auth.)

---

Sau khi sửa `.env`, **restart** Nest server.
