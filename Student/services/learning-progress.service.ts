import api from "@/lib/axios";

export async function getCourseLessonProgress(courseId: number): Promise<{
  completedLessonIds: number[];
}> {
  const { data } = await api.get<{ completedLessonIds: number[] }>(
    `/enrollments/progress/${courseId}`
  );
  return {
    completedLessonIds: Array.isArray(data?.completedLessonIds)
      ? data.completedLessonIds
      : [],
  };
}

export async function markLessonCompleteApi(
  courseId: number,
  lessonId: number
): Promise<void> {
  await api.post(
    `/enrollments/progress/${courseId}/lessons/${lessonId}/complete`
  );
}
