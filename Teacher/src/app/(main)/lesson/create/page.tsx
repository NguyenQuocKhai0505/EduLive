"use client"
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    preview:boolean
    order:number
}


const mockCourses: Course[] = [
    { id: 1, title: "ReactJS from Zero to Hero" },
    { id: 2, title: "UI/UX Design with Figma" },
  ];
  
  const mockSections: Section[] = [
    { id: 1, courseId: 1, title: "Intro React", order: 1 },
    { id: 2, courseId: 1, title: "Hooks", order: 2 },
    { id: 3, courseId: 2, title: "Figma Basics", order: 1 },
  ];
  
  const mockLessons: Lesson[] = [
    { id: 1, sectionId: 1, title: "What is React?", type: "video", preview: true, order: 1 },
    { id: 2, sectionId: 2, title: "useState Hook", type: "video", preview: false, order: 1 },
    { id: 3, sectionId: 3, title: "Figma Setup", type: "article", preview: false, order: 1 },
  ];
  
export default function LessonCreatePage(){
    const [courses] = useState<Course[]>(mockCourses);
    const [sections] = useState<Section[]>(mockSections);
    const [lessons,setLessons] = useState<Lesson[]>(mockLessons);

    const [selectedCourseId,setSelectedCourseId]=useState<number>(mockCourses[0]?.id ??0)
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [title,setTitle] = useState("")
    const [type,setType] = useState<"video" | "article" | "quiz">("video")
    const [videoUrl,setVideoUrl] = useState("")
    const [preview,setPreview] = useState(false)
    const [order,setOrder] = useState<number|"">("")

    const filteredSections = useMemo(() => sections.filter((s) => s.courseId === selectedCourseId),
    [sections,selectedCourseId]    
    )

    const filteredLessons = useMemo(() => lessons.filter((l)=>l.sectionId === selectedSectionId),[lessons,selectedSectionId])

    const handleCreateLesson = () =>{
        if(!selectedSectionId || !title.trim()) return
        const nextId = lessons.length >0 ? Math.max(...lessons.map((l)=>l.id)) + 1 : 1

        const newLesson: Lesson = {
            id:nextId,
            sectionId: selectedSectionId,
            title:title.trim(),
            type,
            videoUrl: type==="video" ? videoUrl.trim() : undefined,
            preview,
            order: order === "" ? 0 : Number(order),
        }
        setLessons((prev)=>[...prev,newLesson])
        setTitle("")
        setVideoUrl("")
        setPreview(false)
        setOrder("")
        setSelectedSectionId(null)
    }
    return (
        <div className="px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Lessons (Mock)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chọn khóa học → chọn section → thêm lesson.
            </p>
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
                  <label className="text-sm font-medium">Video URL</label>
                  <Input
                    value={videoUrl}
                    placeholder="https://..."
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              )}
    
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
              disabled={!selectedSectionId || !title.trim()}
            >
              Add Lesson
            </Button>
          </Card>
    
          {/* Lesson List */}
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Lesson List
            </h2>
    
            {filteredLessons.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No lessons yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {lesson.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        Type: {lesson.type} | Order: {lesson.order}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {lesson.preview ? "Preview" : "Private"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      );
}