"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromotionalBannerProps {
  imageUrl: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  height?: number;
}

export function PromotionalBanner({ 
  imageUrl,
  imageAlt = "Promotional banner",
  title,
  description,
  onClose,
  showCloseButton = true,
  height = 200
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className="relative w-full border-b overflow-hidden">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay text nếu có */}
        {(title || description) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-center px-4">
              {title && (
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm md:text-base text-white/90">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Close button */}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white shadow-md z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
