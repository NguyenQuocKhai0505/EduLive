"use client";

import { useEffect, useState,useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Controller,
  type Resolver,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  thumbnail: z.string().optional(),
  level: z.string().min(1, "Level is required"),
  language: z.string().min(1, "Language is required"),
  price: z.coerce.number().min(0),
  originalPrice: z.coerce.number().min(0),
  students: z.coerce.number().min(0),
  lectures: z.coerce.number().min(0),
  rating: z.coerce.number().min(0).max(5),
  duration: z.coerce.number().min(0),
  availableSlots: z
    .union([z.coerce.number().int().min(1), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
});

type CourseFormValues = z.output<typeof courseSchema>;

const categories = [
  { id: 1, name: "Web Development" },
  { id: 2, name: "Design" },
  { id: 3, name: "Language" },
  { id: 4, name: "Data Science" },
];

const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Vietnamese", "Japanese"];

const mockCourses: Array<CourseFormValues & { id: number }> = [
  {
    id: 1,
    title: "Lập trình ReactJS từ cơ bản đến nâng cao",
    description: "Khóa học ReactJS thực chiến từ zero đến production.",
    categoryId: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    level: "Intermediate",
    language: "Vietnamese",
    price: 1200000,
    originalPrice: 1500000,
    students: 120,
    lectures: 42,
    rating: 4.6,
    duration: 28,
    availableSlots: null,
  },
];

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const course = useMemo(
    () => mockCourses.find((item) => item.id === courseId),
    [courseId]
  );

  const [urlInput, setUrlInput] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as unknown as Resolver<CourseFormValues>,
    defaultValues: {
      title: "",
      description: "",
      categoryId: categories[0]?.id ?? 0,
      thumbnail: "",
      level: "Beginner",
      language: "English",
      price: 0,
      originalPrice: 0,
      students: 0,
      lectures: 0,
      rating: 0,
      duration: 0,
      availableSlots: null,
    },
  });

  useEffect(() => {
    if (!course) return;
    const { id, ...formValues } = course;
    reset(formValues);
    setLocalPreview(null);
    setUrlInput("");
  }, [course, reset]);

  const thumbnailValue = watch("thumbnail");
  const thumbnailPreview = useMemo(
    () => localPreview || thumbnailValue || "",
    [localPreview, thumbnailValue]
  );

  const handleLocalImage = (file?: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setValue("thumbnail", previewUrl, { shouldValidate: true });
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setLocalPreview(null);
    setValue("thumbnail", urlInput.trim(), { shouldValidate: true });
    setUrlInput("");
  };

  const handleRemoveThumbnail = () => {
    setLocalPreview(null);
    setValue("thumbnail", "", { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<CourseFormValues> = (values) => {
    console.log("Update course payload", { id: courseId, ...values });
  };

  if (!course) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Course not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Không tìm thấy khóa học với ID: {courseId}
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Edit Course
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cập nhật thông tin khóa học theo dữ liệu hiện có.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[2fr_1fr]"
      >
        <div className="space-y-6">
          <Card className="border-slate-200 p-6 shadow-sm dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Basic Information
            </h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Course title" {...register("title")} />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={5}
                  placeholder="Write a short description"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 p-6 shadow-sm dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Settings
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Level</label>
                <Controller
                  control={control}
                  name="level"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Language</label>
                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Available Slots</label>
                <Input type="number" {...register("availableSlots")} />
                <p className="mt-1 text-xs text-slate-500">
                  Leave empty if unlimited.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 p-6 shadow-sm dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Pricing & Stats
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Price (VND)</label>
                <Input type="number" {...register("price")} />
              </div>
              <div>
                <label className="text-sm font-medium">Original Price</label>
                <Input type="number" {...register("originalPrice")} />
              </div>
              <div>
                <label className="text-sm font-medium">Students</label>
                <Input type="number" {...register("students")} />
              </div>
              <div>
                <label className="text-sm font-medium">Lectures</label>
                <Input type="number" {...register("lectures")} />
              </div>
              <div>
                <label className="text-sm font-medium">Rating (0-5)</label>
                <Input type="number" step="0.1" {...register("rating")} />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (hours)</label>
                <Input type="number" {...register("duration")} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 p-6 shadow-sm dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Thumbnail
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="mx-auto h-28 w-full max-w-[220px] rounded-md object-cover"
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    Upload image or add from URL
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Upload from local</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLocalImage(e.target.files?.[0])}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Add by URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddUrl} className="gap-2">
                    <Link2 className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Selected: {thumbnailValue || "None"}</span>
                {thumbnailPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleRemoveThumbnail}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/courses">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
