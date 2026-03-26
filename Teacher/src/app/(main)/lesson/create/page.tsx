"use client";
import { useMemo, useState, useEffect, useCallback} from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMyCourses } from "../../../../services/course.service";
import { getSectionsByCourse } from "../../../../services/section.service";
import {
  getLessonsBySection,
  createLesson,
  uploadLessonVideos,
  updateLesson,
  deleteLesson,
  type LessonPayload,
} from "../../../../services/lesson.service";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
type Course = {
    id:number
    title:string
}

type Section ={
    id:number
    courseId:number
    title:string
    order:number
}

type Lesson = {
    id:number 
    sectionId:number
    title:string
    type:"video" | "article" | "quiz"
    videoUrl?:string
    content?:string
    time?:string
    preview:boolean
    order:number
}

export default function LessonCreatePage(){
    const [courses,setCourses] = useState<Course[]>([]);
    const [sections,setSections] = useState<Section[]>([]);
    const [lessons,setLessons] = useState<Lesson[]>([]);

    const [selectedCourseId,setSelectedCourseId]=useState<number>()
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [title,setTitle] = useState("")
    const [type,setType] = useState<"video" | "article" | "quiz">("video")
    const [content,setContent] = useState("")
    const [time,setTime] = useState("")
    const [preview,setPreview] = useState(false)
    const [order,setOrder] = useState<number|"">("")
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [creating, setCreating] = useState(false);
    const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
    const [expandedSectionId, setExpandedSectionId] = useState<number | null>(null);

    const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
    const [editLessonTitle, setEditLessonTitle] = useState("");
    const [editLessonType, setEditLessonType] =
      useState<Lesson["type"]>("video");
    const [editLessonContent, setEditLessonContent] = useState("");
    const [editLessonTime, setEditLessonTime] = useState("");
    const [editLessonOrder, setEditLessonOrder] = useState<number | "">("");
    const [editLessonPreview, setEditLessonPreview] = useState(false);
    const [editLessonVideoFile, setEditLessonVideoFile] =
      useState<File | null>(null);
    const [savingLesson, setSavingLesson] = useState(false);

    const filteredSections = useMemo(
      () => sections.filter((s) => s.courseId === selectedCourseId),
      [sections, selectedCourseId]
    );

    const reloadAllLessons = useCallback(async () => {
      if (!selectedCourseId) {
        setLessons([]);
        return;
      }
      const secs = sections.filter((s) => s.courseId === selectedCourseId);
      if (secs.length === 0) {
        setLessons([]);
        return;
      }
      try {
        const all: Lesson[] = [];
        for (const s of secs) {
          const res = await getLessonsBySection(selectedCourseId, s.id);
          all.push(...res.data);
        }
        setLessons(all);
      } catch {
        toast.error("Không tải được danh sách lesson");
      }
    }, [selectedCourseId, sections]);

    useEffect(() => {
      if (lessonToEdit) {
        setEditLessonTitle(lessonToEdit.title);
        setEditLessonType(lessonToEdit.type);
        setEditLessonContent(lessonToEdit.content ?? "");
        setEditLessonTime(lessonToEdit.time ?? "");
        setEditLessonOrder(lessonToEdit.order);
        setEditLessonPreview(lessonToEdit.preview);
        setEditLessonVideoFile(null);
      }
    }, [lessonToEdit]);

    //Load courses 
    useEffect(()=>{
      const fetchCourses = async() =>{
        try{
          const res = await getMyCourses();
          setCourses(res.data)
          if(res.data.length > 0){
            setSelectedCourseId(res.data[0].id)
          }
        }catch(error){
          toast.error("Failed to load courses")
        }
      }
      fetchCourses()
    },[])

    // Load Sections
    useEffect(()=>{
      if(!selectedCourseId) return 
      const fetchSections = async()=>{
        try{
          const res = await getSectionsByCourse(selectedCourseId)
          setSections(res.data)
          const firstSectionId = res.data.length > 0 ? res.data[0].id : null
          setSelectedSectionId(firstSectionId)
          setExpandedSectionId(firstSectionId)
        }catch(error){
          toast.error("Failed to load sections")
        }
      }
      fetchSections()
    },[selectedCourseId])

    useEffect(() => {
      void reloadAllLessons();
    }, [reloadAllLessons]);

    //Handle create lessons
    const handleCreateLesson = async () =>{
      if(!selectedCourseId || !selectedSectionId || !title.trim()) return 
      if(type==="video" && !videoFile){
        toast.error("Please select a video file")
        return
      }
      setCreating(true)

      try{
        let uploadedVideoUrl: string | undefined 
        
        if(type==="video"){
          const uploadRes = await uploadLessonVideos([videoFile!])
          uploadedVideoUrl = uploadRes.data.urls?.[0]
          if(!uploadedVideoUrl){
            toast.error("Failed to upload video")
            return
          }
        }

        await createLesson(selectedCourseId,selectedSectionId,{
          title:title.trim(),
          type,
          videoUrl: type === "video" ? uploadedVideoUrl : undefined,
          content:type !== "video" ? content.trim() : undefined,
          time: time.trim() || undefined,
          preview,
          order: order === "" ? 0 : Number(order)
        })
        setTitle("")
        setContent("")
        setVideoFile(null),
        setTime(""),
        setPreview(false),
        setOrder("")

        await reloadAllLessons();
        toast.success("Lesson created successfully")
      }catch(error: unknown){
        const ax = error as {
          response?: { data?: { message?: string | string[] } };
          message?: string;
        };
        let msg = "Không tạo được lesson";
        const m = ax.response?.data?.message;
        if (Array.isArray(m)) msg = m.join(", ");
        else if (typeof m === "string") msg = m;
        else if (ax.message) msg = ax.message;
        toast.error(msg);
      }finally{
        setCreating(false)
      }
    }

    const handleSaveLessonEdit = async () => {
      if (!lessonToEdit || !selectedCourseId || !editLessonTitle.trim()) return;
      if (editLessonType === "video" && !lessonToEdit.videoUrl && !editLessonVideoFile) {
        toast.error("Lesson video cần file hoặc URL đã có — hãy chọn video mới");
        return;
      }
      setSavingLesson(true);
      try {
        let newVideoUrl: string | undefined;
        if (editLessonType === "video" && editLessonVideoFile) {
          const uploadRes = await uploadLessonVideos([editLessonVideoFile]);
          newVideoUrl = uploadRes.data.urls?.[0];
          if (!newVideoUrl) {
            toast.error("Upload video thất bại");
            return;
          }
        }

        const payload: Partial<LessonPayload> = {
          title: editLessonTitle.trim(),
          type: editLessonType,
          time: editLessonTime.trim() || undefined,
          order:
            editLessonOrder === "" ? lessonToEdit.order : Number(editLessonOrder),
          preview: editLessonPreview,
        };
        if (editLessonType === "video") {
          if (newVideoUrl) payload.videoUrl = newVideoUrl;
        } else {
          payload.content = editLessonContent.trim() || undefined;
        }

        await updateLesson(
          selectedCourseId,
          lessonToEdit.sectionId,
          lessonToEdit.id,
          payload
        );
        await reloadAllLessons();
        setLessonToEdit(null);
        toast.success("Đã cập nhật lesson");
      } catch {
        toast.error("Không cập nhật được lesson");
      } finally {
        setSavingLesson(false);
      }
    };

    const handleDeleteLesson = async (lesson: Lesson) => {
      if (!selectedCourseId) return;
      if (!confirm(`Xóa lesson "${lesson.title}"?`)) return;
      try {
        await deleteLesson(selectedCourseId, lesson.sectionId, lesson.id);
        await reloadAllLessons();
        toast.success("Đã xóa lesson");
      } catch {
        toast.error("Không xóa được lesson");
      }
    };

    return (
        <div className="px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Lessons
            </h1>
          </div>
    
          {/* Select Course */}
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <label className="text-sm font-medium">Select Course</label>
            <Select
              value={String(selectedCourseId)}
              onValueChange={(value) => {
                setSelectedCourseId(Number(value));
                setSelectedSectionId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
    
          {/* Select Section */}
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <label className="text-sm font-medium">Select Section</label>
            <Select
              value={selectedSectionId ? String(selectedSectionId) : ""}
              onValueChange={(value) => setSelectedSectionId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a section" />
              </SelectTrigger>
              <SelectContent>
                {filteredSections.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
    
          {/* Create Lesson */}
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Add Lesson
            </h2>
    
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  placeholder="Lesson title"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={(value) => setType(value as Lesson["type"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
    
              {type === "video" && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Video File</label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Video dài (vài GB) có thể upload 10–60+ phút — giữ tab mở. Giới hạn mặc định
                    server 1GB/file (tăng bằng LESSON_UPLOAD_MAX_FILE_BYTES trên Render nếu cần).
                  </p>
                </div>
              )}

              {type !== "video" && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    rows={4}
                    value={content}
                    placeholder="Lesson content"
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              )}
    
              <div>
                <label className="text-sm font-medium">
                  Thời lượng hiển thị (tùy chọn)
                </label>
                <Input
                  value={time}
                  placeholder="110:00 — ~1h50 (phút:giây)"
                  onChange={(e) => setTime(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Chỉ là nhãn cho học viên; có thể để trống. Ví dụ ~1h50 →{" "}
                  <span className="font-mono">110:00</span>.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Order</label>
                <Input
                  type="number"
                  value={order}
                  placeholder="0"
                  onChange={(e) =>
                    setOrder(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </div>
    
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preview}
                    onChange={(e) => setPreview(e.target.checked)}
                  />
                  Preview lesson
                </label>
              </div>
            </div>
    
            <Button
              className="mt-4"
              onClick={handleCreateLesson}
              disabled={creating || !selectedSectionId || !title.trim()}
            >
              {creating ? "Creating..." : "Add Lesson"}
            </Button>
          </Card>
    
          {/* Lesson List */}
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Lesson List
            </h2>
            <div className="mt-4 space-y-3">
              {courses.length === 0 ? (
                <p className="text-sm text-slate-500">No courses yet.</p>
              ) : (
                courses.map((course) => (
                  <details
                    key={course.id}
                    open={expandedCourseId === course.id}
                    className="rounded-md border border-slate-200 dark:border-slate-800"
                  >
                    <summary
                      className={`cursor-pointer select-none px-3 py-2 text-sm ${
                        selectedCourseId === course.id
                          ? "text-slate-100"
                          : "text-slate-300"
                      }`}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setExpandedCourseId((prev) =>
                          prev === course.id ? null : course.id
                        );
                        setExpandedSectionId(null);
                      }}
                    >
                      {course.title}
                    </summary>

                    <div className="space-y-2 px-4 pb-3 pt-1">
                      {sections.filter((s) => s.courseId === course.id).length === 0 ? (
                        <p className="text-sm text-slate-500">No sections in this course.</p>
                      ) : (
                        sections
                          .filter((s) => s.courseId === course.id)
                          .map((section) => (
                            <details
                              key={section.id}
                              open={expandedSectionId === section.id}
                              className="rounded-md border border-slate-200 dark:border-slate-800"
                            >
                              <summary
                                className={`cursor-pointer select-none px-3 py-2 text-sm ${
                                  selectedSectionId === section.id
                                    ? "text-slate-100"
                                    : "text-slate-300"
                                }`}
                                onClick={() => {
                                  setSelectedSectionId(section.id);
                                  setExpandedSectionId((prev) =>
                                    prev === section.id ? null : section.id
                                  );
                                }}
                              >
                                {section.title}
                              </summary>

                              <div className="space-y-2 px-4 pb-3 pt-1">
                                {lessons.filter((l) => l.sectionId === section.id)
                                  .length === 0 ? (
                                  <p className="text-sm text-slate-500">No lessons yet.</p>
                                ) : (
                                  lessons
                                    .filter((lesson) => lesson.sectionId === section.id)
                                    .map((lesson) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                                      >
                                        <div className="min-w-0">
                                          <div className="font-medium text-slate-900 dark:text-white">
                                            {lesson.title}
                                          </div>
                                          <div className="text-xs text-slate-500">
                                            Type: {lesson.type} | Order: {lesson.order}
                                            {lesson.time ? ` | Time: ${lesson.time}` : ""}
                                          </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                          <span className="text-xs text-slate-400">
                                            {lesson.preview ? "Preview" : "Private"}
                                          </span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            aria-label="Sửa lesson"
                                            onClick={() => setLessonToEdit(lesson)}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700"
                                            aria-label="Xóa lesson"
                                            onClick={() => void handleDeleteLesson(lesson)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                )}
                              </div>
                            </details>
                          ))
                      )}
                    </div>
                  </details>
                ))
              )}
            </div>
          </Card>

          <Dialog
            open={!!lessonToEdit}
            onOpenChange={(open) => !open && setLessonToEdit(null)}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto dark:border-slate-800 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Sửa lesson</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div>
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input
                    value={editLessonTitle}
                    onChange={(e) => setEditLessonTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Loại</label>
                  <Select
                    value={editLessonType}
                    onValueChange={(v) =>
                      setEditLessonType(v as Lesson["type"])
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editLessonType === "video" && (
                  <div>
                    <label className="text-sm font-medium">
                      Video mới (tùy chọn)
                    </label>
                    <Input
                      type="file"
                      accept="video/*"
                      className="mt-1"
                      onChange={(e) =>
                        setEditLessonVideoFile(e.target.files?.[0] ?? null)
                      }
                    />
                    {lessonToEdit?.videoUrl && !editLessonVideoFile ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Đang dùng video hiện tại. Chọn file để thay thế.
                      </p>
                    ) : null}
                  </div>
                )}
                {editLessonType !== "video" && (
                  <div>
                    <label className="text-sm font-medium">Nội dung</label>
                    <Textarea
                      rows={4}
                      value={editLessonContent}
                      onChange={(e) => setEditLessonContent(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Thời lượng</label>
                    <Input
                      value={editLessonTime}
                      placeholder="05:00"
                      onChange={(e) => setEditLessonTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Thứ tự</label>
                    <Input
                      type="number"
                      value={editLessonOrder}
                      onChange={(e) =>
                        setEditLessonOrder(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editLessonPreview}
                    onChange={(e) => setEditLessonPreview(e.target.checked)}
                  />
                  Preview (học thử)
                </label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLessonToEdit(null)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  disabled={savingLesson || !editLessonTitle.trim()}
                  onClick={() => void handleSaveLessonEdit()}
                >
                  {savingLesson ? "Đang lưu..." : "Lưu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
}