"use client"; // 👈 1. QUAN TRỌNG NHẤT: Thêm dòng này ở đầu file

import { ShoppingCart, Star, Heart } from "lucide-react";
// Nếu lỗi React không tìm thấy, có thể cần import React (tùy version)
import React from "react"; 
import Link from "next/link"; // Import Link để bọc ảnh và tiêu đề
import AddToCartButton from "./AddToCartButton";
interface CourseCardProps {
  item: any;
}

export default function CourseCard({ item }: CourseCardProps) {
  
  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn sự kiện nổi bọt
    e.stopPropagation(); // Đảm bảo không kích hoạt Link cha (nếu có)
    console.log("Add to cart:", item.id);
  };

  const handleToggleWishList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle Wishlist:", item.id);
  };

  return (
    <div className="group flex flex-col gap-2 sm:gap-3 h-full bg-white dark:bg-slate-900 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="overflow-hidden rounded-lg aspect-video border border-slate-200 dark:border-slate-700 relative">
        {/* Bọc Link quanh ảnh */}
        <Link href={`/course/${item.id}`} className="block w-full h-full">
            <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Lớp phủ đen nhẹ khi hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </Link>
        
        {/* Nút Tim (Wishlist) */}
        <button 
            onClick={handleToggleWishList}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        >
            <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1.5 flex-1">
          {/* Bọc Link quanh tiêu đề */}
          <Link href={`/courses/${item.id}`}>
            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug min-h-[2.75rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
            </h4>
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 truncate">{item.instructor || "Unknown"}</p>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-bold text-sm text-amber-500 dark:text-amber-400">{item.rating || 0}</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(item.rating || 0)
                        ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                        : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            {item.students && (
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                ({item.students.toLocaleString()})
              </span>
            )}
            {item.lectures && (
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {item.lectures} lectures
              </span>
            )}
          </div>
        </div>

        {/* Footer: Giá & Nút Add Cart */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
           <div className="flex items-baseline gap-1.5 flex-shrink-0 min-w-0">
            <span className="font-bold text-base text-slate-900 dark:text-white whitespace-nowrap">
                {item.price}
            </span>
            {item.originalPrice && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through whitespace-nowrap">
                {item.originalPrice}
                </span>
            )}
          </div>
          
          {/* Nút Add To Cart */}
          <div className="flex-shrink-0">
                <AddToCartButton course={item} />
            </div>
        </div>
      </div>
    </div>
  );
}