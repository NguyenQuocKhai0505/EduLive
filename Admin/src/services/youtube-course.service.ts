import api from "@/lib/api";

export type YoutubeCourse = {
  id: number;
  title: string;
  author: string;
  tags: string | null;           
  videoUrl: string;
  thumbnailUrl: string | null;
  durationLabel: string | null;
  /** Nhóm tab trên Student (vd: Programming Language) */
  category: string | null;
  createdAt: string;              
  updateAt: string;              
};

export const getYoutubeCourses = () =>
  api.get<YoutubeCourse[]>("/youtube-courses").then((res) => res.data);

export const createYoutubeCourse = (data: {
  title: string;
  author: string;
  tags?: string;                   
  videoUrl: string;
  thumbnailUrl?: string;           
  durationLabel?: string;
  category?: string;
}) =>
  api
    .post<YoutubeCourse>("/youtube-courses", data)
    .then((res) => res.data);

export const updateYoutubeCourse = (
  id: number,
  data: Partial<YoutubeCourse>
) =>
  api
    .patch<YoutubeCourse>(`/youtube-courses/${id}`, data)
    .then((res) => res.data);

export const deleteYoutubeCourse = (id: number) =>
  api.delete(`/youtube-courses/${id}`);

/** Upload thumbnail lên Cloudinary */
export const uploadYoutubeCourseThumbnail = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post<{ thumbnailUrl: string; course: YoutubeCourse }>(
      `/youtube-courses/${id}/thumbnail`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((res) => res.data);
};

/** Lấy metadata từ YouTube URL (title, author, thumbnail) */
export const fetchYoutubeMetadata = (url: string) =>
  api
    .get<{
      title: string;
      author: string;
      thumbnailUrl: string;
      videoId: string;
    }>(`/youtube-courses/fetch-metadata`, {
      params: { url },
    })
    .then((res) => res.data);