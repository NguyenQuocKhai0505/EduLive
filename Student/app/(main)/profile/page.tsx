"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  getMyProfile, 
  getMyCourses, 
  type UserProfile 
} from "@/services/user.service";
import { CourseResponse } from "@/services/course.service";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { Lock, BookOpen, Users, Clock, Star, Play } from "lucide-react";

export default function ProfilePage(){
    const [profile,setProfile] = useState<UserProfile | null>(null)
    const [courses,setCourses]= useState<CourseResponse[]>([])
    const [loading,setLoading] = useState(true)
    const [showPasswordModal,setShowPasswordModal] = useState(false)
    const [error,setError] = useState<string | null>(null)

    useEffect(()=>{
        const fetchData = async() =>{
            try{
                setLoading(true)
                setError(null)
                const [profileData,coursesData] = await Promise.all([
                    getMyProfile(),
                    getMyCourses()
                ])
                setProfile(profileData)
                setCourses(coursesData)

            }catch(err:any){
                console.error("Error fetching profile data:", err)
                // Hiển thị lỗi chi tiết hơn
                const errorMessage = err.response?.data?.message || err.message || "Failed to load profile"
                setError(errorMessage)
            }finally{
                setLoading(false)
            }
        }
        fetchData()
    },[])

    if (loading) {
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="text-slate-600 dark:text-slate-400">Loading...</div>
          </div>
        );
      }
    
      if (!profile || error) {
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                Failed to load profile
              </div>
              {error && (
                <div className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="text-slate-500 dark:text-slate-500 text-xs space-y-1">
                <p>• Kiểm tra bạn đã đăng nhập chưa</p>
                <p>• Kiểm tra backend server đã chạy chưa (http://localhost:3001)</p>
                <p>• Kiểm tra token có hết hạn không (thử đăng nhập lại)</p>
              </div>
              <Link href="/auth/login" className="mt-4 inline-block">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        );
      }
      return(
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* LEFT COLUMN: PROFILE INFO */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <Avatar className="h-24 w-24 border-4 border-purple-100 dark:border-purple-900">
                                    <AvatarImage src={profile.avatar} />
                                    <AvatarFallback className="bg-purple-600 text-white text-2xl font-bold">
                                        {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            {/* FULL NAME */}
                            <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
                                {profile.name || "User"}
                            </h1>
                            {/* EMAIL */}
                            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                                {profile.email || "No email provided"}
                            </p>
                            {/*CHANGE PASSWORD BUTTON*/}
                            <Button
                                onClick={() => setShowPasswordModal(true)}
                                variant="outline"
                                className="w-full border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                                <Lock className="w-4 h-4 mr-2"/>
                                Change Password
                            </Button>
                            {/* Stats (Optional) */}
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {courses.length}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        Enrolled Courses
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: COURSE LIST */}
                    <div className="lg:col-span-2">
                                <div className="mb-6">
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                    My Courses
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
                                </p>
                                </div>

                                {courses.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-12 text-center">
                                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    No courses enrolled
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    Start learning by enrolling in a course!
                                    </p>
                                    <Link href="/courses">
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                        Browse Courses
                                    </Button>
                                    </Link>
                                </div>
                                ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {courses.map((course) => (
                                    <Link
                                        key={course.id}
                                        href={`/courses/${course.id}`}
                                        className="group block"
                                    >
                                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                        
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                            <Image
                                            src={course.thumbnail}
                                            alt={course.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            {/* Category Badge */}
                                            {course.category && (
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded mb-2">
                                                {course.category.name}
                                            </span>
                                            )}

                                            {/* Title */}
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            {course.title}
                                            </h3>

                                            {/* Instructor */}
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                            {course.instructor?.name || "Unknown"}
                                            </p>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500 mb-3 flex-wrap">
                                            {course.rating > 0 && (
                                                <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                <span>{course.rating}</span>
                                                </div>
                                            )}
                                            {course.students > 0 && (
                                                <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>{course.students.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {course.lectures > 0 && (
                                                <div className="flex items-center gap-1">
                                                <Play className="w-3 h-3" />
                                                <span>{course.lectures}</span>
                                                </div>
                                            )}
                                            {course.duration > 0 && (
                                                <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{course.duration}h</span>
                                                </div>
                                            )}
                                            </div>

                                            {/* Learn Button */}
                                            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                                                <Link href={`/courses/${course.id}/learn`} className="block w-full">
                                                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                                        Learn
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        </div>
                                    </Link>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </div>
      )
}