"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUsersByRole } from "../../../services/user.service";

export type UserInfo = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt?: string;
};

function AccountTable({
  title,
  data,
  loading,
  onToggle,
}: {
  title: string;
  data: UserInfo[];
  loading: boolean;
  onToggle: (id: number, isActive: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <h2 className="px-4 py-3 text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Tên</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Email</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Role</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                    {row.fullName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700 dark:text-slate-300">
                      {row.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={row.isActive ? "destructive" : "outline"}
                      onClick={() => onToggle(row.id, row.isActive)}
                    >
                      {row.isActive ? "Khóa" : "Mở khóa"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ManageAccountPage() {
  const [students, setStudents] = useState<UserInfo[]>([]);
  const [teachers, setTeachers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const [studentRes, teacherRes] = await Promise.all([
          getUsersByRole("student"),
          getUsersByRole("teacher"),
        ]);

        // Map data từ API response (có fullName và isActive)
        const mapUserData = (users: any[]): UserInfo[] => {
          return users.map((user) => ({
            id: user.id,
            fullName: user.fullName || user.name || "N/A",
            email: user.email,
            role: user.role,
            isActive: user.isActive !== undefined ? user.isActive : true,
            avatar: user.avatar,
            createdAt: user.createdAt,
          }));
        };

        setStudents(mapUserData(studentRes.data));
        setTeachers(mapUserData(teacherRes.data));
      } catch (error: any) {
        console.error("Error fetching users:", error);
        setError(error.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggle = (
    id: number,
    isActive: boolean,
    setter: React.Dispatch<React.SetStateAction<UserInfo[]>>
  ) => {
    setter((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a))
    );
    // TODO: Gọi API để update isActive trên server
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Quản lý tài khoản
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        Bật/tắt trạng thái hoạt động của tài khoản.
      </p>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <AccountTable
        title="Student"
        data={students}
        loading={loading}
        onToggle={(id, isActive) => handleToggle(id, isActive, setStudents)}
      />
      <AccountTable
        title="Teacher"
        data={teachers}
        loading={loading}
        onToggle={(id, isActive) => handleToggle(id, isActive, setTeachers)}
      />
    </div>
  );
}
