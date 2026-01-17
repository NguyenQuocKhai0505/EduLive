// student/app/page.tsx
import { BannerSlider } from "@/components/home/BannerSlider"; // Import vào đây
import { FeaturedCourses } from "../../components/home/FeaturedCourse";
import { TopicCategories } from "../../components/home/TopicCategories";
import { FreeYoutubeCourses } from "@/components/home/FreeYoutubeCourse";
import { Testimonials } from "@/components/home/Testimonials";
export default function Home() {
  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 bg-background text-foreground"> 
      <BannerSlider />
      <TopicCategories />
      <div className="px-0 sm:px-6">
        <FeaturedCourses />
      </div>
      <FreeYoutubeCourses />
      <Testimonials />
    </div>
  );
}