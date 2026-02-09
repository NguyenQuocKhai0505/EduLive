"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
    uploadCategoryIcon,
    type CategoryResponse,
    type CreateCategoryRequest,
} from "../../../services/category.service";
import { toast } from "sonner";
import Image from "next/image";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../../components/ui/dialog";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add form state
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addName, setAddName] = useState("");
    const [addSlug, setAddSlug] = useState("");
    const [addDescription, setAddDescription] = useState("");
    const [addImageUrl, setAddImageUrl] = useState("");
    const [addImageFile, setAddImageFile] = useState<File | null>(null);
    const [addIconUrl, setAddIconUrl] = useState("");
    const [addIconFile, setAddIconFile] = useState<File | null>(null);
    const [addIsActive, setAddIsActive] = useState(true);
    const [addSubmitting, setAddSubmitting] = useState(false);

    // Edit state
    const [editCategory, setEditCategory] = useState<CategoryResponse | null>(null);
    const [editName, setEditName] = useState("");
    const [editSlug, setEditSlug] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editImageUrl, setEditImageUrl] = useState("");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editIconUrl, setEditIconUrl] = useState("");
    const [editIconFile, setEditIconFile] = useState<File | null>(null);
    const [editIsActive, setEditIsActive] = useState(true);
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Delete confirm
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponse | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllCategories(true); // admin: include inactive
            setCategories(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Failed to load categories");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openEdit = (cat: CategoryResponse) => {
        setEditCategory(cat);
        setEditName(cat.name);
        setEditSlug(cat.slug ?? "");
        setEditDescription(cat.description ?? "");
        setEditImageUrl(cat.image ?? "");
        setEditImageFile(null);
        setEditIconUrl(cat.icon ?? "");
        setEditIconFile(null);
        setEditIsActive(cat.isActive);
    };

    const handleAdd = async () => {
        if (!addName.trim()) {
            toast.error("Category name is required");
            return;
        }
        setAddSubmitting(true);
        try {
            let created = await createCategory({
                name: addName.trim(),
                slug: addSlug.trim() || undefined,
                description: addDescription.trim() || undefined,
                image: addImageUrl.trim() || undefined,
                icon: addIconUrl.trim() || undefined,
                isActive: addIsActive,
            });
            if (addImageFile) {
                const res = await uploadCategoryImage(created.id, addImageFile);
                created = res.category;
            }
            if (addIconFile) {
                const res = await uploadCategoryIcon(created.id, addIconFile);
                created = res.category;
            }
            setCategories((prev) => [created, ...prev]);
            setShowAddDialog(false);
            setAddName("");
            setAddSlug("");
            setAddDescription("");
            setAddImageUrl("");
            setAddImageFile(null);
            setAddIconUrl("");
            setAddIconFile(null);
            setAddIsActive(true);
            toast.success("Category created");
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to create category");
        } finally {
            setAddSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!editCategory) return;
        if (!editName.trim()) {
            toast.error("Category name is required");
            return;
        }
        setEditSubmitting(true);
        try {
            let updated = await updateCategory(editCategory.id, {
                name: editName.trim(),
                slug: editSlug.trim() || undefined,
                description: editDescription.trim() || undefined,
                image: editImageUrl.trim() || undefined,
                icon: editIconUrl.trim() || undefined,
                isActive: editIsActive,
            });
            if (editImageFile) {
                const res = await uploadCategoryImage(editCategory.id, editImageFile);
                updated = res.category;
            }
            if (editIconFile) {
                const res = await uploadCategoryIcon(editCategory.id, editIconFile);
                updated = res.category;
            }
            setCategories((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
            );
            setEditCategory(null);
            toast.success("Category updated");
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to update category");
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleToggle = async (cat: CategoryResponse) => {
        try {
            const updated = await updateCategory(cat.id, {
                isActive: !cat.isActive,
            });
            setCategories((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
            );
            toast.success(updated.isActive ? "Category enabled" : "Category disabled");
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to toggle");
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete.id);
            setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
            setCategoryToDelete(null);
            toast.success("Category deleted");
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to delete category");
        }
    };

    if (loading && categories.length === 0) {
        return (
            <div className="p-6">
                <p className="text-slate-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Button onClick={() => setShowAddDialog(true)}>
                    Add Category
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300 w-20">
                                    Image
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                                    Slug
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">
                                    Courses
                                </th>
                                <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">
                                    isActive
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-slate-500"
                                    >
                                        No categories yet. Add one above.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                    >
                                        <td className="px-4 py-3">
                                            {(cat.image || cat.icon) ? (
                                                <div className="relative w-10 h-10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                    <Image
                                                        src={cat.image || cat.icon || ""}
                                                        alt={cat.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                            {cat.name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            {cat.slug ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                            {cat.description ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                                            {cat.courseCount}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    cat.isActive
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                                                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                                                }`}
                                            >
                                                {cat.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(cat)}
                                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-600"
                                                    title={cat.isActive ? "Disable" : "Enable"}
                                                >
                                                    {cat.isActive ? (
                                                        <PowerOff className="h-4 w-4" />
                                                    ) : (
                                                        <Power className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(cat)}
                                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCategoryToDelete(cat)}
                                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Category Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Name *
                            </label>
                            <Input
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                placeholder="Category name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Slug (optional)
                            </label>
                            <Input
                                value={addSlug}
                                onChange={(e) => setAddSlug(e.target.value)}
                                placeholder="url-slug"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Description (optional)
                            </label>
                            <Input
                                value={addDescription}
                                onChange={(e) => setAddDescription(e.target.value)}
                                placeholder="Short description"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Image
                            </label>
                            <p className="text-xs text-slate-500 mb-1">URL or upload file (saved to Cloudinary)</p>
                            <Input
                                value={addImageUrl}
                                onChange={(e) => { setAddImageUrl(e.target.value); setAddImageFile(null); }}
                                placeholder="https://... or leave empty and choose file"
                                className="mb-2"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) { setAddImageFile(f); setAddImageUrl(""); }
                                }}
                                className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:text-slate-700"
                            />
                            {addImageFile && <span className="text-xs text-slate-500 mt-1 block">File: {addImageFile.name}</span>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Icon
                            </label>
                            <p className="text-xs text-slate-500 mb-1">URL or upload file (saved to Cloudinary)</p>
                            <Input
                                value={addIconUrl}
                                onChange={(e) => { setAddIconUrl(e.target.value); setAddIconFile(null); }}
                                placeholder="https://... or leave empty and choose file"
                                className="mb-2"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) { setAddIconFile(f); setAddIconUrl(""); }
                                }}
                                className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:text-slate-700"
                            />
                            {addIconFile && <span className="text-xs text-slate-500 mt-1 block">File: {addIconFile.name}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="add-active"
                                checked={addIsActive}
                                onChange={(e) => setAddIsActive(e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="add-active" className="text-sm text-slate-600 dark:text-slate-400">
                                Active
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdd}
                                disabled={!addName.trim() || addSubmitting}
                            >
                                {addSubmitting ? "Saving..." : "Add"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Name *
                            </label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Category name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Slug (optional)
                            </label>
                            <Input
                                value={editSlug}
                                onChange={(e) => setEditSlug(e.target.value)}
                                placeholder="url-slug"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Description (optional)
                            </label>
                            <Input
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Short description"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Image (URL or upload)
                            </label>
                            {(editCategory?.image || editCategory?.icon) && (
                                <div className="relative w-16 h-16 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                                    <Image
                                        src={editCategory.image || editCategory.icon || ""}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}
                            <Input
                                value={editImageUrl}
                                onChange={(e) => { setEditImageUrl(e.target.value); setEditImageFile(null); }}
                                placeholder="Image URL"
                                className="mb-2"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setEditImageFile(f);
                                }}
                                className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100"
                            />
                            {editImageFile && <span className="text-xs text-slate-500 mt-1 block">New file: {editImageFile.name}</span>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Icon (URL or upload)
                            </label>
                            <Input
                                value={editIconUrl}
                                onChange={(e) => { setEditIconUrl(e.target.value); setEditIconFile(null); }}
                                placeholder="Icon URL"
                                className="mb-2"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setEditIconFile(f);
                                }}
                                className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100"
                            />
                            {editIconFile && <span className="text-xs text-slate-500 mt-1 block">New file: {editIconFile.name}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="edit-active"
                                checked={editIsActive}
                                onChange={(e) => setEditIsActive(e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="edit-active" className="text-sm text-slate-600 dark:text-slate-400">
                                Active
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setEditCategory(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEdit}
                                disabled={!editName.trim() || editSubmitting}
                            >
                                {editSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-600 dark:text-slate-400 py-2">
                        Are you sure you want to delete this category?
                        {categoryToDelete && (
                            <span className="block font-medium text-foreground mt-1">
                                &ldquo;{categoryToDelete.name}&rdquo;
                            </span>
                        )}
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCategoryToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
