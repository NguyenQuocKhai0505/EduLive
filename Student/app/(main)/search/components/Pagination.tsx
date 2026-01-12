"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Hàm cn của bạn

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Nếu chỉ có 1 trang hoặc không có dữ liệu thì ẩn đi cho gọn
  if (totalPages <= 1) return null;

  // Hàm tạo URL mới khi bấm chuyển trang
  const createPageUrl = (pageNumber: number | string) => {
    // 1. Copy toàn bộ tham số hiện tại (ví dụ: ?level=Beginner&price=Free)
    const params = new URLSearchParams(searchParams.toString());
    
    // 2. Cập nhật tham số 'page'
    params.set("page", pageNumber.toString());
    
    // 3. Trả về chuỗi URL đầy đủ
    return `/search?${params.toString()}`;
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (pageNumber: number) => {
    router.push(createPageUrl(pageNumber));
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {/* Nút Previous (Lùi lại) */}
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="p-2 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </button>

      {/* Danh sách các con số trang */}
      {/* Ở đây mình làm đơn giản: Render từ 1 đến totalPages */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={cn(
            "w-10 h-10 rounded-md font-medium text-sm transition-colors border",
            currentPage === page
              ? "bg-slate-900 text-white border-slate-900" // Style trang hiện tại
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          )}
        >
          {page}
        </button>
      ))}

      {/* Nút Next (Tiếp theo) */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="p-2 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </button>
    </div>
  );
}