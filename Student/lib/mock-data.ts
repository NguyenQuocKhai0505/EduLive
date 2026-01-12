// --- PHẦN 1: ĐỊNH NGHĨA INTERFACE (Khuôn mẫu) ---

export interface Lesson {
  title: string;
  time: string;
  type: "video" | "article" | "quiz";
  preview: boolean;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

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

// --- PHẦN 2: DỮ LIỆU GIẢ (MOCK DATA) ---

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