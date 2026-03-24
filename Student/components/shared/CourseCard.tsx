"use client";

import { ShoppingCart, Star, Heart } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { formatRating } from "@/lib/utils";
import { useI18n } from "@/context/I18nContext";
import { toast } from "sonner";

const WISHLIST_KEY = "edulive_wishlist_course_ids";

function readWishlistIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

interface CourseCardProps {
  item: any;
}

export default function CourseCard({ item }: CourseCardProps) {
  const { t } = useI18n();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const id = Number(item.id);
    setWishlisted(readWishlistIds().includes(id));
  }, [item.id]);

  const handleToggleWishList = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(item.id);
      const ids = readWishlistIds();
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      setWishlisted(next.includes(id));
      toast.success(
        next.includes(id) ? t("courseCard.addedToWishlist") : t("courseCard.removedFromWishlist")
      );
    },
    [item.id, t]
  );

  return (
    <div className="group flex flex-col gap-2 sm:gap-3 h-full bg-white dark:bg-slate-900 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
      <div className="overflow-hidden rounded-lg aspect-video border border-slate-200 dark:border-slate-700 relative">
        <Link href={`/course/${item.id}`} className="block w-full h-full">
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </Link>

        <button
          type="button"
          onClick={handleToggleWishList}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100 ${
            wishlisted ? "text-red-500 opacity-100" : "text-slate-400 hover:text-red-500"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1.5 flex-1">
          <Link href={`/courses/${item.id}`}>
            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug min-h-[2.75rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h4>
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 truncate">{item.instructor || t("search.unknown")}</p>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-bold text-sm text-amber-500 dark:text-amber-400">{formatRating(item.rating)}</span>
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
            {item.lectures != null && (
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {t("courseCard.lectures", { count: item.lectures })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-baseline gap-1.5 flex-shrink-0 min-w-0 flex-1">
            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white whitespace-nowrap">{item.price}</span>
            {item.originalPrice && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through whitespace-nowrap">{item.originalPrice}</span>
            )}
          </div>

          <div className="flex-shrink-0">
            <AddToCartButton course={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
