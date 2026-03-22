import api from "@/lib/api";

export interface BlogResponse {
  id: number;
  title: string;
  content: string;
  tag: string[];
  images?: string[];
  likesCount: number;
  commentsCount: number;
  isPublished: boolean;
  isActive: boolean;
  authorId: number;
  createdAt: string;
  updateAt: string;
  author: {
    id: number;
    fullName: string;
    avatar: string;
    bio: string;
    role: string;
  };
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  tags?: string[];
  images?: File[];
}

export interface CommentResponse {
  id: number;
  content: string;
  images?: string[];
  blogId: number;
  userId: number;
  parentId: number | null;
  createdAt: string;
  updateAt: string;
  user: { id: number; fullName: string; avatar: string };
  replies?: CommentResponse[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number;
  images?: File[];
}

export const getAllBlogs = async (): Promise<BlogResponse[]> => {
  const response = await api.get("/blogs");
  return response.data;
};

export const getBlogById = async (blogId: number): Promise<BlogResponse> => {
  const response = await api.get(`/blogs/${blogId}`);
  return response.data;
};

export const createBlog = async (data: CreateBlogRequest): Promise<BlogResponse> => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  if (data.tags?.length) formData.append("tags", JSON.stringify(data.tags));
  if (data.images?.length) data.images.forEach((file) => formData.append("images", file));
  const response = await api.post("/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteBlog = async (blogId: number): Promise<void> => {
  await api.delete(`/blogs/${blogId}`);
};

export const updateBlog = async (
  blogId: number,
  data: Partial<Pick<CreateBlogRequest, "title" | "content" | "tags">>
): Promise<BlogResponse> => {
  const body: Record<string, unknown> = {};
  if (data.title !== undefined) body.title = data.title;
  if (data.content !== undefined) body.content = data.content;
  if (data.tags !== undefined) body.tags = data.tags;
  const response = await api.patch<BlogResponse>(`/blogs/${blogId}`, body);
  return response.data;
};

export const toggleLike = async (
  blogId: number
): Promise<{ liked: boolean; likesCount: number }> => {
  const response = await api.post(`/blogs/${blogId}/like`);
  return response.data;
};

export const checkUserLiked = async (blogId: number): Promise<{ liked: boolean }> => {
  const response = await api.get(`/blogs/${blogId}/liked`);
  return response.data;
};

export const createComment = async (
  blogId: number,
  data: CreateCommentRequest
): Promise<CommentResponse> => {
  const formData = new FormData();
  formData.append("content", data.content);
  if (data.parentId) formData.append("parentId", String(data.parentId));
  if (data.images?.length) data.images.forEach((file) => formData.append("images", file));
  const response = await api.post(`/blogs/${blogId}/comments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getComments = async (blogId: number): Promise<CommentResponse[]> => {
  const response = await api.get(`/blogs/${blogId}/comments`);
  return response.data;
};
