"use client";

import { CheckCircle, X } from "lucide-react";
import { Course } from "@/lib/types/course.types";
import { useRouter } from "next/navigation";

interface AddedToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

export default function AddedToCartModal({ isOpen, onClose, course }: AddedToCartModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-2xl max-w-md w-full mx-4 relative">
        
        {/* Header Modal */}
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h3 className="font-bold text-lg dark:text-white">Added to cart</h3>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin khóa học vừa thêm */}
        <div className="flex gap-4 mb-6">
          <div className="relative w-20 h-20 flex-shrink-0">
             {/* Giả sử course.image là string url */}
             <div className="w-full h-full bg-slate-200 rounded object-cover overflow-hidden">
                {/* Thay bằng Image component thật của bạn */}
                <img src={course.thumbnail || "/placeholder.jpg"} alt={course.title} className="w-full h-full object-cover"/>
             </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm">
              {course.title}
            </h4>
            <p className="text-slate-500 text-xs mt-1">By {course.instructor}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => router.push("/cart")}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors"
          >
            Go to cart
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Keep shopping
          </button>
        </div>
      </div>
    </div>
  );
}