"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, X } from "lucide-react";

type PendingCourse = {
  id: number;
  title: string;
  instructorName: string;
  sectionsCount: number;
  lessonsCount: number;
};

const mockPending: PendingCourse[] = [
  { id: 1, title: "Khóa học mẫu A", instructorName: "GV A", sectionsCount: 3, lessonsCount: 12 },
  { id: 2, title: "Khóa học mẫu B", instructorName: "GV B", sectionsCount: 2, lessonsCount: 8 },
];

export default function ToggleCoursePage() {
  const [courses, setCourses] = useState<PendingCourse[]>(mockPending);

  const handleActivate = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReject = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Duyệt khóa học
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        Các khóa học chờ kích hoạt (isActive = false). UI mẫu — chưa kết nối API.
      </p>
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Không có khóa học nào chờ duyệt.
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      GV: {course.instructorName} · {course.sectionsCount} section, {course.lessonsCount} lesson
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
