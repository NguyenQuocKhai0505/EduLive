import Image from "next/image";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Palette,
  Languages,
} from "lucide-react";
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

const formatCurrency = (value: number) => {
  if (value === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const courses = [
  {
    id: 1,
    title: "Lập trình ReactJS từ cơ bản đến nâng cao",
    price: 1200000,
    status: "Published",
    sales: 120,
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    category: {
      name: "Web Development",
      icon: Code2,
    },
  },
  {
    id: 2,
    title: "Thành thạo Tiếng Anh giao tiếp trong 30 ngày",
    price: 899000,
    status: "Draft",
    sales: 0,
    thumbnail: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=800&auto=format&fit=crop",
    category: {
      name: "Language",
      icon: Languages,
    },
  },
  {
    id: 3,
    title: "Thiết kế UI/UX với Figma cho người mới",
    price: 0,
    status: "Published",
    sales: 850,
    thumbnail: "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=800&auto=format&fit=crop",
    category: {
      name: "Design",
      image: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=200&auto=format&fit=crop",
      icon: Palette,
    },
  },
];

export const CourseList = () => {
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
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="min-w-[240px]">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-20 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={80}
                        height={48}
                        className="h-full w-full object-cover"
                      />
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
                      {course.category.image ? (
                        <Image
                          src={course.category.image}
                          alt={course.category.name}
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
                          <course.category.icon className="h-4 w-4 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <span>{course.category.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-slate-600 dark:text-slate-300">
                  {formatCurrency(course.price)}
                </TableCell>
                <TableCell>
                  {course.status === "Published" ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      Đã xuất bản
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Bản nháp</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-300">
                  {course.sales}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label="Edit course">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      aria-label="Delete course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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