import { Star, AlertCircle } from "lucide-react";

export default function CourseHeader({ course }: { course: any }) {
  return (
    <div className="bg-slate-900 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="text-blue-300 text-sm font-medium flex gap-2">
            <span className="cursor-pointer hover:underline">Development</span> / 
            <span className="cursor-pointer hover:underline">{course.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
          <p className="text-lg text-slate-300 line-clamp-2">{course.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold text-xs uppercase">Bestseller</span>
            <div className="flex items-center text-amber-400 font-bold">
              <span className="text-lg text-slate-100 mr-2">{course.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
            </div>
            <span className="text-slate-300">{course.students?.toLocaleString()} students</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-300 pt-2">
            <AlertCircle className="w-4 h-4" />
            <span>Last updated {course.lastUpdated} • {course.language}</span>
          </div>
        </div>
      </div>
    </div>
  );
}