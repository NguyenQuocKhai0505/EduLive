"use client";

import { Check } from "lucide-react";
import { ALL_COURSES } from "@/lib/mock-data";

// Import các Component con
import CourseHeader from "@/components/course-detail/CourseHeader";
import CourseSidebar from "../../../components/course-detail/CourseSidebar"
import SimilarCourses from "../../../components/course-detail/SimiliarCourse";
import RecentlyViewed from "../../../components/course-detail/RecentlyView";
import CourseCurriculum from "@/components/course-detail/CourseCurriculum";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  // 1. Giả lập lấy ID từ URL (Trong thực tế bạn sẽ dùng ID này để fetch API)
  // Ở đây mình fix cứng lấy bài ID số 1 để demo
  const currentCourse = ALL_COURSES[0]; 

  // 2. Logic lọc "Khóa học tương tự" (Ở Parent Component)
  // Lọc các bài cùng Category nhưng KHÁC ID hiện tại
  const similarCourses = ALL_COURSES.filter(
    (c) => c.category === currentCourse.category && c.id !== currentCourse.id
  ).slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-20">
      
      {/* --- HEADER SECTION --- */}
      <CourseHeader course={currentCourse} />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* --- LEFT COLUMN: CONTENT --- */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* What You Will Learn Box */}
            <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-lg bg-white dark:bg-slate-900">
               <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">What you'll learn</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCourse.whatYouWillLearn?.map((text, index) => (
                      <div key={index} className="flex gap-3 items-start">
                          <Check className="w-5 h-5 text-slate-900 dark:text-slate-200 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{text}</span>
                      </div>
                  ))}
               </div>
            </div>
            <CourseCurriculum course={currentCourse} />

            {/* Course Content (Description) */}
             <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Description</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                   {currentCourse.description}
                   <br/><br/>
                   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
             </div>

          </div>

          {/* --- RIGHT COLUMN: STICKY SIDEBAR --- */}
          <div className="relative lg:block">
            <CourseSidebar course={currentCourse} />
          </div>

        </div>

        {/* --- BOTTOM SECTIONS --- */}
        <div className="mt-20 space-y-16 border-t border-slate-200 dark:border-slate-800 pt-10">
            
            {/* Component 1: Khóa học tương tự */}
            <SimilarCourses courses={similarCourses} />

            {/* Component 2: Đã xem gần đây (Tự xử lý logic bên trong) */}
            <RecentlyViewed currentCourse={currentCourse} />
            
        </div>

      </div>
    </div>
  );
}