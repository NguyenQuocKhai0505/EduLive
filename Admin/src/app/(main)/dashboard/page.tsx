"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap } from "lucide-react";
import { getUsersByRole } from "../../../services/user.service";

export default function AdminDashboardPage() {
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const [studentsRes, teachersRes] = await Promise.all([
          getUsersByRole("student"),
          getUsersByRole("teacher"),
        ]);

        setStudentCount(studentsRes.data.length);
        setTeacherCount(teachersRes.data.length);
      } catch (err: any) {
        console.error("Error fetching user counts:", err);
        setError(err.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Dashboard
      </h1>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng tài khoản Student
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? (
                  <span className="text-sm text-slate-500">Đang tải...</span>
                ) : studentCount !== null ? (
                  studentCount.toLocaleString("vi-VN")
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng tài khoản Teacher
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? (
                  <span className="text-sm text-slate-500">Đang tải...</span>
                ) : teacherCount !== null ? (
                  teacherCount.toLocaleString("vi-VN")
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
