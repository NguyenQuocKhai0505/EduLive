"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { Filter, ChevronDown, X, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// --- DỮ LIỆU CẤU HÌNH ---
const LEVELS = ["All Levels", "Beginner", "Intermediate", "Expert"];
const LANGUAGES = ["English", "Vietnamese", "Spanish", "French"];
const PRICES = ["Paid", "Free"];
const RATINGS = [4.5, 4.0, 3.5, 3.0];

// --- COMPONENT CON: QUICK DROPDOWN (Tách ra ngoài để tối ưu render) ---
interface QuickDropdownProps {
  label: string;
  paramKey: string;
  options: string[];
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
  applyFilter: (key: string, value: string | null) => void;
  isActive: (key: string, value: string) => boolean;
  searchParams: any;
}

const QuickDropdown = ({
  label,
  paramKey,
  options,
  activeDropdown,
  setActiveDropdown,
  applyFilter,
  isActive,
  searchParams,
}: QuickDropdownProps) => {
  const isOpen = activeDropdown === paramKey;
  const currentValue = searchParams.get(paramKey);

  return (
    <div className="relative">
      <button
        onClick={() => setActiveDropdown(isOpen ? null : paramKey)}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
          /* Logic màu sắc: Active vs Inactive (Hỗ trợ Dark Mode) */
          currentValue
            ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
            : "border-slate-300 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        )}
      >
        {currentValue || label} <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-lg z-20 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden
            /* Dark Mode cho Dropdown Menu */
            dark:bg-slate-900 dark:border-slate-700
          ">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => applyFilter(paramKey, opt)}
                className="w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors
                  hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
              >
                {opt}
                {isActive(paramKey, opt) && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              </button>
            ))}
            {currentValue && (
              <div className="border-t mt-2 pt-2 dark:border-slate-700">
                <button
                  onClick={() => applyFilter(paramKey, null)}
                  className="w-full text-left px-4 text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Logic apply filter
  const applyFilter = (key: string, value: string | null) => {
    const current = qs.parse(searchParams.toString());
    const query = { ...current, [key]: value };

    if (!value || value === "All" || value === "All Levels") delete query[key];

    const url = qs.stringifyUrl(
      { url: "/courses", query },
      { skipNull: true }
    );
    router.push(url);
    setActiveDropdown(null);
  };

  const isActive = (key: string, value: string) => searchParams.get(key) === value;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* NÚT MỞ SIDEBAR */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 border px-3 sm:px-4 py-2 sm:py-3 font-bold transition shadow-sm rounded-sm text-xs sm:text-sm
            /* Light Mode */
            bg-white border-black hover:bg-slate-50 
            /* Dark Mode */
            dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800
          "
        >
          <Filter className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Filter</span>
          {Array.from(searchParams.keys()).length > 0 && (
            <span className="ml-1 flex h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
          )}
        </button>

        {/* CÁC DROPDOWN NHANH */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-3">
          <QuickDropdown
            label="Level"
            paramKey="level"
            options={LEVELS}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            applyFilter={applyFilter}
            isActive={isActive}
            searchParams={searchParams}
          />
          <QuickDropdown
            label="Language"
            paramKey="language"
            options={LANGUAGES}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            applyFilter={applyFilter}
            isActive={isActive}
            searchParams={searchParams}
          />
          <QuickDropdown
            label="Price"
            paramKey="price"
            options={PRICES}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            applyFilter={applyFilter}
            isActive={isActive}
            searchParams={searchParams}
          />
        </div>

        {/* NÚT TOGGLE: HAS VIDEO */}
        <button
          onClick={() => applyFilter("video", isActive("video", "true") ? null : "true")}
          className={cn(
            "border rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap hidden sm:block",
            isActive("video", "true")
              ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
              : "bg-white border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          Has Video
        </button>

        {/* NÚT CLEAR ALL */}
        {Array.from(searchParams.keys()).length > 0 && (
          <button
            onClick={() => router.push("/courses")}
            className="text-sm font-bold ml-auto transition-colors
              text-purple-600 hover:text-purple-800 
              dark:text-purple-400 dark:hover:text-purple-300"
          >
            Clear filters
          </button>
        )}

        {/* --- PHẦN SIDEBAR MODAL --- */}
        
        {/* Overlay đen mờ */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* Nội dung Sidebar */}
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-full sm:w-[340px] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
            /* Background Sidebar */
            "bg-white dark:bg-slate-950 dark:border-r dark:border-slate-800",
            isFilterOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 sm:p-6">
            {/* Header Sidebar */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold dark:text-white">Filter</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* --- NHÓM FILTER: RATINGS --- */}
            <div className="mb-8">
              <h3 className="font-bold text-base mb-3 dark:text-slate-200">Ratings</h3>
              <div className="space-y-3">
                {RATINGS.map((rate) => (
                  <label key={rate} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      className="accent-slate-900 dark:accent-white w-4 h-4"
                      checked={searchParams.get("rating") === rate.toString()}
                      onChange={() => applyFilter("rating", rate.toString())}
                    />
                    <div className="flex items-center text-amber-500 group-hover:opacity-80">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < Math.floor(rate)
                              ? "fill-current"
                              : i < rate
                              ? "fill-current opacity-50"
                              : "text-slate-300 dark:text-slate-600"
                          )}
                        />
                      ))}
                      <span className="text-slate-700 dark:text-slate-300 text-sm ml-2 font-medium">
                        {rate} & up
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-6 border-slate-100 dark:border-slate-800" />

            {/* --- NHÓM FILTER: LEVEL --- */}
            <div className="mb-8">
              <h3 className="font-bold text-base mb-3 dark:text-slate-200">Level</h3>
              <div className="space-y-3">
                {LEVELS.map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive("level", level)}
                      onChange={() => applyFilter("level", isActive("level", level) ? null : level)}
                      className="w-5 h-5 rounded border-slate-300 accent-slate-900 dark:accent-white cursor-pointer"
                    />
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                        {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-6 border-slate-100 dark:border-slate-800" />

            {/* --- NHÓM FILTER: DURATION --- */}
            <div className="mb-8">
              <h3 className="font-bold text-base mb-3 dark:text-slate-200">Video Duration</h3>
              <div className="space-y-3">
                {[
                  { label: "0-1 Hour", val: "short" },
                  { label: "1-3 Hours", val: "medium" },
                  { label: "3-6 Hours", val: "long" },
                  { label: "6+ Hours", val: "extra-long" },
                ].map((item) => (
                  <label key={item.val} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive("duration", item.val)}
                      onChange={() => applyFilter("duration", isActive("duration", item.val) ? null : item.val)}
                      className="w-5 h-5 rounded border-slate-300 accent-slate-900 dark:accent-white cursor-pointer"
                    />
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                        {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer Sidebar */}
            <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  router.push("/search");
                  setIsFilterOpen(false);
                }}
                className="flex-1 py-2.5 sm:py-3 border border-slate-900 dark:border-slate-600 font-bold transition text-sm sm:text-base
                  hover:bg-slate-50 
                  dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-2.5 sm:py-3 font-bold transition text-sm sm:text-base
                  bg-slate-900 text-white hover:bg-slate-800 
                  dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}