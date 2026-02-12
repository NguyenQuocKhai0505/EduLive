import { Star, AlertCircle } from "lucide-react";
import { formatRating } from "@/lib/utils";
export default function CourseHeader({ course }: { course: any }) {
  return (
    <div className="bg-slate-900 text-white py-6 sm:py-8 md:py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="text-blue-300 text-xs sm:text-sm font-medium flex gap-2 flex-wrap">
            <span className="cursor-pointer hover:underline">Development</span> / 
            <span className="cursor-pointer hover:underline">{course.category}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 line-clamp-2 sm:line-clamp-none">
            {course.authorName || course.instructor || "Unknown"}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm mt-3 sm:mt-4">
            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold text-xs uppercase">Bestseller</span>
            <div className="flex items-center text-amber-400 font-bold">
              <span className="text-base sm:text-lg text-slate-100 mr-1 sm:mr-2">{formatRating(course.rating)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />)}
              </div>
            </div>
            <span className="text-slate-300">{course.students?.toLocaleString()} students</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 pt-2 flex-wrap">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Last updated {course.lastUpdated} • {course.language}</span>
          </div>
        </div>
      </div>
    </div>
  );
}