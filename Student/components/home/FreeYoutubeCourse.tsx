"use client"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PlayCircle, Youtube, Eye, ArrowRight } from "lucide-react";
import {
  getYoutubeCourses,
  extractYouTubeVideoId,
  parseYoutubeTags,
} from "@/services/youtube-course.service";
import { useI18n } from "@/context/I18nContext";
import Image from "next/image";

const ALL_TAB_VALUE = "__ALL__";
const UNCATEGORIZED_VALUE = "__uncategorized__";

function categoryKeyFromApi(cat: string | null | undefined): string {
  return cat?.trim() || UNCATEGORIZED_VALUE;
}
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

/** Dữ liệu đã map từ API → UI carousel */
type YoutubeCard = {
  key: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  tags: string[];
  videoUrl: string;
  thumb: string;
  /** Khóa nội bộ để lọc tab */
  categoryKey: string;
};

export function FreeYoutubeCourses(){
    const { t, locale } = useI18n();
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [youtubeCourses, setYoutubeCourses] = useState<YoutubeCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>(ALL_TAB_VALUE);

    const categoryTabs = useMemo(() => {
        const keys = new Set<string>();
        youtubeCourses.forEach((v) => keys.add(v.categoryKey));
        const sorted = Array.from(keys).sort((a, b) => {
            if (a === UNCATEGORIZED_VALUE) return 1;
            if (b === UNCATEGORIZED_VALUE) return -1;
            return a.localeCompare(b, locale === "vi" ? "vi" : "en");
        });
        return [
            { value: ALL_TAB_VALUE, label: t("youtube.tabAll") },
            ...sorted.map((key) => ({
                value: key,
                label: key === UNCATEGORIZED_VALUE ? t("youtube.uncategorized") : key,
            })),
        ];
    }, [youtubeCourses, t, locale]);

    const visibleCourses = useMemo(() => {
        if (selectedTab === ALL_TAB_VALUE) return youtubeCourses;
        return youtubeCourses.filter((v) => v.categoryKey === selectedTab);
    }, [youtubeCourses, selectedTab]);

    useEffect(() => {
        if (!categoryTabs.some((tab) => tab.value === selectedTab)) {
            setSelectedTab(ALL_TAB_VALUE);
        }
    }, [categoryTabs, selectedTab]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setFetchError(null);
                const rows = await getYoutubeCourses();
                if (cancelled) return;
                const mapped: YoutubeCard[] = rows.map((c) => {
                    const vid = extractYouTubeVideoId(c.videoUrl);
                    const thumb =
                        (c.thumbnailUrl && c.thumbnailUrl.trim()) ||
                        (vid
                            ? `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`
                            : "");
                    return {
                        key: String(c.id),
                        title: c.title,
                        channel: c.author,
                        duration: (c.durationLabel && c.durationLabel.trim()) || "—",
                        views: "—",
                        tags: parseYoutubeTags(c.tags),
                        videoUrl: c.videoUrl,
                        thumb,
                        categoryKey: categoryKeyFromApi(c.category),
                    };
                });
                setYoutubeCourses(mapped);
            } catch (e: unknown) {
                if (!cancelled) {
                    const msg =
                        e && typeof e === "object" && "message" in e
                            ? String((e as { message?: string }).message)
                            : t("youtube.loadError");
                    setFetchError(msg);
                    setYoutubeCourses([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    // Fetch once on mount; `t` in catch is fallback only
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    return(
        <div
            id="youtube-free-resources"
            className="py-8 sm:py-12 md:py-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
                {/* Header Section */}
                <div className="flex items-end justify-between flex-col sm:flex-row gap-4">
                    <div className="space-y-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-red-500 font-bold tracking-wider uppercase text-xs sm:text-sm">
                            <Youtube className="w-4 h-4 sm:w-5 sm:h-5"/> {t("youtube.freeResources")}
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                            {t("youtube.title")} <b>{t("youtube.titleBold")}</b>
                        </h2>
                        <p className="text-sm sm:text-base text-slate-400 dark:text-slate-500 max-w-2xl">
                        {t("youtube.description")}
                        </p>
                    </div>
                </div>
                {fetchError && (
                    <p className="text-sm text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3">
                        {fetchError}
                    </p>
                )}
                {loading && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t("youtube.loading")}</p>
                )}
                {!loading && !fetchError && youtubeCourses.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("youtube.empty")}
                    </p>
                )}

                {/* Tabs nhóm category — style gần giống hero dark + gạch xanh active */}
                {!loading && !fetchError && youtubeCourses.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 px-2 py-1 shadow-inner">
                        <div
                            className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin"
                            role="tablist"
                            aria-label={t("youtube.tabListAria")}
                        >
                            {categoryTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={selectedTab === tab.value}
                                    onClick={() => setSelectedTab(tab.value)}
                                    className={cn(
                                        "shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                                        selectedTab === tab.value
                                            ? "border-sky-500 text-white"
                                            : "border-transparent text-slate-400 hover:text-white"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !fetchError && youtubeCourses.length > 0 && visibleCourses.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("youtube.emptyFilter", { all: t("youtube.tabAll") })}
                    </p>
                )}

                {/* Carousel Video — chỉ render khi đã có dữ liệu sau lọc */}
                {!loading && visibleCourses.length > 0 && (
                <Carousel 
                    key={selectedTab}
                    setApi={setApi}
                    opts={{align:"start",loop:true}} 
                    className="w-full relative"
                >
                    <CarouselContent className="-ml-2 sm:-ml-4">
                        {visibleCourses.map((video)=>(
                            <CarouselItem key={video.key} className="pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                {/* MOAL PLAYER START*/}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        {/* Card video */}
                                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group cursor-pointer overflow-hidden rounded-xl">
                                    
                                        {/* 1. THUMBNAIL AREA */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                            {/* Ảnh nền */}
                                            {video.thumb ? (
                                            <Image
                                                src={video.thumb}
                                                alt={video.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            ) : (
                                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                <Youtube className="w-14 h-14 text-slate-400" />
                                            </div>
                                            )}
                                            
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
                                                    {video.tags.length > 0 ? (
                                                    video.tags.map((tag, i) => (
                                                        <Badge key={`${tag}-${i}`} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-none text-[10px] px-2 py-0.5">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-dashed text-slate-400">
                                                        {t("youtube.badgeFree")}
                                                    </Badge>
                                                )}
                                                </div>
                                                
                                                {/* Title */}
                                                <h3 className="font-bold text-base leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                                    {video.title}
                                                </h3>
                                                
                                                {/* Meta info (Channel & Views) */}
                                                <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                                                    <span className="flex items-center gap-1 font-medium hover:text-slate-800 dark:hover:text-slate-200 truncate flex-1 min-w-0">
                                                        <Youtube className="w-3 h-3 text-red-500 dark:text-red-400 flex-shrink-0" /> 
                                                        <span className="truncate">{video.channel}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 flex-shrink-0 ml-2">
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
                                        src={video.videoUrl}
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
                                                src={video.thumb || undefined}
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
                    <CarouselPrevious className="hidden sm:flex -left-2 sm:-left-5 bg-white dark:bg-slate-900 shadow-md border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-600 transition-all text-slate-900 dark:text-white" />
                    <CarouselNext className="hidden sm:flex -right-2 sm:-right-5 bg-white dark:bg-slate-900 shadow-md border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-600 transition-all text-slate-900 dark:text-white" />
                    
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
                                            ? "w-8 bg-red-600 dark:bg-red-500"
                                            : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                    )}
                                    aria-label={t("youtube.slideAria", { n: index + 1 })}
                                />
                            ))}
                        </div>
                    )}
                </Carousel>
                )}

                {!loading && youtubeCourses.length > 0 && selectedTab !== ALL_TAB_VALUE && (
                    <div className="flex justify-center pt-2">
                        <button
                            type="button"
                            onClick={() => setSelectedTab(ALL_TAB_VALUE)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                            {t("youtube.showAllGroups")}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}