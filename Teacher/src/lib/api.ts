import axios from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true, // Gửi/nhận cookie (accessToken) — Server chạy port 3001
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;

    // Không thử refresh khi request là login/register (chưa có token) — tránh toast "No refresh token"
    const isAuthRequest =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register");
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !isAuthRequest
    ) {
      original._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(original);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;