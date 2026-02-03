import api from "@/lib/api";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/auth/me");
  return response.data;
};
