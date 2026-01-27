"use client"
import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const mockCourses = [
    {
      id: 1,
      title: "ReactJS from Zero to Hero",
      thumbnail:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      duration: 28,
      isActive: true,
      isPublished: true,
    },
    {
      id: 2,
      title: "UI/UX Design with Figma",
      thumbnail:
        "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=800&auto=format&fit=crop",
      duration: 18,
      isActive: true,
      isPublished: false,
    },
    {
      id: 3,
      title: "English Communication",
      thumbnail:
        "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=800&auto=format&fit=crop",
      duration: 12,
      isActive: false,
      isPublished: false,
    },
  ];
  export default function PublishPage(){
    const [courses,setCourses] = useState(mockCourses)

    //Toggle Handler
    const handleToggle = (courseId:number) =>{
        setCourses((prev)=>
            prev.map((courses)=>
                courses.id === courseId?
                {...courses,isPublished:!courses.isPublished} :courses
            ))
    }
    const activeCourses = courses.filter((course) => course.isActive)
    
    return (
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Publish / Unpublish Courses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chỉ hiển thị khóa học đã được admin duyệt (isActive = true).
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
                    className="w-full"
                  >
                    {course.isPublished ? "Published" : "Unpublished"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }