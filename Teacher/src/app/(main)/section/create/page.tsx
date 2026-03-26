"use client";

import { useState } from "react";
import type { ReactNode } from "react";
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
import {getMyCourses} from "../../../../services/course.service"
import {
  getSectionsByCourse,
  createSection,
  updateSection,
  deleteSection,
} from "../../../../services/section.service";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { toast } from "sonner";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

export default function SectionPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const [editSectionOrder, setEditSectionOrder] = useState<number | "">("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (sectionToEdit) {
      setEditSectionTitle(sectionToEdit.title);
      setEditSectionOrder(sectionToEdit.order);
    }
  }, [sectionToEdit]);

  //Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getMyCourses();
        setCourses(res.data);
        if (res.data.length > 0) {
          setSelectedCourseId(res.data[0].id);
        }
      } catch (error) {
        toast.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);
  //Load section
  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchSections = async () => {
      try {
        const res = await getSectionsByCourse(selectedCourseId);
        setSections(res.data);
      } catch (error) {
        toast.error("Failed to load sections");
      }
    };
    fetchSections();
  }, [selectedCourseId]);
  // Create Section 
  const handleCreateSection = async () => {
    if (!title.trim() || !selectedCourseId) return;
    setCreating(true);
    try {
      await createSection(selectedCourseId, {
        title: title.trim(),
        order: order === "" ? 0 : Number(order),
      });
      setTitle("");
      setOrder("");
      const res = await getSectionsByCourse(selectedCourseId);
      setSections(res.data);
      toast.success("Section created successfully");
    } catch (error) {
      toast.error("Failed to create section");
    } finally {
      setCreating(false);
    }
  };

  const SortableItem = ({ id, children }: { id: number; children: ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-stretch gap-2 rounded-lg border border-slate-200 dark:border-slate-800"
      >
        <button
          type="button"
          className="flex shrink-0 cursor-grab touch-none items-center px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Kéo để sắp xếp"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 py-3 pr-3">{children}</div>
      </div>
    );
  };

  const handleSaveSectionEdit = async () => {
    if (!sectionToEdit || !selectedCourseId || !editSectionTitle.trim()) return;
    setSavingEdit(true);
    try {
      await updateSection(selectedCourseId, sectionToEdit.id, {
        title: editSectionTitle.trim(),
        order:
          editSectionOrder === ""
            ? sectionToEdit.order
            : Number(editSectionOrder),
      });
      const res = await getSectionsByCourse(selectedCourseId);
      setSections(res.data);
      setSectionToEdit(null);
      toast.success("Đã cập nhật section");
    } catch {
      toast.error("Không cập nhật được section");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSection = async (section: Section) => {
    if (!selectedCourseId) return;
    if (
      !confirm(
        `Xóa section "${section.title}"? Toàn bộ lesson trong section sẽ bị xóa.`
      )
    )
      return;
    try {
      await deleteSection(selectedCourseId, section.id);
      const res = await getSectionsByCourse(selectedCourseId);
      setSections(res.data);
      toast.success("Đã xóa section");
    } catch {
      toast.error("Không xóa được section");
    }
  };
  //Drag and drop 
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = arrayMove(
      sections,
      sections.findIndex((s) => s.id === active.id),
      sections.findIndex((s) => s.id === over.id)
    );
    if (!selectedCourseId) return;
    const withOrder = reordered.map((section, index) => ({
      ...section,
      order: index + 1,
    }));
    setSections(withOrder);

    try {
      await Promise.all(
        withOrder.map((section) =>
          updateSection(selectedCourseId, section.id, { order: section.order })
        )
      );
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };
  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sessions / Sections
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
              value={selectedCourseId ? String(selectedCourseId) : ""}
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
        {sections.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No sections yet.</p>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext
              items={sections.map((section) => section.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-4 space-y-3">
                {sections.map((section) => (
                  <SortableItem key={section.id} id={section.id}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {section.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          Order: {section.order} · ID: {section.id}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Sửa section"
                          onClick={() => setSectionToEdit(section)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          aria-label="Xóa section"
                          onClick={() => void handleDeleteSection(section)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <Dialog
        open={!!sectionToEdit}
        onOpenChange={(open) => !open && setSectionToEdit(null)}
      >
        <DialogContent className="dark:border-slate-800">
          <DialogHeader>
            <DialogTitle>Sửa section</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                value={editSectionTitle}
                onChange={(e) => setEditSectionTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Thứ tự</label>
              <Input
                type="number"
                value={editSectionOrder}
                onChange={(e) =>
                  setEditSectionOrder(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setSectionToEdit(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={savingEdit || !editSectionTitle.trim()}
              onClick={() => void handleSaveSectionEdit()}
            >
              {savingEdit ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}