"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Course } from "@/lib/mock-data";
import AddedToCartModal from "./AddedToCartModal";

export default function AddToCartButton({ course }: { course: Course }) {
  const { addToCart, isInCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const isAdded = isInCart(course.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn click vào Link bao quanh Card (nếu có)
    e.stopPropagation();

    if (isAdded) {
      // Nếu đã có trong giỏ -> Chuyển hướng sang trang Cart
      router.push("/cart");
    } else {
      // Nếu chưa có -> Thêm vào giỏ & Hiện Modal
      addToCart(course);
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full py-2 px-4 rounded font-bold transition-colors duration-200 ${
          isAdded
            ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" // Style cho nút Go to Cart
            : "bg-purple-600 text-white hover:bg-purple-700" // Style cho nút Add to Cart
        }`}
      >
        {isAdded ? "Go to cart" : "Add to cart"}
      </button>

      {/* Popup Modal */}
      <AddedToCartModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        course={course} 
      />
    </>
  );
}