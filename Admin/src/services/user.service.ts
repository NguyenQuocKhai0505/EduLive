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

/** Toggle trạng thái active của user (CHỈ ADMIN) */
export const toggleUserActiveStatus = (userId: number) =>
  api.patch(`/users/${userId}/toggle-active`);

//Create new user 
export const createNewUser = (data:{fullName:string,email:string,password:string,role:string}) => api.post("/users/create",data)