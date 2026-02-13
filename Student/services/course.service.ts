import api from '@/lib/axios';
import type {
  CourseResponse,
  SectionResponse,
  LessonResponse,
  CategoryResponse
} from '@/lib/types/api.types';

/**
 * SERVICE: CourseService
 * 
 * MỤC ĐÍCH: Xử lý các API calls liên quan đến Course
 * 
 * ENDPOINTS:
 * - GET /courses - Lấy tất cả courses (có thể filter theo categoryId)
 * - GET /courses/:id - Lấy course chi tiết
 * - GET /courses/category/:categoryId - Lấy courses theo category
 * - GET /categories - Lấy tất cả categories
 */

// Re-export types để dễ import từ service
export type {
  CourseResponse,
  SectionResponse,
  LessonResponse,
  CategoryResponse
} from '@/lib/types/api.types';

/**
 * Lấy tất cả courses (đã publish)
 * 
 * @param categoryId - Optional: Filter theo category
 * @param level - Optional: Filter theo level
 * @param language - Optional: Filter theo language
 * @returns Danh sách courses
 */
export const getAllCourses = async (
  categoryId?: number,
  level?: string,
  language?: string
): Promise<CourseResponse[]> => {
  try {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    if (level) params.level = level;
    if (language) params.language = language;

    const response = await api.get('/courses', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Lấy course chi tiết theo ID (bao gồm sections và lessons)
 * 
 * @param courseId - Course ID
 * @returns Course với đầy đủ thông tin
 */
export const getCourseById = async (courseId: number): Promise<CourseResponse> => {
  try {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

/**
 * Lấy courses theo category
 * 
 * @param categoryId - Category ID
 * @returns Danh sách courses trong category
 */
export const getCoursesByCategory = async (categoryId: number): Promise<CourseResponse[]> => {
  try {
    const response = await api.get(`/courses/category/${categoryId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching courses by category:', error);
    throw error;
  }
};

/**
 * Lấy tất cả categories
 * 
 * @returns Danh sách categories
 */
export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Tìm kiếm courses
 * 
 * @param searchParams - Object chứa các tham số tìm kiếm
 * @returns Danh sách courses phù hợp
 */
/**
 * Tìm kiếm courses với filter đầy đủ
 * 
 * @param searchParams - Object chứa các tham số filter
 * @returns Danh sách courses phù hợp
 */
export const searchCourses = async (searchParams: {
  title?: string;
  categoryId?: number;
  level?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  price?: string; // "Free" hoặc "Paid"
  duration?: string; // "short", "medium", "long", "extra-long"
  video?: boolean; // true nếu muốn courses có video
}): Promise<CourseResponse[]> => {
  try {
    // ✅ Build params object - chỉ gửi những params có giá trị
    const params: any = {};
    
    if (searchParams.title) params.title = searchParams.title;
    if (searchParams.categoryId) params.categoryId = searchParams.categoryId;
    if (searchParams.level && searchParams.level !== 'All Levels') {
      params.level = searchParams.level;
    }
    if (searchParams.language) params.language = searchParams.language;
    if (searchParams.minRating !== undefined) params.minRating = searchParams.minRating;
    if (searchParams.minPrice !== undefined) params.minPrice = searchParams.minPrice;
    if (searchParams.maxPrice !== undefined) params.maxPrice = searchParams.maxPrice;
    if (searchParams.price) params.price = searchParams.price; // "Free" hoặc "Paid"
    if (searchParams.duration) params.duration = searchParams.duration;
    if (searchParams.video !== undefined) params.video = searchParams.video;

    const response = await api.get('/courses', { params });
    
    // ✅ Xử lý response format linh hoạt
    return Array.isArray(response.data) 
      ? response.data 
      : response.data?.data ?? [];
  } catch (error: any) {
    console.error('Error searching courses:', error);
    throw error;
  }
};