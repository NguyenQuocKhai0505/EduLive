"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCourseById, CourseResponse } from "@/services/course.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen, Play, Check, ChevronDown, ChevronRight } from "lucide-react";

export default function LearnPage() {
  const params = useParams();
  const courseId = parseInt(params.courseId as string);

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        // Auto-select first lesson and expand first section
        if (courseData.sections && courseData.sections.length > 0) {
          const firstSection = courseData.sections[0];
          if (firstSection.lessons && firstSection.lessons.length > 0) {
            setCurrentLessonId(firstSection.lessons[0].id);
            // Expand first section
            setExpandedSections(new Set([firstSection.id]));
          }
        }
      } catch (err: any) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Find current lesson
  const currentLesson = course?.sections
    ?.flatMap((section) => section.lessons || [])
    .find((lesson) => lesson.id === currentLessonId);

  // Get all lessons in order
  const allLessons = course?.sections
    ?.flatMap((section) => section.lessons || [])
    .sort((a, b) => a.order - b.order) || [];

  // Find current lesson index
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

  // Calculate progress
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.size;
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedCount / totalLessons) * 100) 
    : 0;

  // Get progress bar color based on percentage (càng nhiều càng đậm)
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) {
      return "bg-gradient-to-r from-purple-600 to-purple-800"; // Rất đậm (80-100%)
    } else if (percentage >= 60) {
      return "bg-gradient-to-r from-purple-500 to-purple-700"; // Đậm (60-80%)
    } else if (percentage >= 40) {
      return "bg-gradient-to-r from-purple-400 to-purple-600"; // Vừa (40-60%)
    } else if (percentage >= 20) {
      return "bg-gradient-to-r from-purple-300 to-purple-500"; // Nhạt vừa (20-40%)
    } else {
      return "bg-gradient-to-r from-purple-200 to-purple-400"; // Rất nhạt (0-20%)
    }
  };

  const progressBarColor = getProgressBarColor(progressPercentage);

  // Previous/Next functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      setCurrentLessonId(prevLesson.id);
      
      // Expand section containing previous lesson
      const prevSection = course?.sections?.find(section => 
        section.lessons?.some(l => l.id === prevLesson.id)
      );
      if (prevSection) {
        setExpandedSections(prev => new Set(prev).add(prevSection.id));
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setCurrentLessonId(nextLesson.id);
      
      // Expand section containing next lesson
      const nextSection = course?.sections?.find(section => 
        section.lessons?.some(l => l.id === nextLesson.id)
      );
      if (nextSection) {
        setExpandedSections(prev => new Set(prev).add(nextSection.id));
      }
    }
  };

  // Toggle section expand/collapse
  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Handle lesson click
  const handleLessonClick = (lessonId: number, sectionId: number) => {
    setCurrentLessonId(lessonId);
    // Expand section if collapsed
    if (!expandedSections.has(sectionId)) {
      setExpandedSections(prev => new Set(prev).add(sectionId));
    }
  };

  // Mark lesson as completed (tạm thời - sau sẽ lưu vào backend)
  const markLessonComplete = (lessonId: number) => {
    setCompletedLessons(prev => new Set(prev).add(lessonId));
    // TODO: Gọi API để lưu progress vào backend
  };

  // Mark current lesson as complete (demo - có thể trigger khi xem hết video)
  useEffect(() => {
    // Tạm thời: Auto-mark lesson as complete khi xem (sau sẽ thay bằng logic xem hết video)
    // Bạn có thể bỏ comment dòng này để test
    // if (currentLessonId) {
    //   setTimeout(() => {
    //     markLessonComplete(currentLessonId);
    //   }, 5000); // Auto complete sau 5 giây (chỉ để demo)
    // }
  }, [currentLessonId]);

  // Check if has previous/next
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Course not found
          </h2>
          <Link href="/courses">
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* TOP NAVIGATION BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        {/* Progress Bar - Hiển thị quá trình học, màu càng đậm khi học càng nhiều */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button + Course title */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <Link href={`/`}>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {course.title}
              </h1>
            </div>

            {/* Right: Progress + Actions */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                {totalLessons > 0 
                  ? `${completedCount}/${totalLessons} lessons` 
                  : "0/0 lessons"}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 hidden sm:block">
                {progressPercentage}%
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <BookOpen className="w-4 h-4 mr-2" />
                Notes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: 2 COLUMNS LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* LEFT COLUMN: VIDEO PLAYER (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-slate-900 rounded-lg aspect-video mb-4 sm:mb-6 flex items-center justify-center relative overflow-hidden">
              {currentLesson ? (
                <div className="text-center text-white p-4">
                  {currentLesson.videoUrl ? (
                    <div className="space-y-4">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-semibold">{currentLesson.title}</p>
                      <p className="text-sm text-slate-400">
                        Video URL: {currentLesson.videoUrl}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Video player will be integrated here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-semibold">{currentLesson.title}</p>
                      <p className="text-sm text-slate-400">
                        No video URL available
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-white text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a lesson to start learning</p>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            {currentLesson && (
              <div className="space-y-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {currentLesson.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Updated{" "}
                    {currentLesson.updateAt
                      ? new Date(currentLesson.updateAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                        })
                      : "Recently"}
                  </p>
                </div>

                {/* Lesson Type Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    {currentLesson.type === "video" ? "Video" : 
                     currentLesson.type === "article" ? "Article" : "Quiz"}
                  </span>
                  {currentLesson.preview && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                      Preview
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation: Previous/Next */}
            <div className="flex gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={goToPrevious}
                disabled={!hasPrevious}
              >
                ← Previous Lesson
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={goToNext}
                disabled={!hasNext}
              >
                Next Lesson →
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Course Content
              </h3>

              {/* Progress Indicator */}
              {totalLessons > 0 && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Progress
                    </span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Course Sections List */}
              <div className="space-y-2">
                {course.sections && course.sections.length > 0 ? (
                  course.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => {
                      const sectionLessons = section.lessons || [];
                      const completedInSection = sectionLessons.filter(l => completedLessons.has(l.id)).length;
                      const isExpanded = expandedSections.has(section.id);

                      return (
                        <div
                          key={section.id}
                          className="border-b border-slate-200 dark:border-slate-800 pb-2 last:border-b-0"
                        >
                          {/* Section Header (Collapsible) */}
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-2 -mx-2 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                {section.title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {completedInSection}/{sectionLessons.length} lessons
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </button>

                          {/* Section Lessons (Show when expanded) */}
                          {isExpanded && (
                            <div className="space-y-1 pl-2 mt-2">
                              {sectionLessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson) => {
                                  const isActive = currentLessonId === lesson.id;
                                  const isCompleted = completedLessons.has(lesson.id);
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => handleLessonClick(lesson.id, section.id)}
                                      className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                                        isActive
                                          ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold border-l-2 border-purple-600"
                                          : isCompleted
                                          ? "bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20"
                                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isCompleted ? (
                                          <Check className="w-3 h-3 shrink-0 text-green-600 dark:text-green-400" />
                                        ) : lesson.preview ? (
                                          <Play className="w-3 h-3 shrink-0" />
                                        ) : (
                                          <div className="w-3 h-3 shrink-0 rounded-full border border-slate-400" />
                                        )}
                                        <span className="flex-1 text-left truncate">
                                          {lesson.title}
                                        </span>
                                        {lesson.time && (
                                          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                                            {lesson.time}
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No lessons available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
