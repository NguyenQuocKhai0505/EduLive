"use client";

import { Play, AlertCircle, MonitorPlay, FileText, Trophy, Infinity } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/context/I18nContext";
import { useCart } from "@/context/CartContext";
import AddToCartButton from "@/components/shared/AddToCartButton";
import type { Course } from "@/lib/types/course.types";

function toCartCourse(c: Record<string, unknown>): Course {
  const x = c as Record<string, unknown>;
  return {
    id: Number(x.id),
    category: String(x.category ?? ""),
    title: String(x.title ?? ""),
    description: String(x.description ?? ""),
    rating: Number(x.rating ?? 0),
    students: Number(x.students ?? 0),
    lastUpdated: String(x.lastUpdated ?? ""),
    language: String(x.language ?? ""),
    price: String(x.price ?? ""),
    originalPrice: String(x.originalPrice ?? ""),
    discount: String(x.discount ?? ""),
    thumbnail: String(x.thumbnail ?? ""),
    instructor: String(x.instructor ?? ""),
    duration: String(x.duration ?? ""),
    lectures: Number(x.lectures ?? 0),
    level: String(x.level ?? ""),
    curriculum: Array.isArray(x.curriculum) ? (x.curriculum as Course["curriculum"]) : [],
    whatYouWillLearn: Array.isArray(x.whatYouWillLearn) ? (x.whatYouWillLearn as string[]) : [],
  };
}

export default function CourseSidebar({ course }: { course: Record<string, unknown> }) {
  const { t } = useI18n();
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const cartCourse = toCartCourse(course);
  const courseId = Number(course.id);

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (!isInCart(courseId)) await addToCart(courseId);
      router.push("/cart");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(typeof msg === "string" ? msg : t("cart.addFailed"));
    }
  };

  return (
    <div className="sticky top-20 sm:top-24 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      {/* Video Preview */}
      <div className="relative aspect-video group cursor-pointer">
        {/* cartCourse.thumbnail đã được convert sang string để tránh lỗi kiểu build */}
        <img src={cartCourse.thumbnail} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg pl-1 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 sm:w-6 sm:h-6 text-black fill-black" />
          </div>
        </div>
        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center text-white font-bold text-xs sm:text-sm px-2">
            {t("courseSidebar.previewThisCourse")}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{cartCourse.price}</span>
          {cartCourse.originalPrice && (
            <>
              <span className="text-slate-400 dark:text-slate-500 line-through text-base sm:text-lg">{cartCourse.originalPrice}</span>
              {cartCourse.discount && (
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t("courseSidebar.discountOff", { value: cartCourse.discount })}
                </span>
              )}
            </>
          )}
        </div>
        
        <div className="text-red-600 dark:text-red-400 flex items-center gap-2 text-xs sm:text-sm">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{t("courseSidebar.daysLeftAtPrice", { days: 2 })}</span>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="w-full [&_button]:w-full [&_button]:h-11 sm:[&_button]:h-12 [&_button]:text-sm sm:[&_button]:text-base md:[&_button]:text-lg [&_button]:font-bold">
            <AddToCartButton course={cartCourse} />
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full h-11 sm:h-12 text-sm sm:text-base md:text-lg font-bold border border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            {t("courseSidebar.buyNow")}
          </button>
        </div>
        
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">{t("courseSidebar.moneyBackGuarantee")}</div>
        
        <div className="space-y-2 sm:space-y-3 pt-2">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{t("courseSidebar.includesTitle")}</h4>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1.5 sm:space-y-2">
            <li className="flex items-center gap-2 sm:gap-3"><MonitorPlay className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> <span>{t("courseSidebar.onDemandVideo", { duration: cartCourse.duration })}</span></li>
            <li className="flex items-center gap-2 sm:gap-3"><FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> <span>{t("courseSidebar.articles", { count: cartCourse.lectures })}</span></li>
            <li className="flex items-center gap-2 sm:gap-3"><Trophy className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> <span>{t("courseSidebar.certificate")}</span></li>
            <li className="flex items-center gap-2 sm:gap-3"><Infinity className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> <span>{t("courseSidebar.lifetimeAccess")}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
