"use client"

import * as React from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PlayCircle, Youtube, Clock, Eye } from "lucide-react";
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

// 1. Danh sách video YouTube (Chỉ cần ID và thông tin cơ bản)
const youtubeCourses = [
    {
      id: "x0fSBAgBrOQ",
      title: "ReactJS Tutorial for Beginners - Full Course",
      channel: "FreeCodeCamp",
      duration: "2h 30m",
      views: "1.2M",
      tags: ["React", "Frontend"]
    },
    {
      id: "SqcY0GlETPk",
      title: "React Native Tutorial for Beginners - Build a React Native App",
      channel: "Programming with Mosh",
      duration: "2h 05m",
      views: "2.1M",
      tags: ["Mobile", "React Native"]
    },
    {
      id: "pQN-pnXPaVg",
      title: "Git & GitHub Crash Course For Beginners",
      channel: "Traversy Media",
      duration: "1h 10m",
      views: "300k",
      tags: ["Git", "DevOps"]
    },
    {
      id: "XVZ10uFY9DU",
      title: "Next.js 14 Full Course 2024 | Build and Deploy a Full Stack App",
      channel: "JavaScript Mastery",
      duration: "5h 20m",
      views: "900k",
      tags: ["Next.js", "Fullstack"]
    },
    {
    id: "DR4QhvIlFfQ",
      title: "Golang",
      channel: "Sangam Murkhejree",
      duration: "5h 20m",
      views: "900k",
      tags: ["Next.js", "Fullstack"]
    },
  ];
export function FreeYoutubeCourses(){
    return(
        <div className="py-16 bg-white-900 text-slate-900 dark:bg-slate-900 dark:text-white ">
            <div className="max-w-7xl mx-auto px-6 space-y-8">
                {/* Header Section */}
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-500 font-bold tracking-wider uppercase text-sm">
                            <Youtube className="w-5 h-5"/> Free Resources
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold">Learning Free On <b>Youtube</b></h2>
                        <p className="text-slate-400 max-w-2xl">
                        A compilation of high-quality tutorial videos from the community, helping you access knowledge quickly and free of charge.
                        </p>
                    </div>
                </div>
                {/* Carousel Video */}
                <Carousel opts={{align:"start",loop:true}} className="w-full">
                    <CarouselContent className="-ml-4">
                        {youtubeCourses.map((video)=>(
                            <CarouselItem key={video.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                {/* MOAL PLAYER START*/}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        {/* Card video */}
                                        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group cursor-pointer overflow-hidden rounded-xl">
                                    
                                        {/* 1. THUMBNAIL AREA */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                            {/* Ảnh nền */}
                                            <img 
                                                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            
                                            {/* Overlay đen mờ khi hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                                            {/* Nút Play nằm chính giữa (Center Absolute) */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform duration-300">
                                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                                                    <PlayCircle className="w-12 h-12 text-white fill-black/50" />
                                                </div>
                                            </div>

                                            {/* Thời lượng video */}
                                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                {video.duration}
                                            </div>
                                        </div>

                                        {/* 2. CONTENT AREA */}
                                        <CardContent className="p-4 flex flex-col gap-3 flex-1">
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2">
                                                    {video.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none text-[10px] px-2 py-0.5">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                
                                                {/* Title */}
                                                <h3 className="font-bold text-base leading-snug text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                                                    {video.title}
                                                </h3>
                                                
                                                {/* Meta info (Channel & Views) */}
                                                <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                                                    <span className="flex items-center gap-1 font-medium hover:text-slate-800">
                                                        <Youtube className="w-3 h-3 text-red-500" /> {video.channel}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> {video.views}
                                                    </span>
                                                </div>
                                        </CardContent>
                                    </Card>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[800px] p-0 bg-black border-none overflow-hidden">
                                        <div className="aspect-video w-full bg-black">
                                        <MediaPlayer 
                                        title={video.title}
                                        // SỬA DÒNG NÀY: Dùng link full thay vì link tắt
                                        src={`https://www.youtube.com/watch?v=${video.id}`}
                                        aspectRatio="16/9"
                                        load="eager"
                                        autoPlay
                                        playsInline 
                                        streamType="on-demand"
                                    >
                                        <MediaProvider>
                                            {/* Nếu vẫn bị lỗi, hãy thử tạm thời comment dòng Poster này lại để kiểm tra */}
                                            <Poster 
                                                className="vds-poster object-cover w-full h-full" 
                                                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                                                alt={video.title} 
                                            />
                                        </MediaProvider>
                                        
                                        <DefaultVideoLayout icons={defaultLayoutIcons} />
                                    </MediaPlayer>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CarouselItem>
                        ))} 
                    </CarouselContent>
                    {/* Nut Previous/Next */}
                    <CarouselPrevious className="hidden md:flex -left-5 bg-white shadow-md border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all" />
                    <CarouselNext className="hidden md:flex -right-5 bg-white shadow-md border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all" />
                </Carousel>
            </div>
        </div>
    )
}