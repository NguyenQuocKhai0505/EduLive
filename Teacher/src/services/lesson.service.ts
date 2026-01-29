import api from "../lib/api";

export type LessonPayload = {
  title: string;
  type: "video" | "article" | "quiz";
  videoUrl?: string;
  content?: string;
  time?: string;
  preview?: boolean;
  order?: number;
};

export const getLessonsBySection = (courseId: number, sectionId: number) =>
  api.get(`/courses/${courseId}/sections/${sectionId}/lessons`);

export const createLesson = (
  courseId: number,
  sectionId: number,
  data: LessonPayload
) => api.post(`/courses/${courseId}/sections/${sectionId}/lessons`, data);

export const uploadLessonVideos = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("videos", file));
  return api.post("/lessons/upload/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
