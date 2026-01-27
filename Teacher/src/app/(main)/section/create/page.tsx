"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Course = {
  id: number;
  title: string;
};

type Section = {
  id: number;
  courseId: number;
  title: string;
  order: number;
};

const mockCourses: Course[] = [
  { id: 1, title: "ReactJS from Zero to Hero" },
  { id: 2, title: "UI/UX Design with Figma" },
  { id: 3, title: "English Communication" },
];

const mockSections: Section[] = [
  { id: 1, courseId: 1, title: "Giới thiệu khóa học", order: 1 },
  { id: 2, courseId: 1, title: "React Core Concepts", order: 2 },
  { id: 3, courseId: 2, title: "Figma Basics", order: 1 },
];

export default function SectionPage() {
  const [courses] = useState<Course[]>(mockCourses);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(
    mockCourses[0]?.id ?? 0
  );
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [creating, setCreating] = useState(false);

  const activeSections = useMemo(
    () => sections.filter((section) => section.courseId === selectedCourseId),
    [sections, selectedCourseId]
  );

  const handleCreateSection = () => {
    if (!title.trim() || !selectedCourseId) return;

    setCreating(true);
    const nextId =
      sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;

    const newSection: Section = {
      id: nextId,
      courseId: selectedCourseId,
      title: title.trim(),
      order: order === "" ? 0 : Number(order),
    };

    setSections((prev) => [...prev, newSection]);
    setTitle("");
    setOrder("");
    setCreating(false);
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sessions / Sections (Mock)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Chọn khóa học để thêm section.
        </p>
      </div>

      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Select Course</label>
            <Select
              value={String(selectedCourseId)}
              onValueChange={(value) => setSelectedCourseId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end text-xs text-slate-500">
            Selected:{" "}
            {courses.find((c) => c.id === selectedCourseId)?.title || "None"}
          </div>
        </div>
      </Card>

      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Create New Section
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Section title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Order</label>
            <Input
              type="number"
              placeholder="0"
              value={order}
              onChange={(e) =>
                setOrder(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={handleCreateSection}
          disabled={creating || !title.trim()}
        >
          {creating ? "Creating..." : "Add Section"}
        </Button>
      </Card>

      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Sections List
        </h2>
        {activeSections.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No sections yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {activeSections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {section.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    Order: {section.order}
                  </div>
                </div>
                <span className="text-xs text-slate-400">ID: {section.id}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}