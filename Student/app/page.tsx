// student/app/page.tsx
import { BannerSlider } from "@/components/BannerSlider"; // Import vào đây
import { FeaturedCourses } from "../components/FeaturedCourse";
import { TopicCategories } from "../components/TopicCategories";
import { FreeYoutubeCourses } from "@/components/FreeYoutubeCourse";
export default function Home() {
  return (
    <div className="p-6 space-y-6"> 
      <BannerSlider />
      <TopicCategories />      
      <div className="px-6">
      <FeaturedCourses />
      <FreeYoutubeCourses />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome to EduLive Student Portal</h1>
        <p>Homepage content coming soon...</p>
      </div>

    </div>
  );
}