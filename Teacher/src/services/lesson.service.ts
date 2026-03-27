import api, { refreshSession } from "../lib/api";

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

export const updateLesson = (
  courseId: number,
  sectionId: number,
  lessonId: number,
  data: Partial<LessonPayload>
) =>
  api.patch(
    `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
    data
  );

export const deleteLesson = (
  courseId: number,
  sectionId: number,
  lessonId: number
) =>
  api.delete(
    `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`
  );

/** Làm mới access cookie trước khi hết hạn (~15m mặc định) để upload dài không bị 401. */
const SESSION_KEEPALIVE_MS = 8 * 60 * 1000;

export const uploadLessonVideos = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("videos", file));

  const intervalId =
    typeof window !== "undefined"
      ? window.setInterval(() => {
          void refreshSession().catch(() => {});
        }, SESSION_KEEPALIVE_MS)
      : 0;

  return api
    .post("/lessons/upload/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // Video dài: upload + Cloudinary có thể mất nhiều phút
      timeout: 3_600_000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    .finally(() => {
      if (intervalId) window.clearInterval(intervalId);
    });
};
