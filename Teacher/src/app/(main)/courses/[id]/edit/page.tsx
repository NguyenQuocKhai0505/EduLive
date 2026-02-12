"use client";

import { useEffect, useState,useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { getCourseById, updateCourse, uploadCourseThumbnail } from "../../../../../services/course.service";
import { getCategories } from "../../../../../services/category.service";
import { toast } from "sonner";

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

type Category = {
  id: number;
  name: string;
};

const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Vietnamese", "Japanese"];

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const courseId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const [course, setCourse] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [urlInput, setUrlInput] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);

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

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getCourseById(courseId);
        const courseData = response.data?.data || response.data;
        setCourse(courseData);
        
        // Populate form with course data
        reset({
          title: courseData.title || "",
          description: courseData.description || "",
          categoryId: courseData.categoryId || courseData.category?.id || 0,
          thumbnail: courseData.thumbnail || "",
          level: courseData.level || "Beginner",
          language: courseData.language || "English",
          price: courseData.price || 0,
          originalPrice: courseData.originalPrice || 0,
          students: courseData.students || 0,
          lectures: courseData.lectures || 0,
          rating: courseData.rating || 0,
          duration: courseData.duration || 0,
          availableSlots: courseData.availableSlots || null,
        });
      } catch (error) {
        console.error("Error fetching course", error);
        toast.error("Không thể tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, reset]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await getCategories();
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];
        setCategories(list);
      } catch (error) {
        console.error("Error fetching categories", error);
        toast.error("Không thể tải danh mục");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

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

      const response = await updateCourse(courseId, payload);

      if (localFile) {
        try {
          await uploadCourseThumbnail(courseId, localFile);
          toast.success("Course updated & thumbnail uploaded");
        } catch (uploadError) {
          console.error("Error uploading thumbnail", uploadError);
          toast.error("Cập nhật khóa học thành công nhưng upload thumbnail thất bại");
        }
      } else {
        toast.success("Course updated successfully");
      }

      router.push("/courses");
    } catch (error: any) {
      console.error("Error updating course", error);
      toast.error(error?.response?.data?.message || "Failed to update course");
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Loading...
        </h1>
      </div>
    );
  }

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
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Selected: {watch("thumbnail") || "None"}</span>
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
