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
    <div className="group flex flex-col gap-2 h-full">
      {/* Thumbnail */}
      <div className="overflow-hidden rounded-lg aspect-video border border-slate-200 dark:border-slate-800 relative">
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
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Bọc Link quanh tiêu đề */}
          <Link href={`/course/${item.id}`}>
            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                {item.title}
            </h4>
          </Link>

          <p className="text-xs text-slate-500 mt-1">{item.instructor}</p>

          <div className="flex items-center gap-1 mt-1">
            <span className="font-bold text-sm text-amber-500">{item.rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(item.rating)
                      ? "fill-amber-500 text-amber-500"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            {item.students && (
              <span className="text-xs text-slate-400">
                ({item.students.toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* Footer: Giá & Nút Add Cart */}
        <div className="flex items-center justify-between mt-2">
           <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
                {item.price}
            </span>
            {item.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                {item.originalPrice}
                </span>
            )}
          </div>
          
          {/* Nút Add To Cart */}
          <div className="w-32"> {/* Giới hạn chiều rộng nút nếu cần */}
                <AddToCartButton course={item} />
            </div>
        </div>
      </div>
    </div>
  );
}