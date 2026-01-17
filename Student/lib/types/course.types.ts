/**
 * TYPES: Frontend Types
 * 
 * MỤC ĐÍCH: Định nghĩa các interface/types cho frontend components
 * Sử dụng cho mock data và UI components
 */

// Lesson Type
export interface Lesson {
  title: string;
  time: string;
  type: "video" | "article" | "quiz";
  preview: boolean;
}

// Section Type
export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

// Category Type
export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
}

// Course Type
export interface Course {
  id: number | string; // Chấp nhận cả số và chuỗi cho linh hoạt
  category: string;
  title: string;
  description: string;
  rating: number;
  students: number;
  lastUpdated: string;
  language: string;
  price: string;          // "1.299.000đ"
  originalPrice: string;  // "2.500.000đ"
  discount: string;       // "48%"
  thumbnail: string;      // URL ảnh
  instructor: string;
  duration: string;
  lectures: number;
  level: string;
  
  // Mảng các chương học (quan trọng cho trang chi tiết)
  curriculum: Section[];
  
  // Mảng kiến thức đạt được
  whatYouWillLearn: string[];
}
