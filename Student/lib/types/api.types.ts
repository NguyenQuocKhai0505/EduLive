/**
 * TYPES: API Response Types
 * 
 * MỤC ĐÍCH: Định nghĩa các interface/types cho API responses từ backend
 * Sử dụng trong services và khi nhận data từ API
 */

// Lesson Response Type
export interface LessonResponse {
  id: number;
  title: string;
  time: string;
  type: "video" | "article" | "quiz";
  preview: boolean;
  sectionId: number;
  order: number;
  videoUrl?: string;
  content?: string;
  createdAt?: string;
  updateAt?: string;
}

// Section Response Type
export interface SectionResponse {
  id: number;
  title: string;
  courseId: number;
  order: number;
  lessons: LessonResponse[];
  createdAt?: string;
  updateAt?: string;
}

// Category Response Type
export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updateAt?: string;
}

// Course Response Type
export interface CourseResponse {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  thumbnail: string;
  level: string;
  language: string;
  price: number;
  originalPrice: number;
  students: number;
  lectures: number;
  rating: number;
  duration: number;
  instructorId: number;
  instructor?: {
    id: number;
    fullName?: string;
    name?: string;
    email: string;
  };
  isPublished: boolean;
  isActive: boolean;
  sections?: SectionResponse[];
  createdAt: string;
  updateAt: string;
}

/** Free YouTube resources (GET /youtube-courses) */
export interface YoutubeCourseResponse {
  id: number;
  title: string;
  author: string;
  tags: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationLabel: string | null;
  /** Tab nhóm trên Student (có thể null → hiển thị "Khác") */
  category: string | null;
  createdAt: string;
  updateAt: string;
}
