import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
