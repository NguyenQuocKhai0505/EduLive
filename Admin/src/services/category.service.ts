import api from "../../lib/api"

export type CategoryResponse = {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    icon?: string | null;
    image?: string | null;
    color?: string | null;
    isActive: boolean;
    courseCount: number;
    createdAt: string;
    updatedAt: string;
};

export type CreateCategoryRequest = {
    name: string;
    slug?: string;
    description?: string;
    icon?: string | null;
    image?: string | null;
    color?: string | null;
    isActive?: boolean;
};

// Get all categories (includeInactive=true for admin to see all)
export const getAllCategories = (includeInactive?: boolean) =>
    api
        .get<CategoryResponse[]>("/categories", {
            params: includeInactive ? { includeInactive: "true" } : undefined,
        })
        .then((res) => res.data);

// Create a new category
export const createCategory = (data: CreateCategoryRequest) =>
    api.post<CategoryResponse>("/categories", data).then((res) => res.data);

// Update a category (including toggle isActive)
export const updateCategory = (id: number, data: Partial<CreateCategoryRequest>) =>
    api.patch<CategoryResponse>(`/categories/${id}`, data).then((res) => res.data);

// Delete a category
export const deleteCategory = (id: number) =>
    api.delete(`/categories/${id}`);

// Upload image file → Cloudinary, save secure_url to category.image
export const uploadCategoryImage = (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
        .post<{ image: string; category: CategoryResponse }>(`/categories/${id}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
};

// Upload icon file → Cloudinary, save secure_url to category.icon
export const uploadCategoryIcon = (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
        .post<{ icon: string; category: CategoryResponse }>(`/categories/${id}/icon`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
};