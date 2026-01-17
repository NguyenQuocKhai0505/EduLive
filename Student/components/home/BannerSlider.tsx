'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useState,useEffect,useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi, 
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; 

const banners = [
  {
    id: 1,
    title: 'Học ReactJS Miễn Phí!',
    description: 'Khóa học ReactJS từ cơ bản tới nâng cao. Kết quả của khóa học này là bạn có thể làm hầu hết các dự án.',
    cta: 'Đăng ký ngay',
    image: 'https://files.fullstack.edu.vn/f8-prod/banners/20/6308a026878f6.png',
    gradient: 'from-blue-600 to-violet-600',
  },
  {
    id: 2,
    title: 'Thành Quả của Học Viên',
    description: 'Xem các sản phẩm được hoàn thành bởi học viên F8 sau khi kết thúc khóa học.',
    cta: 'Xem thành quả',
    image: 'https://files.fullstack.edu.vn/f8-prod/banners/Banner_01_2.png',
    gradient: 'from-purple-600 to-blue-500',
  },
  {
    id: 3,
    title: 'F8 trên Youtube',
    description: 'F8 được nhắc tới ở mọi nơi, ở đâu có cơ hội việc làm cho nghề IT và có những con người yêu thích lập trình.',
    cta: 'Truy cập kênh',
    image: 'https://files.fullstack.edu.vn/f8-prod/banners/Banner_03_youtube.png',
    gradient: 'from-red-500 to-orange-500',
  },
];

export function BannerSlider() {
  // --- 1. Setup State để quản lý Dots ---
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const plugin =useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  // --- 2. Lắng nghe sự kiện từ Carousel ---
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

  return (
    <div className="w-full px-0 sm:px-2"> 
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full relative"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {banners.map((item) => (
            <CarouselItem key={item.id}>
              <div
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r ${item.gradient} p-4 sm:p-6 md:p-12 text-white h-[240px] sm:h-[280px] md:h-[320px] flex items-center`}
              >
                <div className="relative z-10 w-full md:w-2/3 space-y-2 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-lg opacity-90 max-w-[500px] line-clamp-2 sm:line-clamp-none">
                    {item.description}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="font-bold hover:scale-105 transition-transform text-xs sm:text-sm px-3 sm:px-4"
                  >
                    {item.cta}
                  </Button>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
                    <img 
                        src={item.image} 
                        alt={item.title} 
                        className="h-full w-full object-contain object-right opacity-90 hover:scale-105 transition-transform duration-500"
                    />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="hidden sm:flex left-2 sm:left-4 bg-white/20 border-none hover:bg-white/40 text-white" />
        <CarouselNext className="hidden sm:flex right-2 sm:right-4 bg-white/20 border-none hover:bg-white/40 text-white" />

        {/* --- 3. Phần DOTS hiển thị ở đây --- */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: count }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)} // Bấm vào dot thì nhảy tới slide đó
                    className={cn(
                        "h-2 rounded-full transition-all duration-300 ease-in-out", // Hiệu ứng mượt
                        current === index + 1 
                            ? "w-8 bg-white" // Active: Dài ra, màu trắng
                            : "w-2 bg-white/50 hover:bg-white/80" // Inactive: Ngắn, mờ
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
      </Carousel>
    </div>
  );
}