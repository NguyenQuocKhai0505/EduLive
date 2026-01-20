import api from '@/lib/axios';

export interface BlogResponse {
    id: number;
    title: string;
    content: string; // HTML
    tag: string[]; // Note: Entity dùng "tag" không phải "tags"
    images?: string[]; // Cloudinary URLs
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

export interface CreateBlogRequest{
    title:string
    content:string
    tags?:string[]
    images?: File[] // Files từ input để upload
}
export interface CommentResponse {
    id: number;
    content: string;
    images?: string[]; // Cloudinary URLs - nhiều ảnh cho comment
    blogId: number;
    userId: number;
    parentId: number | null;
    createdAt: string;
    updateAt: string;
    user: {
        id: number;
        fullName: string;
        avatar: string;
    };
    replies?: CommentResponse[]; // Nested comments
}

export interface CreateCommentRequest {
    content: string;
    parentId?: number; // Optional: ID của comment cha (nếu là reply)
    images?: File[]; // Files từ input để upload (nhiều ảnh)
}

//GET ALL BLOGS
export const getAllBlogs = async (): Promise<BlogResponse[]> => {
    try {
        const response = await api.get('/blogs');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
        throw error;
    }
};
//GET BLOG DETAILS BY ID 
export const getBlogById = async(blogId:number):Promise<BlogResponse> =>{
    try{
        const response = await api.get(`/blogs/${blogId}`);
        return response.data;
    }catch(error:any){
        console.error('Error fetching blog by id:', error);
        throw error;
    }
}
// //GET BLOGS BY AUTHOR
// export const getBlogsByAuthor = async (
//     authorId: number
// ): Promise<BlogResponse[]> => {
//     try {
//         const response = await api.get(`/blogs/author/${authorId}`);
//         return response.data;
//     } catch (error: any) {
//         console.error('Error fetching blogs by author:', error);
//         throw error;
//     }
// };
//CREATE BLOG
export const createBlog = async (
    data: CreateBlogRequest
): Promise<BlogResponse> => {
    try {
        const formData = new FormData();
        
        formData.append('title', data.title);
        formData.append('content', data.content);
        
        if (data.tags && data.tags.length > 0) {
            formData.append('tags', JSON.stringify(data.tags));
        }
        
        // Append images files
        if (data.images && data.images.length > 0) {
            data.images.forEach((file) => {
                formData.append('images', file);
            });
        }
        
        const response = await api.post('/blogs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error creating blog:', error);
        throw error;
    }
};
//UPDATE BLOG
export const updateBlog = async (
    blogId: number,
    data: Partial<CreateBlogRequest>
): Promise<BlogResponse> => {
    try {
        const requestData: any = {};
        if (data.title) requestData.title = data.title;
        if (data.content) requestData.content = data.content;
        if (data.tags) requestData.tag = data.tags;
        
        const response = await api.patch(`/blogs/${blogId}`, requestData);
        return response.data;
    } catch (error: any) {
        console.error('Error updating blog:', error);
        throw error;
    }
};
//DELETE BLOG
export const deleteBlog = async(blogId:number):Promise<void> =>{
    try{
        await api.delete(`/blogs/${blogId}`);
    }catch(error:any){
        console.error('Error deleting blog:', error);
        throw error;
    }
}
//TOGGLE LIKE FOR BLOG
export const toggleLike = async(blogId:number):Promise<{ liked: boolean; likesCount: number }> =>{
    try{
        const response = await api.post(`/blogs/${blogId}/like`);
        return response.data; 
    }catch(error:any){
        console.error('Error toggling like:', error);
        throw error;
    }
}
//CHECK USER LIKED 
export const checkUserLiked = async(blogId:number):Promise<{ liked: boolean }> =>{
    try{
        const response = await api.get(`/blogs/${blogId}/liked`);
        return response.data;
    }catch(error:any){
        console.error('Error checking user liked:', error);
        throw error;
    }
}
//CREATE COMMENT FOR BLOG
export const createComment = async(blogId:number,data:CreateCommentRequest):Promise<CommentResponse> =>{
    try{
        const formData = new FormData();
        
        formData.append('content', data.content);
        
        if (data.parentId) {
            formData.append('parentId', data.parentId.toString());
        }
        
        // Append images files (nhiều ảnh)
        if (data.images && data.images.length > 0) {
            data.images.forEach((file) => {
                formData.append('images', file);
            });
        }
        
        const response = await api.post(`/blogs/${blogId}/comments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }catch(error:any){
        console.error('Error creating comment:', error);
        throw error;
    }
}
//GET ALL COMMENTS FOR BLOG
export const getComments = async(blogId:number):Promise<CommentResponse[]> =>{
    try{
        const response = await api.get(`/blogs/${blogId}/comments`);
        return response.data;
    }catch(error:any){
        console.error('Error fetching comments:', error);
        throw error;
    }
}

//GET BLOGS BY AUTHOR
export const getBlogsByAuthor = async(authorId:number):Promise<BlogResponse[]> =>{
    try{
        const response = await api.get(`/blogs/author/${authorId}`);
        return response.data;
    }catch(error:any){
        console.error('Error fetching blogs by author:', error);
        throw error;
    }
}   