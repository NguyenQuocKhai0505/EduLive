"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getYoutubeCourses,
  createYoutubeCourse,
  updateYoutubeCourse,
  deleteYoutubeCourse,
  uploadYoutubeCourseThumbnail,
  fetchYoutubeMetadata,
  type YoutubeCourse,
} from "../../../services/youtube-course.service";
import { toast } from "sonner";
import Image from "next/image";
import { Pencil, Trash2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";

export default function YoutubeCoursesPage() {
  const [courses, setCourses] = useState<YoutubeCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addAuthor, setAddAuthor] = useState("");
  const [addTags, setAddTags] = useState("");
  const [addVideoUrl, setAddVideoUrl] = useState("");
  const [addDurationLabel, setAddDurationLabel] = useState("");
  const [addThumbnailUrl, setAddThumbnailUrl] = useState("");
  const [addThumbnailFile, setAddThumbnailFile] = useState<File | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addFetchingMetadata, setAddFetchingMetadata] = useState(false);

  // Edit state
  const [editCourse, setEditCourse] = useState<YoutubeCourse | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editDurationLabel, setEditDurationLabel] = useState("");
  const [editThumbnailUrl, setEditThumbnailUrl] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFetchingMetadata, setEditFetchingMetadata] = useState(false);

  // Delete confirm
  const [courseToDelete, setCourseToDelete] = useState<YoutubeCourse | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getYoutubeCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to load YouTube courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openEdit = (course: YoutubeCourse) => {
    setEditCourse(course);
    setEditTitle(course.title);
    setEditAuthor(course.author);
    setEditTags(course.tags ?? "");
    setEditVideoUrl(course.videoUrl);
    setEditDurationLabel(course.durationLabel ?? "");
    setEditThumbnailUrl(course.thumbnailUrl ?? "");
    setEditThumbnailFile(null);
  };

  const handleAdd = async () => {
    if (!addTitle.trim() || !addAuthor.trim() || !addVideoUrl.trim()) {
      toast.error("Vui lòng nhập Title, Author và Video URL");
      return;
    }

    setAddSubmitting(true);
    try {
      let thumbnailUrl = addThumbnailUrl.trim();

      // Nếu có file upload, upload lên Cloudinary trước
      if (addThumbnailFile) {
        // Tạo course tạm để có ID, sau đó upload thumbnail
        const tempCourse = await createYoutubeCourse({
          title: addTitle.trim(),
          author: addAuthor.trim(),
          tags: addTags.trim() || undefined,
          videoUrl: addVideoUrl.trim(),
          durationLabel: addDurationLabel.trim() || undefined,
        });

        const uploadResult = await uploadYoutubeCourseThumbnail(
          tempCourse.id,
          addThumbnailFile
        );
        thumbnailUrl = uploadResult.thumbnailUrl;

        // Update lại course với thumbnailUrl
        await updateYoutubeCourse(tempCourse.id, { thumbnailUrl });
      } else {
        // Tạo course với thumbnailUrl từ input
        await createYoutubeCourse({
          title: addTitle.trim(),
          author: addAuthor.trim(),
          tags: addTags.trim() || undefined,
          videoUrl: addVideoUrl.trim(),
          durationLabel: addDurationLabel.trim() || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
        });
      }

      toast.success("Đã tạo YouTube course thành công");
      setShowAddDialog(false);
      resetAddForm();
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ?? "Không thể tạo YouTube course"
      );
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editCourse) return;
    if (!editTitle.trim() || !editAuthor.trim() || !editVideoUrl.trim()) {
      toast.error("Vui lòng nhập Title, Author và Video URL");
      return;
    }

    setEditSubmitting(true);
    try {
      let thumbnailUrl = editThumbnailUrl.trim();

      // Nếu có file upload, upload lên Cloudinary
      if (editThumbnailFile) {
        const uploadResult = await uploadYoutubeCourseThumbnail(
          editCourse.id,
          editThumbnailFile
        );
        thumbnailUrl = uploadResult.thumbnailUrl;
      }

      await updateYoutubeCourse(editCourse.id, {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        tags: editTags.trim() || undefined,
        videoUrl: editVideoUrl.trim(),
        durationLabel: editDurationLabel.trim() || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
      });

      toast.success("Đã cập nhật YouTube course thành công");
      setEditCourse(null);
      resetEditForm();
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ?? "Không thể cập nhật YouTube course"
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteYoutubeCourse(courseToDelete.id);
      toast.success("Đã xóa YouTube course thành công");
      setCourseToDelete(null);
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ?? "Không thể xóa YouTube course"
      );
    }
  };

  const resetAddForm = () => {
    setAddTitle("");
    setAddAuthor("");
    setAddTags("");
    setAddVideoUrl("");
    setAddDurationLabel("");
    setAddThumbnailUrl("");
    setAddThumbnailFile(null);
  };

  const resetEditForm = () => {
    setEditTitle("");
    setEditAuthor("");
    setEditTags("");
    setEditVideoUrl("");
    setEditDurationLabel("");
    setEditThumbnailUrl("");
    setEditThumbnailFile(null);
  };

  // Fetch metadata từ YouTube URL cho Add form
  const fetchAddMetadata = async () => {
    const url = addVideoUrl.trim();
    if (!url) {
      toast.error("Vui lòng nhập URL YouTube trước");
      return;
    }

    // Kiểm tra nếu là URL YouTube hợp lệ
    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubePattern.test(url)) {
      toast.error("URL YouTube không hợp lệ. Vui lòng kiểm tra lại");
      return;
    }

    setAddFetchingMetadata(true);
    try {
      const metadata = await fetchYoutubeMetadata(url);
      
      // Điền metadata (có thể override nếu user muốn)
      setAddTitle(metadata.title);
      setAddAuthor(metadata.author);
      if (!addThumbnailFile) {
        // Chỉ set thumbnail nếu user chưa upload file
        setAddThumbnailUrl(metadata.thumbnailUrl);
      }
      
      toast.success("Đã lấy thông tin từ YouTube thành công!");
    } catch (err: any) {
      console.error("Error fetching metadata:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể lấy thông tin từ YouTube. Vui lòng kiểm tra lại URL hoặc thử lại sau."
      );
    } finally {
      setAddFetchingMetadata(false);
    }
  };

  // Auto-fetch khi blur (nếu URL hợp lệ và chưa có title/author)
  const handleAddVideoUrlChange = async (url: string) => {
    setAddVideoUrl(url);
    
    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubePattern.test(url)) {
      return;
    }

    // Chỉ auto-fetch nếu title và author chưa được điền
    if (!addTitle.trim() && !addAuthor.trim()) {
      await fetchAddMetadata();
    }
  };

  // Fetch metadata từ YouTube URL cho Edit form
  const fetchEditMetadata = async () => {
    const url = editVideoUrl.trim();
    if (!url) {
      toast.error("Vui lòng nhập URL YouTube trước");
      return;
    }

    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubePattern.test(url)) {
      toast.error("URL YouTube không hợp lệ. Vui lòng kiểm tra lại");
      return;
    }

    setEditFetchingMetadata(true);
    try {
      const metadata = await fetchYoutubeMetadata(url);
      
      setEditTitle(metadata.title);
      setEditAuthor(metadata.author);
      if (!editThumbnailFile) {
        setEditThumbnailUrl(metadata.thumbnailUrl);
      }
      
      toast.success("Đã lấy thông tin từ YouTube thành công!");
    } catch (err: any) {
      console.error("Error fetching metadata:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể lấy thông tin từ YouTube. Vui lòng kiểm tra lại URL hoặc thử lại sau."
      );
    } finally {
      setEditFetchingMetadata(false);
    }
  };

  // Auto-fetch khi blur (nếu URL hợp lệ và chưa có title/author)
  const handleEditVideoUrlChange = async (url: string) => {
    setEditVideoUrl(url);
    
    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubePattern.test(url)) {
      return;
    }

    if (!editTitle.trim() && !editAuthor.trim()) {
      await fetchEditMetadata();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          YouTube Courses
        </h1>
        <Button onClick={() => setShowAddDialog(true)}>Thêm YouTube Course</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Đang tải...
        </div>
      ) : courses.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Chưa có YouTube course nào
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  Thumbnail
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  Title
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  Author
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  Tags
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  Video URL
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  Duration
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3">
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        width={80}
                        height={45}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="h-[45px] w-[80px] rounded bg-slate-200 dark:bg-slate-700" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {course.title}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {course.author}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {course.tags || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={course.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline dark:text-sky-400"
                    >
                      Xem video
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {course.durationLabel || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCourseToDelete(course)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm YouTube Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="VD: ReactJS Tutorial for Beginners"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Author <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="VD: FreeCodeCamp"
                value={addAuthor}
                onChange={(e) => setAddAuthor(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tags
              </label>
              <Input
                placeholder="VD: React, Frontend, Free"
                value={addTags}
                onChange={(e) => setAddTags(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                Nhập tags cách nhau bằng dấu phẩy
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Video URL <span className="text-red-500">*</span>
                {addFetchingMetadata && (
                  <span className="ml-2 text-xs text-slate-500">
                    Đang lấy thông tin...
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={addVideoUrl}
                  onChange={(e) => setAddVideoUrl(e.target.value)}
                  onBlur={(e) => handleAddVideoUrlChange(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchAddMetadata}
                  disabled={addFetchingMetadata || !addVideoUrl.trim()}
                >
                  {addFetchingMetadata ? "Loading..." : "Load Metadata"}
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration Label
              </label>
              <Input
                placeholder="VD: 2h 30m"
                value={addDurationLabel}
                onChange={(e) => setAddDurationLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Thumbnail
              </label>
              <div className="space-y-2">
                <Input
                  placeholder="Hoặc nhập URL thumbnail"
                  value={addThumbnailUrl}
                  onChange={(e) => {
                    setAddThumbnailUrl(e.target.value);
                    setAddThumbnailFile(null);
                  }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Hoặc</span>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <Upload className="h-4 w-4" />
                    Upload từ máy
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAddThumbnailFile(file);
                          setAddThumbnailUrl("");
                        }
                      }}
                    />
                  </label>
                </div>
                {(addThumbnailUrl || addThumbnailFile) && (
                  <div className="relative mt-2 inline-block">
                    <Image
                      src={
                        addThumbnailFile
                          ? URL.createObjectURL(addThumbnailFile)
                          : addThumbnailUrl
                      }
                      alt="Preview"
                      width={200}
                      height={112}
                      className="rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAddThumbnailUrl("");
                        setAddThumbnailFile(null);
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetAddForm();
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleAdd} disabled={addSubmitting}>
                {addSubmitting ? "Đang tạo..." : "Tạo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa YouTube Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Author <span className="text-red-500">*</span>
              </label>
              <Input
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tags
              </label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Video URL <span className="text-red-500">*</span>
                {editFetchingMetadata && (
                  <span className="ml-2 text-xs text-slate-500">
                    Đang lấy thông tin...
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <Input
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  onBlur={(e) => handleEditVideoUrlChange(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchEditMetadata}
                  disabled={editFetchingMetadata || !editVideoUrl.trim()}
                >
                  {editFetchingMetadata ? "Đang lấy..." : "Lấy thông tin"}
                </Button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Paste URL YouTube và click "Lấy thông tin" hoặc blur khỏi ô để tự động lấy Title, Author và Thumbnail
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration Label
              </label>
              <Input
                value={editDurationLabel}
                onChange={(e) => setEditDurationLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Thumbnail
              </label>
              <div className="space-y-2">
                <Input
                  placeholder="Hoặc nhập URL thumbnail"
                  value={editThumbnailUrl}
                  onChange={(e) => {
                    setEditThumbnailUrl(e.target.value);
                    setEditThumbnailFile(null);
                  }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Hoặc</span>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <Upload className="h-4 w-4" />
                    Upload từ máy
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditThumbnailFile(file);
                          setEditThumbnailUrl("");
                        }
                      }}
                    />
                  </label>
                </div>
                {(editThumbnailUrl || editThumbnailFile) && (
                  <div className="relative mt-2 inline-block">
                    <Image
                      src={
                        editThumbnailFile
                          ? URL.createObjectURL(editThumbnailFile)
                          : editThumbnailUrl
                      }
                      alt="Preview"
                      width={200}
                      height={112}
                      className="rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditThumbnailUrl("");
                        setEditThumbnailFile(null);
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditCourse(null);
                  resetEditForm();
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleEdit} disabled={editSubmitting}>
                {editSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Bạn có chắc chắn muốn xóa YouTube course "{courseToDelete?.title}"?
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setCourseToDelete(null)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
