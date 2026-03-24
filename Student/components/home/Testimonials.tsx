"use client";

import * as React from "react";
import { useI18n } from "@/context/I18nContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Quote } from "lucide-react"; 
import Image from "next/image";

// 1. Mock Data (In English)
const reviews = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Frontend Developer at Google",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", 
    content: "The courses are incredibly practical. The instructor explains complex concepts simply. I built my entire portfolio after the ReactJS course.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "CS Student",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    content: "Clear roadmap, no fluff. The practice exercises are very well designed, helping me retain knowledge much better than reading docs.",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Career Switcher",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    content: "I was afraid it would be too hard, but EduLive's visual explanations made it easy. Totally worth the investment for the Pro subscription.",
    rating: 4,
  },
  {
    id: 4,
    name: "Emily Davis",
    role: "Freelancer",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    content: "High-quality free resources and the paid courses have amazing support. The community is very active and helpful. 10/10!",
    rating: 5,
  }
];

export function Testimonials(){
    const { t } = useI18n();
    return(
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
            {/* Header Section */}
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    {t("testimonials.title")}{" "}
                    <span className="text-blue-600 dark:text-blue-400">{t("testimonials.brand")}</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400">
                    {t("testimonials.subtitle")}
                </p>
            </div>
            {/* Grid Reviews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {reviews.map((reviews)=>(
                    <Card key={reviews.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white flex flex-col h-full dark:bg-slate-900 dark:border-slate-800">
                         <CardHeader className="pb-2">
                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < reviews.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} 
                                />
                            ))}
                            </div>
                         </CardHeader>

                         <CardContent className="flex-1 flex flex-col gap-6">
                            {/* Review Content */}
                            <div className="relative">
                                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-slate-100 -z-10 transform -scale-x-100"/>
                                    <p className="text-slate-700 italic leading-relaxed text-sm">
                                        &ldquo;{reviews.content}&rdquo;
                                    </p>
                            </div>
                            {/* User Info */}
                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-100">
                                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200">
                                  <Image
                                      src={reviews.avatar}
                                      alt={reviews.name}
                                      fill
                                      className="object-cover"
                                  />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:bg-slate-900 dark:text-white">{reviews.name}</h4>
                                    <p className="text-xs text-slate-500">{reviews.role}</p>
                                </div>
                            </div>
                         </CardContent>
                    </Card>
                ))}
            </div>
            {/* Stat Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 py-6 sm:py-8 border-t border-slate-200 dark:border-slate-800 mt-8 sm:mt-12">
                <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">10k+</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">{t("testimonials.students")}</p>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">50+</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">{t("testimonials.courses")}</p>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">1200+</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">{t("testimonials.lessons")}</p>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">4.9/5</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">{t("testimonials.rating")}</p>
                </div>
            </div>
        </section>
    )
}