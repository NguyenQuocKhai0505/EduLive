import { BookOpen, Users, DollarSign, ArrowUpRight } from "lucide-react";
import { CourseList } from "../../components/courses/CourseList";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
            Tổng quan
          </h2>
          <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
            Chào mừng trở lại! Đây là tình hình các khóa học của bạn.
          </p>
        </div>
        <button className="soft-gradient bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5">
          + Tạo khóa học mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card hover-lift p-6 rounded-2xl">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">
              Tổng số khóa học
            </h3>
            <BookOpen className="h-4 w-4 text-sky-600" />
          </div>
          <div className="flex items-center mt-2">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              12
            </div>
            <span className="ml-2 text-xs text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
              +2 <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
          </div>
        </div>

        <div className="glass-card hover-lift p-6 rounded-2xl">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">
              Tổng số học viên
            </h3>
            <Users className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex items-center mt-2">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              2,350
            </div>
            <span className="ml-2 text-xs text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
              +180 <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
          </div>
        </div>

        <div className="glass-card hover-lift p-6 rounded-2xl">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">
              Tổng doanh thu
            </h3>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex items-center mt-2">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              15.2M vnđ
            </div>
            <span className="ml-2 text-xs text-slate-500">
              trong tháng này
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card rounded-2xl">
          <div className="p-6 border-b border-slate-100/70 dark:border-slate-800/60">
            <h3 className="font-semibold text-slate-800 dark:text-white">
              Khóa học gần đây
            </h3>
          </div>
          <div className="p-6">
            <CourseList />
          </div>
        </div>
      </div>
    </div>
  );
}
