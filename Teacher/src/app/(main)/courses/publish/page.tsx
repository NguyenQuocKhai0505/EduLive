"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMyCourses,togglePublish } from "../../../../services/course.service"
import { toast } from "sonner"

export interface CourseResponse {
  id:number 
  title:string
  thumbnail:string
  duration:number
  isActive:boolean
  isPublished:boolean
  createdAt:string
  updateAt:string
}
  export default function PublishPage(){
    const [courses,setCourses] = useState<CourseResponse[]>([])
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState<string | null>(null)
    const [toggleCourseId,setToggleCourseId] = useState<number | null>(null)
    //Fetch Courses 
    useEffect(() =>{
      const fetchMyCourses = async () =>{
        try{
          setLoading(true)
          setError(null)
          const response = await getMyCourses()
          
          // Xử lý response.data theo nhiều format có thể
          const coursesData = Array.isArray(response.data)
            ? response.data
            : response.data?.data ?? response.data ?? []
          
          console.log("Fetched courses:", coursesData) // Debug log
          setCourses(coursesData)
        }catch(error: any){
          console.error("Error fetching courses:", error) // Debug log
          const errorMessage = error?.response?.data?.message || "Failed to fetch courses"
          toast.error(errorMessage)
          setError(errorMessage)
        }finally{
          setLoading(false)
        }
      }
      fetchMyCourses()
    },[])
    //Toggle Handler
    const handleToggle = async (courseId:number) =>{
      try{
        setToggleCourseId(courseId)
        await togglePublish(courseId)
        
        setCourses((prev) => prev.map((course) => course.id === courseId ? {...course,isPublished:!course.isPublished}:course))

        toast.success(
          courses.find((c) => c.id === courseId)?.isPublished ? "Course published successfully" : "Course unpublished successfully"
        )
      }catch(error:any){
        toast.error("Failed to toggle publish")
        setError("Failed to toggle publish")
      }finally{
        setToggleCourseId(null)
      }
    }
    const activeCourses = courses.filter((course) => course.isActive)
    
    if (loading) {
      return (
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Publish / Unpublish Courses
          </h1>
          <div className="mt-6 text-center text-slate-500 dark:text-slate-400">
            Loading courses...
          </div>
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Publish / Unpublish Courses
          </h1>
          <div className="mt-6 text-center text-red-500">
            {error}
          </div>
        </div>
      )
    }
    
    if (courses.length === 0) {
      return (
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Publish / Unpublish Courses
          </h1>
          <div className="mt-6 text-center text-slate-500 dark:text-slate-400">
            No courses found. Create a course first.
          </div>
        </div>
      )
    }
    
    if (activeCourses.length === 0) {
      return (
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Publish / Unpublish Courses
          </h1>
          <div className="mt-6 text-center text-slate-500 dark:text-slate-400">
            No active courses found. Your courses need to be approved by admin first.
            <br />
            <span className="text-sm">Total courses: {courses.length} (all pending approval)</span>
          </div>
        </div>
      )
    }
    
    return (
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Publish / Unpublish Courses
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Showing {activeCourses.length} of {courses.length} courses (only approved courses can be published)
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800"
              >
              <div className="relative h-32 w-full">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
    
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-md object-cover"
                  />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Duration: {course.duration} hours
                  </p>
    
                  <Button
                    variant={course.isPublished ? "default" : "outline"}
                    onClick={() => handleToggle(course.id)}
                    disabled={toggleCourseId === course.id}
                    className="w-full"
                  >
                    {
                      toggleCourseId === course.id ? "Updating..." : course.isPublished ? "Published" : "Unpublished"
                    }
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }