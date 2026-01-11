import { MonitorPlay, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Đảm bảo bạn đã cài Accordion của shadcn

interface CourseCurriculumProps {
  course: any;
}

export default function CourseCurriculum({ course }: CourseCurriculumProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
        Course Content
      </h2>
      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
        <span>
          {course.curriculum?.length} sections • {course.lectures} lectures •{" "}
          {course.duration} total length
        </span>
        <button className="text-blue-600 font-bold hover:underline">
          Expand all sections
        </button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {course.curriculum?.map((section: any) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b last:border-0 border-slate-200 dark:border-slate-800"
            >
              <AccordionTrigger className="bg-slate-50 dark:bg-slate-900 px-4 py-3 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex flex-col items-start text-left">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </span>
                  <span className="text-xs text-slate-500 font-normal mt-1">
                    {section.lessons.length} lectures •{" "}
                    {section.lessons.reduce(
                      (acc: number, l: any) => acc + parseInt(l.time),
                      0
                    )}{" "}
                    min
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white dark:bg-slate-950 p-0">
                {section.lessons.map((lesson: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {lesson.type === "video" ? (
                        <MonitorPlay className="w-4 h-4 text-slate-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                        {lesson.title}
                      </span>
                      {lesson.preview && (
                        <span className="text-xs text-blue-600 underline ml-2 hidden md:inline-block">
                          Preview
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {lesson.time}
                    </span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}