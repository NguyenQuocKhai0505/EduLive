// student/app/page.tsx
import { BannerSlider } from "@/components/home/BannerSlider"; // Import vào đây
import { FeaturedCourses } from "../../components/home/FeaturedCourse";
import { TopicCategories } from "../../components/home/TopicCategories";
import { FreeYoutubeCourses } from "@/components/home/FreeYoutubeCourse";
import { Testimonials } from "@/components/home/Testimonials";
export default function Home() {
  return (
    <div className="p-6 space-y-6"> 
      <BannerSlider />
      <TopicCategories />      
      <div className="px-6">
      <FeaturedCourses />
      <FreeYoutubeCourses />
      <Testimonials/>
      </div>
    </div>
  );
}