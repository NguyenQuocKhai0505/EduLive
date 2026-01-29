"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Controller, type Resolver, type SubmitHandler, useForm } from "react-hook-form";
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
import { useRouter } from "next/navigation";
import { createCourse, uploadCourseThumbnail } from "../../../../services/course.service";
import { getCategories } from "../../../../services/category.service";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
};

const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Vietnamese", "Japanese"];

// Zod schema for form validation
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
export default function CreateCoursePage() {
  const [urlInput, setUrlInput] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as unknown as Resolver<CourseFormValues>,
    defaultValues: {
      title: "",
      description: "",
      categoryId: 0,
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

  const thumbnailValue = watch("thumbnail");
  const thumbnailPreview = useMemo(
    () => localPreview || thumbnailValue || "",
    [localPreview, thumbnailValue]
  );

  const handleLocalImage = (file?: File | null) => {
    if (!file) return;
    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setLocalFile(file);
    setValue("thumbnail", previewUrl, { shouldValidate: true });
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setLocalFile(null);
    setValue("thumbnail", urlInput.trim(), { shouldValidate: true });
    setUrlInput("");
  };

  const handleRemoveThumbnail = () => {
    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setLocalFile(null);
    setValue("thumbnail", "", { shouldValidate: true });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await getCategories();
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];
        setCategories(list);
        if (list.length > 0) {
          setValue("categoryId", list[0].id, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Error fetching categories", error);
        toast.error("Không thể tải danh mục");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, [setValue]);

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const onSubmit: SubmitHandler<CourseFormValues> = async (values) => {
    try {
      const trimmedThumbnail = values.thumbnail?.trim() ?? "";
      const payload = {
        ...values,
        thumbnail:
          trimmedThumbnail && !trimmedThumbnail.startsWith("blob:")
            ? trimmedThumbnail
            : null,
      };

      const response = await createCourse(payload);
      const courseId =
        response?.data?.id ?? response?.data?.course?.id ?? response?.data?.data?.id;

      if (localFile && courseId) {
        try {
          await uploadCourseThumbnail(courseId, localFile);
          toast.success("Course created & thumbnail uploaded");
        } catch (uploadError) {
          console.error("Error uploading thumbnail", uploadError);
          toast.error("Tạo khóa học thành công nhưng upload thumbnail thất bại");
        }
      } else {
        toast.success("Course created successfully");
      }

      router.push("/courses");
    } catch (error) {
      console.error("Error creating course", error);
      toast.error("Failed to create course");
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create Course
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Điền đầy đủ thông tin khóa học theo cấu trúc database.
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
                      disabled={categoryLoading || categories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categoryLoading
                              ? "Loading..."
                              : categories.length === 0
                                ? "No categories"
                                : "Select category"
                          }
                        />
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
            {isSubmitting ? "Saving..." : "Create Course"}
          </Button>
        </div>
      </form>
    </div>
  );
}