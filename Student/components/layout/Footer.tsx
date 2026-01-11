"use client";

import { Facebook, Instagram, Mail, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Cột 1: Thông tin (About Us) */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-500">
              EduLive
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
            The leading online programming learning platform. We offer high-quality courses to help you master technology and advance your career.
            </p>
          </div>

          {/* Cột 2: Liên hệ (Email) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Contact
            </h3>
            <a 
              href="mailto:support@edulive.com" 
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>support@edulive.com</span>
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Supports 24/7 for leaners.
            </p>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Follow me on
            </h3>
            <div className="flex gap-4">
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
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-500 dark:text-slate-500">
          © 2024 EduLive. All rights reserved. Designed by Nguyen Quoc Khai.
        </div>
      </div>
    </footer>
  );
}