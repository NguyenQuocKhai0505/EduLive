"use client"

import { useState, useEffect } from "react";
import CourseCard from "../shared/CourseCard";

interface RecentlyViewedProps{
    currentCourse:any
}

export default function RecentlyViewed({currentCourse}:RecentlyViewedProps){
    const [recentCourses, setRecentCourses] = useState<any[]>([]);
    useEffect(()=>{
        //1.Lay du lieu tu localStorage
        const storedData = localStorage.getItem("edulive_recent_viewed")
        let history = storedData ? JSON.parse(storedData) : [];

        //2. Xoa bai hien tai neu da co 
        history = history.filter((item:any)=> item.id !== currentCourse.id)

        //3. Them bai hien tai len dau danh sach

        const courseToSave = {
            id: currentCourse.id,
            title: currentCourse.title,
            thumail:currentCourse.thumbnail,
            price: currentCourse.price,
            originalPrice: currentCourse.originalPrice,
            rating: currentCourse.rating,
            instructor: currentCourse.instructor,
            students: currentCourse.students
        }
        history.unshift(courseToSave)

        //4.Gioi han 5 bai gan nhat 
        if(history.length > 5){
            history.slice(0,5)
        }
        //5: Luu vao local Storage 
        localStorage.setItem("edulive_recent_viewed",JSON.stringify(history))

        //6.Cap nhat state 
        setRecentCourses(history)
    },[currentCourse])
    if(currentCourse.length ===0) return null

    return(
        <div>
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                Recently Viewed
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {recentCourses.map((item) => (
                <CourseCard key={item.id} item={item} />
                ))}
            </div>
         </div>
    )
}