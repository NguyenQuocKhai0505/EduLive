"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CourseCard from "@/components/shared/CourseCard";
import FilterBar from "./components/FilterBar";
import Pagination from "./components/Pagination";
import { Search } from "lucide-react";
import { searchCourses, CourseResponse } from "@/services/course.service";


export default function SearchPage() {
  const searchParams = useSearchParams()
  const [course,setCourse] = useState<CourseResponse[]>([])
  const [loading,setLoading] = useState(true)
  const [currentPage,setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  useEffect(()=>{
    const fetchCourses = async() =>{
      try{
        setLoading(true)

        //Lay params tu URL
        const title= searchParams.get("title")
        const categoryId = searchParams.get("categoryId")
        const level = searchParams.get("level")
        const language = searchParams.get("language")
        const rating = searchParams.get("rating")
        const page = searchParams.get("page")

        //Buid search params
        const params:any ={}
        if(title) params.title = title
        if(categoryId) params.categoryId = parseInt(categoryId)
        if(level && level !== "All Levels") params.level = level
        if(language) params.language = language
        if(rating) params.minRating = parseFloat(rating)
        
        if(page) setCurrentPage(parseInt(page))

        //Goi API search
        const results = await searchCourses(params)
        //Chi lay course da publish
        setCourse(results.filter(c=>c.isPublished))
      }catch(error){
        console.error("Error searching courses:",error)
      }finally{
        setLoading(false)
      }
    }
  },[searchParams])

  // PAGINATION LOGIC
  const totalPages = Math.ceil(course.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayedCourses = course.slice(startIndex, endIndex)

  const title = searchParams.get("title")

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {title ? (
              <>Results for <span className="text-purple-600 dark:text-purple-400">"{title}"</span></>
            ) : (
              "All Courses"
            )}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
            {course.length} result{course.length !== 1 && "s"} found
          </p>
        </div>

        <FilterBar />

        {displayedCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
              {displayedCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  item={{
                    id: course.id,
                    category: course.category?.name || "",
                    title: course.title,
                    thumbnail: course.thumbnail,
                    price: course.price > 0 
                      ? `${course.price.toLocaleString('vi-VN')}VND` 
                      : "Free",
                    originalPrice: course.originalPrice > 0
                      ? `${course.originalPrice.toLocaleString('vi-VN')}VND`
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

            <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <Search className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No results found</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
              We couldn't find any courses matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}