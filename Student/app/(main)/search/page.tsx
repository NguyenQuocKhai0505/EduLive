import { ALL_COURSES } from "@/lib/mock-data";
import CourseCard from "@/components/shared/CourseCard";
import FilterBar from "./components/FilterBar";
import { Search } from "lucide-react";
import Pagination from "./components/Pagination";

interface SearchPageProps {
  searchParams: {
    title?: string;
    categoryId?: string;
    level?: string;
    language?: string;
    price?: string;
    rating?: string;
    duration?: string;
    page?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  // 1. LẤY THAM SỐ URL
  const { title, level, language, price, rating, page } = searchParams;

  const parsePrice = (priceStr: string | number) => {
    if (typeof priceStr === "number") return priceStr;
    return parseInt(priceStr.replace(/[^0-9]/g, ""));
  };

  // 2. LOGIC FILTER
  const filteredCourses = ALL_COURSES.filter((item) => {
    const realPrice = parsePrice(item.price);

    if (title && !item.title.toLowerCase().includes(title.toLowerCase())) return false;
    if (level && level !== "All Levels" && item.level !== level) return false;
    if (language && item.language !== language) return false;
    if (price === "Free" && realPrice !== 0) return false;
    if (price === "Paid" && realPrice === 0) return false;
    if (rating) {
      const ratingNum = parseFloat(rating);
      if (item.rating < ratingNum) return false;
    }
    return true;
  });

  // 3. LOGIC PAGINATION
  const currentPage = parseInt(page || "1", 10);
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const displayedCourses = filteredCourses.slice(startIndex, endIndex);

  return (
    // 👇 Thêm dark:bg-slate-950 để nền tối khi ở Dark Mode
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        
        {/* HEADER */}
        <div className="mb-8">
          {/* 👇 Text đổi màu theo mode */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {title ? (
              <>Results for <span className="text-purple-600 dark:text-purple-400">"{title}"</span></>
            ) : (
              "All Courses"
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {filteredCourses.length} result{filteredCourses.length !== 1 && "s"} found
          </p>
        </div>

        {/* FILTER BAR */}
        <FilterBar />

        {/* DANH SÁCH KẾT QUẢ */}
        {displayedCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {displayedCourses.map((course) => (
                <CourseCard key={course.id} item={course} />
              ))}
            </div>

            {/* Pagination Footer */}
            {/* 👇 Thêm border dark mode */}
            <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </>
        ) : (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* 👇 Background icon đổi màu */}
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <Search className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No results found</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
              We couldn't find any courses matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}