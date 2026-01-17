/**
 * TYPES: Index File
 * 
 * MỤC ĐÍCH: Export tất cả types từ một nơi để dễ import
 */

// Frontend Types (cho components)
export type {
  Course,
  Section,
  Lesson,
  Category
} from './course.types';

// API Types (cho services)
export type {
  CourseResponse,
  SectionResponse,
  LessonResponse,
  CategoryResponse
} from './api.types';
