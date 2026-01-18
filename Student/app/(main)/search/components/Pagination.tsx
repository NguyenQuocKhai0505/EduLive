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
    return `/courses?${params.toString()}`;
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (pageNumber: number) => {
    router.push(createPageUrl(pageNumber));
  };

  // Tính toán số trang hiển thị (responsive)
  const getVisiblePages = () => {
    const maxVisible = 5; // Số trang tối đa hiển thị
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages: (number | string)[] = [];
    if (currentPage <= 3) {
      // Hiển thị: 1, 2, 3, 4, 5, ..., totalPages
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Hiển thị: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      // Hiển thị: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
      pages.push(1);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-10 flex-wrap">
      {/* Nút Previous (Lùi lại) */}
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="p-1.5 sm:p-2 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Danh sách các con số trang */}
      {getVisiblePages().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400 dark:text-slate-500">
              ...
            </span>
          );
        }
        
        return (
          <button
            key={page}
            onClick={() => handlePageChange(page as number)}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-md font-medium text-xs sm:text-sm transition-colors border",
              currentPage === page
                ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Nút Next (Tiếp theo) */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="p-1.5 sm:p-2 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
      </button>
    </div>
  );
}