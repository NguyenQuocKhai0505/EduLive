import { Play, AlertCircle, MonitorPlay, FileText, Trophy, Infinity } from "lucide-react";

export default function CourseSidebar({ course }: { course: any }) {
  return (
    <div className="sticky top-24 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      {/* Video Preview */}
      <div className="relative aspect-video group cursor-pointer">
        <img src={course.thumbnail} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg pl-1 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-black fill-black" />
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-sm">
            Preview this course
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{course.price}</span>
          <span className="text-slate-400 line-through text-lg">{course.originalPrice}</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{course.discount} off</span>
        </div>
        
        <div className="text-red-600 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>2 days left at this price!</span>
        </div>

        <div className="space-y-3">
          <button className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
            Add to cart
          </button>
          <button className="w-full h-12 text-lg font-bold border border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors">
            Buy now
          </button>
        </div>
        
        <div className="text-center text-xs text-slate-500">30-Day Money-Back Guarantee</div>
        
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">This course includes:</h4>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <li className="flex items-center gap-3"><MonitorPlay className="w-4 h-4" /> {course.duration} on-demand video</li>
            <li className="flex items-center gap-3"><FileText className="w-4 h-4" /> {course.lectures} articles</li>
            <li className="flex items-center gap-3"><Trophy className="w-4 h-4" /> Certificate of completion</li>
            <li className="flex items-center gap-3"><Infinity className="w-4 h-4" /> Full lifetime access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}