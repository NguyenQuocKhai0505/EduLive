"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCourse, getMyCourses } from "../../../services/course.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { normalizeMediaUrl } from "@/lib/media-url";
type CourseCategory = {
  id: number;
  name: string;
  image?: string | null;
};

type Course = {
  id: number;
  title: string;
  thumbnail?: string | null;
  price: number | string;
  students?: number | null;
  isPublished?: boolean;
  isActive?: boolean;
  category?: CourseCategory | null;
};

const formatCurrency = (value: number | string) => {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (!numeric) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numeric);
};

export const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyCourses();
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? [];
      setCourses(list);
    } catch (error) {
      console.error("Error fetching courses", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const handleEdit = (courseId: number) => {
    router.push(`courses/${courseId}/edit`);
  };

  const handleDelete = async (courseId: number, courseTitle: string) => {
    if (
      !confirm(
        `Delete course "${courseTitle}"? Sections and lessons will be removed. This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted");
      await loadCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khóa học</TableHead>
              <TableHead className="hidden lg:table-cell">Danh mục</TableHead>
              <TableHead className="hidden sm:table-cell">Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden md:table-cell">Học viên</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  Chưa có khóa học nào.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => {
                const thumbUrl = normalizeMediaUrl(course.thumbnail);
                const categoryImgUrl = normalizeMediaUrl(
                  course.category?.image ?? null
                );
                return (
              <TableRow key={course.id}>
                <TableCell className="min-w-[240px]">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-20 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt={course.title}
                          width={80}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-500 dark:bg-slate-900">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white">
                        {course.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ID: #{course.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="h-7 w-7 overflow-hidden rounded-full border border-slate-200 dark:border-slate-800">
                      {categoryImgUrl ? (
                        <Image
                          src={categoryImgUrl}
                          alt={course.category?.name ?? "Danh mục"}
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {course.category?.name?.[0] ?? "C"}
                          </span>
                        </div>
                      )}
                    </div>
                    <span>{course.category?.name ?? "Chưa phân loại"}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-slate-600 dark:text-slate-300">
                  {formatCurrency(course.price)}
                </TableCell>
                <TableCell>
                  {!course.isActive ? (
                    <Badge variant="secondary">Chờ duyệt</Badge>
                  ) : course.isPublished ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      Đã xuất bản
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Bản nháp</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-300">
                  {course.students ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label="Edit course" onClick={() => handleEdit(course.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      aria-label="Delete course"
                      onClick={() =>
                        void handleDelete(course.id, course.title)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row dark:border-slate-800 dark:text-slate-400">
        <span>Hiển thị {courses.length} trên {courses.length} khóa học</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};