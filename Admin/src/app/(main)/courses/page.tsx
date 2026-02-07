"use client";


import { Button } from "@/components/ui/button";
import { BookOpen, Check, X, ChevronDown, ChevronRight, FileText, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getPendingCourses, getCourseSections, getSectionLessons, acceptCourse, rejectCourse } from "../../../services/course.service";
import { toast } from "sonner";

//TYPE SECTIONS - khớp DB, có thể kèm lessons khi đã load
type SectionWithLessons = {
  id: number;
  title: string;
  courseId: number;
  order: number;
  createdAt?: string;
  updateAt?: string;
  lessons?: Lesson[];
}

//TYPE LESSONS - khớp DB: id, title, sectionId, order, time, type, preview, videoUrl, createdAt, updateAt
type Lesson = {
  id: number;
  title: string;
  sectionId: number;
  order: number;
  time?: string; // DB: varchar "20:00", không phải duration (number)
  type?: "video" | "article" | "quiz";
  preview?: boolean;
  videoUrl?: string;
  createdAt?: string;
  updateAt?: string;
}

//TYPE PENDING COURSE 
type PendingCourse = {
  id:number 
  title:string 
  instructorName:string
  sectionsCount:number 
  lessonsCount:number 

  sections?: SectionWithLessons[];
  isLoadingSections?: boolean;
}


