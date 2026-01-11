import CourseCard from "./CourseCard";

interface SimilarCoursesProps {
  courses: any[];
}

export default function SimilarCourses({ courses }: SimilarCoursesProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        Students also bought
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {courses.map((item) => (
          <CourseCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}