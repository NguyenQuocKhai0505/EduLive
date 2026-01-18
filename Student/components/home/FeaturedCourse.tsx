"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getAllCategories, getCoursesByCategory, CategoryResponse, CourseResponse } from "@/services/course.service";
import CourseCard from "@/components/shared/CourseCard";

export function FeaturedCourses() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [coursesByCategory, setCoursesByCategory] = useState<Record<number, CourseResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy tất cả categories từ API
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        // 2. Set active tab đầu tiên
        if (categoriesData.length > 0) {
          setActiveTab(categoriesData[0].id.toString());
        }
        
        // 3. Lấy courses cho từng category
        const coursesData: Record<number, CourseResponse[]> = {};
        for (const category of categoriesData) {
          const courses = await getCoursesByCategory(category.id);
          // Chỉ lấy courses đã publish, lấy 4 courses đầu tiên
          coursesData[category.id] = courses.filter(c => c.isPublished).slice(0, 4);
        }
        setCoursesByCategory(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-10 space-y-6 bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
        <div className="text-center text-slate-600 dark:text-slate-400">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 space-y-4 sm:space-y-6 bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Skills to transform your career and life
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          From critical skills to technical topics, <b className="text-slate-900 dark:text-white">Keducation</b> supports your professional development.
        </p>
      </div>

      {categories.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent dark:bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none mb-4 sm:mb-6 overflow-x-auto flex-nowrap scrollbar-hide">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id.toString()}
                className="rounded-none border-b-2 border-transparent px-3 sm:px-4 py-2 sm:py-3 font-bold text-sm sm:text-base
                           text-slate-600 dark:text-slate-400
                           data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500
                           data-[state=active]:text-slate-900 dark:data-[state=active]:text-white
                           data-[state=active]:bg-transparent 
                           hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => {
            const featuredCourses = coursesByCategory[cat.id] || [];

            return (
              <TabsContent 
                key={cat.id} 
                value={cat.id.toString()} 
                className="animate-in fade-in-50 duration-500 space-y-8"
              >
                {featuredCourses.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 dark:text-slate-400 border border-dashed rounded-lg border-slate-200 dark:border-slate-800">
                    Chưa có khóa học nổi bật cho mục này.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {featuredCourses.map((course) => (
                      <CourseCard 
                        key={course.id} 
                        item={{
                          id: course.id,
                          title: course.title,
                          thumbnail: course.thumbnail,
                          price: course.price > 0 
                            ? `${course.price.toLocaleString('vi-VN')}đ` 
                            : "Free",
                          originalPrice: course.originalPrice > 0
                            ? `${course.originalPrice.toLocaleString('vi-VN')}đ`
                            : undefined,
                          discount: course.originalPrice > course.price 
                            ? `${Math.round((1 - course.price / course.originalPrice) * 100)}%`
                            : undefined,
                          rating: course.rating,
                          lectures: course.lectures,
                          instructor: course.instructor?.name || "Unknown",
                          students: course.students,
                        }} 
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-start">
                  <Button 
                    variant="outline" 
                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300 font-bold" 
                    asChild
                  >
                    <Link href={`/courses?categoryId=${cat.id}`}>
                      Show all {cat.name} courses
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}