export default function ToggleCoursePage() {
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string | null>(null);

  // FETCH PENDING COURSES 
  useEffect(()=>{
    const fetchPendingCourses = async () =>{
      try{
        setLoading(true)
        setError(null)
        const response = await getPendingCourses()
        
        // Map data từ API response (backend trả về relations: instructor, category, sections, sections.lessons)
        const mappedCourses: PendingCourse[] = response.data.map((course: any) => {
          const sectionsRaw = course.sections ?? [];
          const sectionsCount = sectionsRaw.length;
          const lessonsCount =
            sectionsRaw.reduce((sum: number, s: any) => sum + (s.lessons?.length ?? 0), 0) ?? 0;
          const sections: SectionWithLessons[] = sectionsRaw.map((s: any) => ({
            id: s.id,
            title: s.title,
            courseId: s.courseId,
            order: s.order ?? 0,
            createdAt: s.createdAt,
            updateAt: s.updateAt,
            lessons: s.lessons ?? [],
          }));
          return {
            id: course.id,
            title: course.title,
            instructorName: course.instructor?.fullName ?? "N/A",
            sectionsCount,
            lessonsCount,
            sections: sections.length > 0 ? sections : undefined,
            isLoadingSections: false,
          };
        });
        setCourses(mappedCourses)
      } catch (error) {
        setError("Lỗi khi tải khóa học chờ duyệt")
        toast.error("Lỗi khi tải khóa học chờ duyệt")
      } finally {
        setLoading(false)
      }
    }
    fetchPendingCourses()
  },[])

  // LOAD SECTIONS AND LESSONS FOR A COURSE
  const loadCourseDetails = async (courseId: number) => {
    try {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isLoadingSections: true } : c))
      );
      const sectionsResponse = await getCourseSections(courseId);
      const sections: SectionWithLessons[] = sectionsResponse.data;
      const lessonsPromises = sections.map(async (section) => {
        const lessonsResponse = await getSectionLessons(section.id);
        return { ...section, lessons: (lessonsResponse.data as Lesson[]) ?? [] };
      });
      const sectionWithLessons = await Promise.all(lessonsPromises);
      const totalLessons = sectionWithLessons.reduce(
        (sum, s) => sum + (s.lessons?.length ?? 0),
        0
      );
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, sections: sectionWithLessons, lessonsCount: totalLessons, isLoadingSections: false }
            : c
        )
      );
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết khóa học");
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isLoadingSections: false } : c))
      );
    }
  };

  // Accordion: course nào đang mở (sổ xuống sections)
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  // Accordion: section nào đang mở (sổ xuống lessons)
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<number>>(new Set());
  // Modal xem video: lesson đang chọn để phát
  const [videoModal, setVideoModal] = useState<{ lessonTitle: string; videoUrl: string } | null>(null);

  const isYouTubeUrl = (url: string) =>
    /youtube\.com|youtu\.be/i.test(url);
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  const openVideo = (lesson: Lesson) => {
    if (lesson.videoUrl) setVideoModal({ lessonTitle: lesson.title, videoUrl: lesson.videoUrl });
    else toast.error("Bài học này chưa có video.");
  };

  const toggleCourse = (course: PendingCourse) => {
    if (expandedCourseId === course.id) {
      setExpandedCourseId(null);
      setExpandedSectionIds(new Set());
      return;
    }
    setExpandedCourseId(course.id);
    setExpandedSectionIds(new Set());
    if (!course.sections || course.sections.length === 0) {
      loadCourseDetails(course.id);
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // HANDLE ACTIVATE COURSE
  const handleActivate = async(id: number) => {
    try{
      await acceptCourse(id)
      toast.success("Accepted course successfully")

      //REMOVE COURSE FROM LIST 
      setCourses((prev) => prev.filter((course) => course.id !== id))
    }catch(error:any){
      toast.error(error.response?.data?.message || "Cannot accept this course")
    }
  }

  const handleReject = async (id: number) => {
    try{
      await rejectCourse(id)
      toast.success("Rejected course successfully")

      //REMOVE COURSE FROM LIST 
      setCourses((prev) => prev.filter((course) => course.id !== id))
    }catch(error:any){
      toast.error(error.response?.data?.message || "Cannot reject this course")
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Duyệt khóa học
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        Các khóa học chờ kích hoạt (isActive = false).
      </p>
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Không có khóa học nào chờ duyệt.
          </div>
        ) : (
          courses.map((course) => {
            const isCourseExpanded = expandedCourseId === course.id;
            const hasSections = (course.sections?.length ?? 0) > 0;
            const showSections = isCourseExpanded && (hasSections || course.isLoadingSections);

            return (
              <div
                key={course.id}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 p-4">
                  <div
                    className="flex gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleCourse(course)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {isCourseExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        GV: {course.instructorName} · {course.sectionsCount} section, {course.lessonsCount} lesson
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleActivate(course.id)}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" /> Kích hoạt
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(course.id)}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" /> Từ chối
                    </Button>
                  </div>
                </div>

                {showSections && (
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    {course.isLoadingSections ? (
                      <div className="p-4 text-sm text-slate-500">Đang tải sections...</div>
                    ) : (
                      <div className="p-4 pt-0 space-y-2">
                        {(course.sections ?? []).sort((a, b) => a.order - b.order).map((section) => {
                          const isSectionExpanded = expandedSectionIds.has(section.id);
                          const lessonCount = section.lessons?.length ?? 0;
                          return (
                            <div
                              key={section.id}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            >
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                onClick={() => toggleSection(section.id)}
                              >
                                {isSectionExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                                )}
                                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {section.title}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({lessonCount} lesson)
                                </span>
                              </div>
                              {isSectionExpanded && section.lessons && section.lessons.length > 0 && (
                                <div className="border-t border-slate-100 dark:border-slate-800 pl-8 pr-3 py-2 space-y-1">
                                  {section.lessons
                                    .sort((a, b) => a.order - b.order)
                                    .map((lesson) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 py-1.5 group"
                                      >
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openVideo(lesson);
                                          }}
                                          className="flex items-center gap-2 flex-1 min-w-0 text-left rounded px-2 py-1 -mx-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                                          title={lesson.videoUrl ? "Xem video" : "Chưa có video"}
                                        >
                                          <PlayCircle className="h-4 w-4 text-slate-400 shrink-0 group-hover:text-amber-500" />
                                          <span className="truncate">{lesson.title}</span>
                                          {lesson.time && (
                                            <span className="text-xs text-slate-500 shrink-0">
                                              · {lesson.time}
                                            </span>
                                          )}
                                          {lesson.videoUrl && (
                                            <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0">
                                              Video Available
                                            </span>
                                          )}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal xem video (chạy trong nền / overlay) */}
      {videoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setVideoModal(null)}
        >
          <div
            className="bg-slate-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
              <span className="font-medium text-white truncate">{videoModal.lessonTitle}</span>
              <button
                type="button"
                onClick={() => setVideoModal(null)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black">
              {isYouTubeUrl(videoModal.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(videoModal.videoUrl)}
                  title={videoModal.lessonTitle}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoModal.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onEnded={() => {}}
                >
                  Trình duyệt không hỗ trợ phát video.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
