import api from "@/lib/api";

export type UserInfo = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export const getAllUsers = () => api.get<UserInfo[]>("/users");

/** Lấy users theo role */
export const getUsersByRole = (role: "student" | "teacher" | "admin") =>
  api.get<UserInfo[]>(`/users?role=${role}`);
