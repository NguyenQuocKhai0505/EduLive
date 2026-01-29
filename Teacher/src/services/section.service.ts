import api from "../lib/api";

export type SectionPayload = {
  title: string;
  order?: number;
};

export const getSectionsByCourse = (courseId: number) =>
  api.get(`/courses/${courseId}/sections`);

export const createSection = (courseId: number, data: SectionPayload) =>
  api.post(`/courses/${courseId}/sections`, data);

export const updateSection = (
  courseId: number,
  sectionId: number,
  data: Partial<SectionPayload>
) => api.patch(`/courses/${courseId}/sections/${sectionId}`, data);
