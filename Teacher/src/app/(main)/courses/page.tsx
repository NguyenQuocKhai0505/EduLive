import { CourseList } from "../../components/courses/CourseList"
export default function CoursesPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Khóa học
      </h1>
      <CourseList />
    </div>
  )
}
