"use client"
import { useMemo, useState } from "react";
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
import {useEffect} from "react"
import { getMyCourses } from "../../../../services/course.service";
import { getSectionsByCourse } from "../../../../services/section.service";
import{getLessonsBySection,createLesson,uploadLessonVideos}from "../../../../services/lesson.service";
import { toast } from "sonner";
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

    const filteredSections = useMemo(() => sections.filter((s) => s.courseId === selectedCourseId),
    [sections,selectedCourseId]    
    )

    const filteredLessons = useMemo(() => lessons.filter((l)=>l.sectionId === selectedSectionId),[lessons,selectedSectionId])

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
          setLessons([])
        }catch(error){
          toast.error("Failed to load sections")
        }
      }
      fetchSections()
    },[selectedCourseId])

    //Load lessons
    useEffect(()=>{
      if(!selectedCourseId || !selectedSectionId) return 
      const fetchLessons = async() =>{
        try{
          const res = await getLessonsBySection(selectedCourseId,selectedSectionId)
          setLessons(res.data)
        }catch(error){
          toast.error("Failed to load lessons")
        }
      }
      fetchLessons()
    },[selectedCourseId,selectedSectionId])

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

        const res = await getLessonsBySection(selectedCourseId,selectedSectionId)
        setLessons(res.data)
        toast.success("Lesson created successfully")
      }catch(error){
        toast.error("Failed to create lesson")
      }finally{
        setCreating(false)
      }
    }
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
                <label className="text-sm font-medium">Time (mm:ss)</label>
                <Input
                  value={time}
                  placeholder="05:00"
                  onChange={(e) => setTime(e.target.value)}
                />
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
                                {expandedSectionId === section.id &&
                                filteredLessons.length === 0 ? (
                                  <p className="text-sm text-slate-500">No lessons yet.</p>
                                ) : (
                                  filteredLessons
                                    .filter((lesson) => lesson.sectionId === section.id)
                                    .map((lesson) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                                      >
                                        <div>
                                          <div className="font-medium text-slate-900 dark:text-white">
                                            {lesson.title}
                                          </div>
                                          <div className="text-xs text-slate-500">
                                            Type: {lesson.type} | Order: {lesson.order}
                                            {lesson.time ? ` | Time: ${lesson.time}` : ""}
                                          </div>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                          {lesson.preview ? "Preview" : "Private"}
                                        </span>
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
        </div>
      );
}