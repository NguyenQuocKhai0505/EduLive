"use client";

import { Facebook, Instagram, Mail, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Cột 1: Thông tin (About Us) */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-500">
              EduLive
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
            The leading online programming learning platform. We offer high-quality courses to help you master technology and advance your career.
            </p>
          </div>

          {/* Cột 2: Liên hệ (Email) */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Contact
            </h3>
            <a 
              href="mailto:support@edulive.com" 
              className="flex items-center gap-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="break-all">support@edulive.com</span>
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Supports 24/7 for leaners.
            </p>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Follow me on
            </h3>
            <div className="flex gap-3 sm:gap-4">
              {/* Facebook */}
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition-all">
                <Instagram className="w-5 h-5" />
              </a>

              {/* Youtube */}
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
        </div>

        {/* Dòng bản quyền dưới cùng */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-500">
          © 2024 EduLive. All rights reserved. Designed by Nguyen Quoc Khai.
        </div>
      </div>
    </footer>
  );
}