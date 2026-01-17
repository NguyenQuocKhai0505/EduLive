"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { getAllCategories, CategoryResponse } from "@/services/course.service"

export function TopicCategories(){
    const [topics,setTopics] = useState<CategoryResponse[]>([])
    const [loading,setLoading] = useState(true)
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(()=>{
        const fetchCategories = async() =>{
            try{
                const categories = await getAllCategories()
                setTopics(categories)
            }catch(error){
                console.log("Error fetching categories",error)
            }finally{
                setLoading(false)
            }
        }
        fetchCategories()
    },[])

    // Carousel API để quản lý dots
    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);
    if (loading) {
        return (
          <div className="py-12 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center text-slate-600 dark:text-slate-400">Loading categories...</div>
            </div>
          </div>
        );
      }
      return (
        <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start lg:items-center">
              <div className="w-full lg:w-1/4 space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  Learn <span className="italic font-serif text-blue-600 dark:text-blue-400">essential</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  EduLive helps you build in-demand skills fast and advance your career in a changing job market.
                </p>
              </div>
    
              <div className="lg:w-3/4 w-full">
                <Carousel
                  setApi={setApi}
                  opts={{
                    align: "start",
                    loop: true
                  }}
                  className="w-full relative"
                >
                  <CarouselContent className="-ml-2 sm:-ml-4">
                    {topics.map((topic) => (
                      <CarouselItem key={topic.id} className="pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                        <Link href={`/search?categoryId=${topic.id}`} className="group block w-full">
                          <div className="relative overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md h-full">
                            <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold text-center px-2">{topic.name}</span>
                            </div>
                            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate flex-1">
                                  {topic.name}
                                </span>
                                <span className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors flex-shrink-0">
                                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="hidden sm:block">
                    <CarouselPrevious className="-left-2 sm:-left-4 bg-white dark:bg-slate-900 shadow-md border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white" />
                    <CarouselNext className="-right-2 sm:-right-4 bg-white dark:bg-slate-900 shadow-md border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white" />
                  </div>
                  
                  {/* Dots Navigation */}
                  {count > 0 && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 mt-4 pb-2">
                      {Array.from({ length: count }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => api?.scrollTo(index)}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300 ease-in-out",
                            current === index + 1
                              ? "w-8 bg-blue-600 dark:bg-blue-500"
                              : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                          )}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      );
    }