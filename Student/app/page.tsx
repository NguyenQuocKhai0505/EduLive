// student/app/page.tsx
import { BannerSlider } from "@/components/BannerSlider"; // Import vào đây

export default function Home() {
  return (
    <div className="p-6 space-y-6"> 
      <BannerSlider />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome to EduLive Student Portal</h1>
        <p>Homepage content coming soon...</p>
      </div>

    </div>
  );
}