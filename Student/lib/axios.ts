import axios from 'axios';
import Cookies from 'js-cookie';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // Quan trọng: Cho phép gửi và nhận Cookie
});

// Gửi token trong header vì cookie (set bởi js-cookie trên 3000) không được gửi sang API (3001) do khác origin
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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