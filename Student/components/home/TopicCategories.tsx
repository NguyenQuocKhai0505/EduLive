"use client"

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// 1. Dữ liệu giả lập các chủ đề (Mock Data)
const topics = [
  {
    id: 1,
    title: "Generative AI",
    slug: "generative-ai",
    image: "https://s.udemycdn.com/home/top-categories/lohp-category-design-v2.jpg", // Ảnh mẫu Udemy
  },
  {
    id: 2,
    title: "IT Certifications",
    slug: "it-certifications",
    image: "https://s.udemycdn.com/home/top-categories/lohp-category-development-v2.jpg",
  },
  {
    id: 3,
    title: "Data Science",
    slug: "data-science",
    image: "https://s.udemycdn.com/home/top-categories/lohp-category-business-v2.jpg",
  },
  {
    id: 4,
    title: "Communication",
    slug: "communication",
    image: "https://s.udemycdn.com/home/top-categories/lohp-category-personal-development-v2.jpg",
  },
  {
    id: 5,
    title: "Business Analytics",
    slug: "business-analytics",
    image: "https://s.udemycdn.com/home/top-categories/lohp-category-marketing-v2.jpg",
  },
];
export function TopicCategories(){
    return(
        <div className="py-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Text gioi thieu */}
                    <div className="lg:w-1/4 space-y-4">
                        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                            Learn <span className="italic font-serif text-blue-600">essential</span>
                        </h2>
                        <p className="text-slate-600 text-sm">
                        EduLive helps you build in-demand skills fast and advance your career in a changing job market.
                        </p>
                    </div>
                    {/* Slider */}
                    <div className="lg:w-3/4 w-full">
                        <Carousel
                            opts={{
                                align:"start",
                                loop:true
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {topics.map((topics)=>(
                                    <CarouselItem key={topics.id} className="pl-4 md:basic-1/2 lg:basis-1/3">
                                        <Link href={`/topic/${topics.slug}`} className="group block w-full">
                                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md h-full">
                        
                                        {/* Ảnh nền */}
                                        <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={topics.image}
                                            alt={topics.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        </div>
                                        {/* Chu de */}
                                        <div className="p-4 bg-white border-t relative">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                    {topics.title}
                                                </span>
                                                <span className="bg-slate-100 p-1 rounded-full group-hover:bg-purple-100 transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-purple-600"/>
                                                </span>
                                            </div>
                                        </div>
                                        </div>
                                    </Link>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>   
                           {/* Nút điều hướng nhỏ gọn */}
                        <div className="hidden md:block">
                            <CarouselPrevious className="-left-4 bg-white shadow-md border-slate-200 hover:bg-slate-50" />
                            <CarouselNext className="-right-4 bg-white shadow-md border-slate-200 hover:bg-slate-50" />
                        </div>
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
    )
}