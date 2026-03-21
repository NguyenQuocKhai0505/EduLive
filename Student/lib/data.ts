// lib/data.ts
import { ALL_COURSES } from "./mock-data";
import type { Course } from "./types/course.types";

// 1. Định nghĩa User
export type UserRole = "student" | "teacher";

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  bio: string;
  // Liên kết với khóa học
  coursesId: (string | number)[]; // Nếu là Student: Course đã mua. Teacher: Course đã tạo.
}

// 2. Dữ liệu User mẫu
export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Tran Hai Dang (K17)", // Giống ảnh bạn gửi
    avatar: "https://files.fullstack.edu.vn/f8-prod/user_avatars/1/64f9b3d0c3125.jpg", // Demo ảnh
    role: "student",
    bio: "Fullstack Developer in 2026",
    coursesId: [1, 2] // ID lấy từ ALL_COURSES
  },
  {
    id: "u2",
    name: "Dr. Angela Yu",
    avatar: "https://img-c.udemycdn.com/user/200_H/31334738_a13c_3.jpg",
    role: "teacher",
    bio: "Lead Instructor at London App Brewery",
    coursesId: [1] // Giáo viên này dạy khóa ID 1
  }
];

// 3. Định nghĩa Blog Post
export interface BlogPost {
  id: string;
  userId: string; // Người viết
  title: string;
  content: string; // HTML hoặc Markdown
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "p1",
    userId: "u1",
    title: "aaaaaaaaaaaaaaaaaaaaaaaaa", // Demo title như ảnh
    content: "<p>aaaaaaaaaaaaaaaaa</p>",
    tags: ["Front-end", "UI/UX"],
    likes: 12,
    comments: 4,
    createdAt: "3 giờ trước"
  },
  {
    id: "p2",
    userId: "u2",
    title: "Why Python is King in 2026?",
    content: "<p>Python is evolving...</p>",
    tags: ["Data Science", "Python"],
    likes: 156,
    comments: 23,
    createdAt: "1 ngày trước"
  }
];
export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "online" | "offline";
}

export interface ChatMessage {
  id: number;
  senderId: string; // 'me' hoặc id của user khác
  text: string;
  timestamp: string;
}

export const MOCK_CONTACTS: ChatContact[] = [
  {
    id: "u2", // Dr. Angela Yu (từ data cũ)
    name: "Dr. Angela Yu",
    avatar: "https://img-c.udemycdn.com/user/200_H/31334738_a13c_3.jpg",
    lastMessage: "Đừng quên nộp bài tập nhé!",
    time: "10:30 AM",
    unread: 2,
    status: "online"
  },
  {
    id: "u3",
    name: "Jonas Schmedtmann",
    avatar: "https://img-c.udemycdn.com/user/200_H/7799204_2091_5.jpg",
    lastMessage: "JavaScript course vừa update đó.",
    time: "Hôm qua",
    unread: 0,
    status: "offline"
  },
  {
    id: "u4",
    name: "Support Team",
    avatar: "https://files.fullstack.edu.vn/f8-prod/user_avatars/1/64f9b3d0c3125.jpg",
    lastMessage: "Bạn cần hỗ trợ gì không?",
    time: "12/01",
    unread: 0,
    status: "online"
  }
];

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, senderId: "u2", text: "Hi Dang! Em đã xem bài giảng mới chưa?", timestamp: "10:00 AM" },
  { id: 2, senderId: "me", text: "Dạ em xem rồi cô ơi, phần React Hooks hay quá.", timestamp: "10:05 AM" },
  { id: 3, senderId: "u2", text: "Tốt lắm. Nhớ làm bài tập thực hành nhé.", timestamp: "10:15 AM" },
  { id: 4, senderId: "u2", text: "Đừng quên nộp bài tập nhé!", timestamp: "10:30 AM" }
];