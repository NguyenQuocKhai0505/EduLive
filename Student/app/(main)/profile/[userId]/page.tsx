"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getUserProfile, getMyProfile, type UserProfile } from "@/services/user.service";
import { getBlogsByAuthor, type BlogResponse } from "@/services/blog.service";
import { getMyCourses } from "@/services/user.service";
import type { CourseResponse } from "@/lib/types/api.types";
import { BookOpen, ArrowLeft, Heart, MessageCircle, Clock, Star, Users, Play } from "lucide-react";
import { toast } from "sonner";

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = parseInt(params.userId as string);
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [blogs, setBlogs] = useState<BlogResponse[]>([]);
    const [courses, setCourses] = useState<CourseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"blogs" | "courses">("blogs");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1) Profile của user đang xem
                const profileData = await getUserProfile(userId);
                setProfile(profileData);

                // 2) Blogs của user
                const blogsData = await getBlogsByAuthor(userId);
                setBlogs(blogsData);

                // 3) Kiểm tra nếu đang xem profile của chính mình
                try {
                    const myProfile = await getMyProfile();
                    setCurrentUser(myProfile);

                    if (myProfile.id === userId) {
                        try {
                            const coursesData = await getMyCourses();
                            setCourses(coursesData);
                        } catch {
                            console.log("Could not fetch courses");
                        }
                    }
                } catch {
                    console.log("Not logged in");
                }
            } catch (err: any) {
                console.error("Error fetching profile:", err);
                const errorMessage = err.response?.data?.message || err.message || "Failed to load profile";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (userId && !isNaN(userId)) {
            fetchData();
        } else {
            setError("Invalid user ID");
            setLoading(false);
        }
    }, [userId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

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
                    <Button onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const isMyProfile = currentUser && currentUser.id === profile.id;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
                            <div className="flex flex-col items-center mb-6">
                                <Avatar className="h-24 w-24 border-4 border-purple-100 dark:border-purple-900">
                                    <AvatarImage src={profile.avatar} />
                                    <AvatarFallback className="bg-purple-600 text-white text-2xl font-bold">
                                        {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
                                {profile.name || "User"}
                            </h1>

                            <p className="text-center text-slate-600 dark:text-slate-400 mb-2">
                                {profile.email || "No email provided"}
                            </p>

                            <div className="text-center mb-4">
                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 capitalize">
                                    {profile.role === "teacher"
                                        ? "Instructor"
                                        : profile.role === "admin"
                                        ? "Administrator"
                                        : "Student"}
                                </span>
                            </div>

                            {profile.bio && (
                                <p className="text-center text-slate-600 dark:text-slate-400 text-sm mb-6">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Blogs</span>
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">{blogs.length}</span>
                                </div>
                                {isMyProfile && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Courses</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{courses.length}</span>
                                    </div>
                                )}
                            </div>

                            {isMyProfile ? (
                                <Link href="/profile" className="block w-full mt-6">
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                        Edit My Profile
                                    </Button>
                                </Link>
                            ) : (
                                <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                                    Viewing profile
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 mb-6">
                            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setActiveTab("blogs")}
                                    className={`pb-3 px-4 font-semibold transition-colors ${
                                        activeTab === "blogs"
                                            ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                    }`}
                                >
                                    Blogs ({blogs.length})
                                </button>
                                {isMyProfile && (
                                    <button
                                        onClick={() => setActiveTab("courses")}
                                        className={`pb-3 px-4 font-semibold transition-colors ${
                                            activeTab === "courses"
                                                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        Courses ({courses.length})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Blogs Tab */}
                        {activeTab === "blogs" && (
                            <div className="space-y-6">
                                {blogs.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-12 text-center">
                                        <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            No blogs yet
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {isMyProfile ? "Start writing your first blog post!" : "This user hasn't published any blogs yet."}
                                        </p>
                                    </div>
                                ) : (
                                    blogs.map((blog) => (
                                        <Link key={blog.id} href={`/blog/${blog.id}`} className="block">
                                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300">
                                                <div className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                                                                <Image
                                                                    src={blog.author?.avatar || "/default-avatar.png"}
                                                                    alt={blog.author?.fullName || "Unknown"}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                    {blog.author?.fullName || "Unknown"}
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {formatDate(blog.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                                        {blog.title}
                                                    </h2>

                                                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                                                        {blog.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
                                                    </p>

                                                    {blog.tag && blog.tag.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {blog.tag.slice(0, 3).map((tag, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {blog.images && blog.images.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {blog.images.slice(0, 3).map((image, index) => (
                                                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                                                                        <Image
                                                                            src={image}
                                                                            alt={`Blog image ${index + 1}`}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {blog.images.length > 3 && (
                                                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                                                                        <span className="text-white text-sm font-semibold">
                                                                            +{blog.images.length - 3}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                        <div className="flex items-center gap-1">
                                                            <Heart className="w-4 h-4" />
                                                            <span>{blog.likesCount}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageCircle className="w-4 h-4" />
                                                            <span>{blog.commentsCount}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Courses Tab */}
                        {activeTab === "courses" && isMyProfile && (
                            <div className="space-y-6">
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
                                            <Link key={course.id} href={`/courses/${course.id}`} className="group block">
                                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                                    <div className="relative aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                                        <Image
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>

                                                    <div className="p-4 flex-1 flex flex-col">
                                                        {course.category && (
                                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded mb-2">
                                                                {course.category.name}
                                                            </span>
                                                        )}

                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                            {course.title}
                                                        </h3>

                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                            {course.instructor?.name || "Unknown"}
                                                        </p>

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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}