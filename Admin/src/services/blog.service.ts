import api from "../../lib/api"

export type BlogAuthor ={
    id:number
    fullName:string 
    avatar?:string | null
}

export type BlogResponse = {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    authorId?: number;
    author?: BlogAuthor;
    images?: string[];
    tag?: string[];
    likesCount: number;
    commentsCount: number;
}

export type CreateBlogRequest = {
    title:string 
    content:string 
    tags?:string[]
}

export const getAllBlogs = () =>
    api.get<BlogResponse[]>("/blogs").then((res) => res.data);

//Create blog 
export const createBlog = (data:CreateBlogRequest,images?:File[]) =>{
    const formData = new FormData()
    formData.append("title",data.title)
    formData.append("content",data.content)
    if(data.tags?.length){
        data.tags.forEach((t) => formData.append("tags",t))
    }
    if(images?.length){
        images.forEach((image) => formData.append("images",image))
    }
    return api.post<BlogResponse>("/blogs",formData,{
        headers:{"Content-Type":"multipart/form-data"}
    }).then((res) => res.data)
}

export type UpdateBlogRequest = Partial<Pick<CreateBlogRequest, "title" | "content" | "tags">>;

export const updateBlog = (id: number, data: UpdateBlogRequest) =>
    api.patch<BlogResponse>(`/blogs/${id}`, data).then((res) => res.data);

//Delete Blog
export const deleteBlog = (id: number) => api.delete(`/blogs/${id}`);

//Create comment
export const createComment = (blogId: number, data: { content: string }) =>
    api.post(`/blogs/${blogId}/comments`, data).then((res) => res.data);