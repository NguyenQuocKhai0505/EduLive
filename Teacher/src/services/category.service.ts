import api from "../lib/api";

export const getCategories = () => api.get("/categories");
export const uploadCategoryImage = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/categories/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
