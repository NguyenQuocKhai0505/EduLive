"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { getCourseById, getCoursesByCategory, CourseResponse } from "@/services/course.service";
import CourseHeader from "@/components/course-detail/CourseHeader";
import CourseSidebar from "@/components/course-detail/CourseSidebar";
import SimilarCourses from "@/components/course-detail/SimiliarCourse";
import RecentlyViewed from "@/components/course-detail/RecentlyView";
import CourseCurriculum from "@/components/course-detail/CourseCurriculum";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/context/I18nContext";


export default function CourseDetailPage() {
  const { t } = useI18n();
  const params = useParams()
  const courseId = parseInt(params.courseId as string)

  const [course,setCourse] = useState<CourseResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [similarCourses,setSimilarCourses] = useState<CourseResponse[]>([])


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy course chi tiết từ API (có sections và lessons)
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
        
        // 2. Lấy courses tương tự (cùng category)
        if (courseData.categoryId) {
          const similar = await getCoursesByCategory(courseData.categoryId);
          setSimilarCourses(
            similar
              .filter(c => c.id !== courseId && c.isPublished)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

    if (loading) {
      return (
        <div className="bg-white dark:bg-slate-950 min-h-screen flex items-center justify-center">
          <div>Loading course...</div>
        </div>
      );
    }
  
    if (!course) {
      return (
        <div className="bg-white dark:bg-slate-950 min-h-screen flex items-center justify-center">
          <div>Course not found</div>
        </div>
      );
    }

    //MAP API response sang format ma component can
    const courseForComponent={
      id: course.id,
      category: course.category?.name || "",
      title: course.title,
      description: course.description,
      rating: course.rating,
      students: course.students,
      lastUpdated: new Date(course.updateAt).toLocaleDateString("vi-VN"),
      language: course.language,
      price: formatPrice(course.price),
      originalPrice: course.originalPrice > 0 ? formatPrice(course.originalPrice) : undefined,
      discount: course.originalPrice > course.price
        ? `${Math.round((1-course.price/course.originalPrice)*100)}%`
        :undefined,
      thumbnail: course.thumbnail,
      instructor: course.instructor?.fullName || course.instructor?.name || "Unknown",
      authorName: course.instructor?.fullName || course.instructor?.name || "Unknown", // Hiển thị fullName từ instructorId
      duration:`${course.duration} hours`,
      level: course.level,
      lectures: course.lectures,
      //Map sections -> curriculum
      curriculum: (course.sections || []).map(section=>({
        id:section.id.toString(),
        title: section.title,
        lessons: section.lessons.map(lesson =>({
          title: lesson.title,
          time: lesson.time,
          type: lesson.type,
          preview: lesson.preview
        }))
      })),
      whatYouWillLearn: [
        "Master AI concepts and Machine Learning logic.",
        "Build real-world AI apps with Python.",
        "Understand LLMs like GPT-4 and Llama 2.",
        "Deploy AI models to production."]
    }
    //MAP SIMILAR COURSES

  const similarCoursesMapped = similarCourses.map(c => ({
    id: c.id,
    category: c.category?.name || "",
    title: c.title,
    description: c.description,
    rating: c.rating,
    students: c.students,
    lastUpdated: new Date(c.updateAt).toLocaleDateString('vi-VN'),
    language: c.language,
    price: formatPrice(c.price),
    originalPrice: c.originalPrice > 0 ? formatPrice(c.originalPrice) : undefined,
    discount: c.originalPrice > c.price 
      ? `${Math.round((1 - c.price / c.originalPrice) * 100)}%`
      : undefined,
    thumbnail: c.thumbnail,
    instructor: c.instructor?.fullName || c.instructor?.name || "Unknown",
    duration: `${c.duration} hours`,
    lectures: c.lectures,
    level: c.level,
    curriculum: [],
    whatYouWillLearn: []
  }));


  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-12 sm:pb-20">
      
      {/* --- HEADER SECTION --- */}
      <CourseHeader course={courseForComponent} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          
          {/* --- LEFT COLUMN: CONTENT --- */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10">
            
            {/* What You Will Learn Box */}
            <div className="border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-lg bg-white dark:bg-slate-900">
               <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-white">{t("courseDetail.whatYoullLearn")}</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {courseForComponent.whatYouWillLearn?.map((text, index) => (
                      <div key={index} className="flex gap-2 sm:gap-3 items-start">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-slate-200 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{text}</span>
                      </div>
                  ))}
               </div>
            </div>
            <CourseCurriculum course={courseForComponent} />

            {/* Course Content (Description) */}
             <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">{t("courseDetail.description")}</h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                   {courseForComponent.description}
                   <br/><br/>
                </p>
             </div>

          </div>

          {/* --- RIGHT COLUMN: STICKY SIDEBAR --- */}
          <div className="relative lg:block">
            <CourseSidebar course={courseForComponent} />
          </div>

        </div>

        {/* --- BOTTOM SECTIONS --- */}
        <div className="mt-12 sm:mt-16 lg:mt-20 space-y-12 sm:space-y-16 border-t border-slate-200 dark:border-slate-800 pt-8 sm:pt-10">
            
            {/* Component 1: Khóa học tương tự */}
            <SimilarCourses courses={similarCoursesMapped} />

            {/* Component 2: Đã xem gần đây (Tự xử lý logic bên trong) */}
            <RecentlyViewed currentCourse={courseForComponent} />
            
        </div>

      </div>
    </div>
  );
}