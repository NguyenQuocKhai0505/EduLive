import api from "../lib/api";

export const getMyCourses = () => api.get("/courses/my/list");
export const getCourseById = (id: number) => api.get(`/courses/${id}`);
export const createCourse = (data: any) => api.post("/courses", data);
export const updateCourse = (id: number, data: any) =>
  api.patch(`/courses/${id}`, data);
export const togglePublish = (id: number) =>
  api.patch(`/courses/${id}/publish`);
export const uploadCourseThumbnail = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/courses/${id}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};