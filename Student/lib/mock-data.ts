/**
 * MOCK DATA: Course Mock Data
 * 
 * MỤC ĐÍCH: Dữ liệu giả để phát triển frontend khi chưa có API
 * 
 * LƯU Ý: Khi kết nối với API thực, có thể bỏ file này hoặc dùng làm fallback
 */

import { Course } from './types/course.types';

// --- DỮ LIỆU GIẢ (MOCK DATA) ---

export const ALL_COURSES: Course[] = [
  {
    id: 1,
    category: "Data Science",
    title: "The AI Engineer Course 2026: Complete AI Engineer Bootcamp",
    description: "Complete AI Engineer Training: Python, NLP, Transformers, LLMs, LangChain, Hugging Face, APIs & More.",
    rating: 4.8,
    students: 14396,
    lastUpdated: "11/2025",
    language: "English",
    price: "1.299.000đ",
    originalPrice: "2.500.000đ",
    discount: "48%",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000",
    instructor: "Dr. Angela Yu",
    duration: "29.5 hours",
    lectures: 107,
    level: "Beginner",
    curriculum: [
      {
        id: "s1",
        title: "Section 1: Introduction to AI & Environment Setup",
        lessons: [
          { title: "Welcome to the course", time: "5:00", type: "video", preview: true },
          { title: "Installing Python & Anaconda", time: "10:00", type: "video", preview: true },
          { title: "Course Resources", time: "1:00", type: "article", preview: false },
        ]
      },
      {
        id: "s2",
        title: "Section 2: Python Refresher for Data Science",
        lessons: [
          { title: "Variables and Data Types", time: "15:00", type: "video", preview: false },
          { title: "Lists, Dictionaries, and Sets", time: "20:00", type: "video", preview: false },
          { title: "Functions and Logic", time: "12:00", type: "video", preview: false },
        ]
      },
      {
        id: "s3",
        title: "Section 3: Machine Learning Fundamentals",
        lessons: [
          { title: "What is Machine Learning?", time: "8:00", type: "video", preview: false },
          { title: "Supervised vs Unsupervised Learning", time: "14:00", type: "video", preview: false },
        ]
      },
      {
        id: "s4",
        title: "Section 4: Deep Learning & Neural Networks",
        lessons: [
          { title: "Intro to Neural Networks", time: "25:00", type: "video", preview: false },
        ]
      }
    ],
    whatYouWillLearn: [
      "Master AI concepts and Machine Learning logic.",
      "Build real-world AI apps with Python.",
      "Understand LLMs like GPT-4 and Llama 2.",
      "Deploy AI models to production."
    ]
  },
  // Bạn có thể copy object trên dán xuống dưới để tạo thêm item id: 2, id: 3...
];