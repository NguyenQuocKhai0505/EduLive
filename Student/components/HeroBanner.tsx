"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeroSlide {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  bgColor?: string;
  images: {
    src: string;
    alt: string;
    label: string;
  }[];
}

interface HeroBannerProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HeroBanner({ 
  slides, 
  autoPlay = false,
  autoPlayInterval = 5000 
}: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300);
        return (prev + 1) % slides.length;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[currentSlide];
  const bgGradient = current.bgColor || "from-cyan-500 to-teal-500";

  return (
    <div className={cn(
      "relative w-full bg-gradient-to-r overflow-hidden",
      bgGradient
    )}>
      <div className="w-full px-4 py-8 md:py-12">
        {/* Slide Container với animation */}
        <div className="relative">
          <div
            key={currentSlide}
            className={cn(
              "transition-all duration-300 ease-in-out",
              isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
            )}
          >
            <div className="flex items-center justify-center">
              <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* LEFT SIDE - Text Content */}
                  <div className="space-y-6 text-white">
                    {/* Title với Crown icon */}
                    <div className="flex items-center gap-2">
                      <Crown className="h-6 w-6 text-yellow-400" />
                      <h2 className="text-3xl md:text-4xl font-bold">
                        {current.title}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-base md:text-lg leading-relaxed opacity-95">
                      {current.description}
                    </p>

                    {/* CTA Button */}
                    <Button
                      onClick={() => {
                        if (current.buttonLink) {
                          window.location.href = current.buttonLink;
                        }
                      }}
                      className="bg-white text-cyan-600 hover:bg-gray-100 border-2 border-cyan-600 font-bold px-6 py-6 text-base"
                    >
                      {current.buttonText}
                    </Button>
                  </div>

                  {/* RIGHT SIDE - Image Grid 2x2 */}
                  <div className="grid grid-cols-2 gap-3">
                    {current.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 shadow-lg group"
                      >
                        {/* Placeholder - sau này thay bằng Image component */}
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                          <span className="text-gray-500 text-sm">Image {idx + 1}</span>
                        </div>

                        {/* Label overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                          <p className="text-white text-xs font-semibold text-center">
                            {img.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - luôn hiện khi có nhiều slides */}
        {slides.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 z-10 disabled:opacity-50"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 z-10 disabled:opacity-50"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Dots indicator - luôn hiện khi có nhiều slides */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70",
                  isTransitioning && "cursor-not-allowed"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}