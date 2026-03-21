"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Course } from "@/lib/types/course.types";
import AddedToCartModal from "./AddedToCartModal";
import { useI18n } from "@/context/I18nContext";

export default function AddToCartButton({ course }: { course: Course }) {
  const { t } = useI18n();
  const { addToCart, isInCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const isAdded = isInCart(course.id);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn click vào Link bao quanh Card (nếu có)
    e.stopPropagation();

    if (isAdded) {
      // Nếu đã có trong giỏ -> Chuyển hướng sang trang Cart
      router.push("/cart");
    } else {
      // Nếu chưa có -> Thêm vào giỏ & Hiện Modal
      try {
        await addToCart(Number(course.id));
        setShowModal(true);
      } catch (err: any) {
        const message = err?.response?.data?.message;
        if (Array.isArray(message)) {
          toast.error(message.join(", "));
        } else if (typeof message === "string") {
          toast.error(message);
          if (message.toLowerCase().includes("already in cart")) {
            router.push("/cart");
          }
        } else {
          toast.error(t("cart.addFailed"));
        }
      }
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`py-1.5 px-3 rounded-md text-xs sm:text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
          isAdded
            ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" // Style cho nút Go to Cart
            : "bg-purple-600 text-white hover:bg-purple-700" // Style cho nút Add to Cart
        }`}
      >
        {isAdded ? t("cart.goToCart") : t("cart.addToCart")}
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