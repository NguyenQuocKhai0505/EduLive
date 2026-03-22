"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getAllBlogs, BlogResponse, createBlog, CreateBlogRequest, deleteBlog, createComment, updateBlog } from "@/services/blog.service";
import { getMyProfile, UserProfile } from "@/services/user.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Bookmark, Edit3, X, Image as ImageIcon, Trash2, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function BlogPage() {
    const [blogs, setBlogs] = useState<BlogResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    
    // Create Post Dialog State
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [postTags, setPostTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [postImages, setPostImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
    const [editingBlogId, setEditingBlogId] = useState<number | null>(null);

    const resetPostForm = () => {
        setEditingBlogId(null);
        setPostTitle("");
        setPostContent("");
        setPostTags([]);
        setTagInput("");
        setPostImages([]);
        setImagePreviews([]);
    };

    const openEditBlog = (blog: BlogResponse) => {
        setEditingBlogId(blog.id);
        setPostTitle(blog.title);
        setPostContent(blog.content);
        setPostTags(blog.tag?.length ? [...blog.tag] : []);
        setTagInput("");
        setPostImages([]);
        setImagePreviews([]);
        setShowCreateDialog(true);
    };

    // Fetch blogs và user profile
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch blogs từ API thật
                const blogsData = await getAllBlogs();
                setBlogs(blogsData);

                // Fetch user profile (nếu đã đăng nhập)
                try {
                    const userData = await getMyProfile();
                    setUser(userData);
                } catch (err) {
                    // User chưa đăng nhập → không hiển thị nút Write Post
                    setUser(null);
                }
            } catch (err: any) {
                console.error("Error fetching blogs:", err);
                setError(err.response?.data?.message || "Failed to load blogs");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString("en-US");
    };

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + postImages.length > 10) {
            toast.error("Maximum 10 images allowed");
            return;
        }
        setPostImages([...postImages, ...files]);
        
        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    // Handle remove image
    const handleRemoveImage = (index: number) => {
        const newImages = postImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setPostImages(newImages);
        setImagePreviews(newPreviews);
        // Revoke object URL to free memory
        URL.revokeObjectURL(imagePreviews[index]);
    };

    const handleSavePost = async () => {
        if (!postTitle.trim() || !postContent.trim()) {
            toast.error("Please fill in title and content");
            return;
        }

        const loadingToast = toast.loading(editingBlogId ? "Updating post..." : "Publishing post...");

        try {
            setIsSubmitting(true);
            if (editingBlogId != null) {
                const updated = await updateBlog(editingBlogId, {
                    title: postTitle.trim(),
                    content: postContent.trim(),
                    tags: postTags,
                });
                setBlogs((prev) =>
                    prev.map((b) => (b.id === editingBlogId ? { ...b, ...updated } : b))
                );
                resetPostForm();
                setShowCreateDialog(false);
                toast.success("Post updated!", { id: loadingToast });
            } else {
                const newPost: CreateBlogRequest = {
                    title: postTitle.trim(),
                    content: postContent.trim(),
                    tags: postTags.length > 0 ? postTags : undefined,
                    images: postImages.length > 0 ? postImages : undefined,
                };
                const createdPost = await createBlog(newPost);
                setBlogs((prev) => [createdPost, ...prev]);
                resetPostForm();
                setShowCreateDialog(false);
                toast.success("Post published successfully!", { id: loadingToast });
            }
        } catch (error: any) {
            console.error("Error saving post:", error);
            if (error.response?.status === 401) {
                toast.error("Please login to write a post", { id: loadingToast });
            } else {
                toast.error(
                    error.response?.data?.message || "An error occurred while saving the post",
                    { id: loadingToast }
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete blog
    const handleDeleteBlog = async (blogId: number) => {
        toast.promise(
            deleteBlog(blogId),
            {
                loading: "Deleting post...",
                success: () => {
                    setBlogs(prev => prev.filter(blog => blog.id !== blogId));
                    return "Post deleted successfully!";
                },
                error: (error: any) => {
                    return error.response?.data?.message || "Failed to delete post";
                },
            }
        );
    };

    // Handle add tag
    const handleAddTag = () => {
        if (tagInput.trim() && !postTags.includes(tagInput.trim())) {
            setPostTags([...postTags, tagInput.trim()]);
            setTagInput("");
        }
    };

    // Handle remove tag
    const handleRemoveTag = (tagToRemove: string) => {
        setPostTags(postTags.filter(tag => tag !== tagToRemove));
    };

    const handleCommentChange = (blogId: number, value: string) => {
        setCommentTexts((prev) => ({ ...prev, [blogId]: value }));
    };

    const handleSubmitComment = async (blogId: number) => {
        const content = commentTexts[blogId]?.trim();
        if (!content) {
            toast.error("Please enter a comment");
            return;
        }

        const loadingToast = toast.loading("Posting comment...");
        try {
            await createComment(blogId, { content });
            setCommentTexts((prev) => ({ ...prev, [blogId]: "" }));
            setBlogs((prev) =>
                prev.map((blog) =>
                    blog.id === blogId
                        ? { ...blog, commentsCount: blog.commentsCount + 1 }
                        : blog
                )
            );
            toast.success("Comment posted!", { id: loadingToast });
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error("Please login to comment", { id: loadingToast });
            } else {
                toast.error(error.response?.data?.message || "Failed to post comment", { id: loadingToast });
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-slate-600 dark:text-slate-400">
                    Loading...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600 dark:text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- CỘT TRÁI (Main Content) --- */}
                <div className="lg:col-span-8">
                    {/* WRITE POST BAR */}
                    {user && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <button
                                onClick={() => {
                                    resetPostForm();
                                    setShowCreateDialog(true);
                                }}
                                className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 dark:border-purple-800">
                                    <Image
                                        src={user.avatar || "/default-avatar.png"}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="flex-1 text-slate-500 dark:text-slate-400">
                                    What are you thinking? Write Post?
                                </span>
                                <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <h1 className="text-2xl font-bold">The latest posts</h1>
                        <div className="w-full sm:w-64">
                            <Input
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {blogs.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                No posts yet
                            </div>
                        ) : (
                            blogs
                                .filter(blog => blog.author) // ✨ Filter blogs có author
                                .filter((blog) => {
                                    if (!searchQuery.trim()) return true;
                                    const query = searchQuery.toLowerCase();
                                    const title = blog.title?.toLowerCase() || "";
                                    const content = blog.content?.toLowerCase() || "";
                                    const author = blog.author?.fullName?.toLowerCase() || "";
                                    const tags = blog.tag?.join(" ").toLowerCase() || "";
                                    return (
                                        title.includes(query) ||
                                        content.includes(query) ||
                                        author.includes(query) ||
                                        tags.includes(query)
                                    );
                                })
                                .map((blog) => (
                                <div
                                    key={blog.id}
                                    className="border rounded-xl p-5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm"
                                >
                                    {/* Header: Author info */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {blog.author && (
                                                <>
                                                    <Link href={`/profile/${blog.author.id}`}>
                                                        <div className="relative w-9 h-9 rounded-full overflow-hidden border">
                                                            <Image
                                                                src={blog.author.avatar || "/default-avatar.png"}
                                                                alt={blog.author.fullName || "Unknown"}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </Link>
                                                    <div>
                                                        <Link
                                                            href={`/profile/${blog.author.id}`}
                                                            className="text-sm font-semibold hover:underline block leading-tight"
                                                        >
                                                            {blog.author.fullName || "Unknown"}
                                                        </Link>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {formatDate(blog.createdAt)}
                                                        </p>
                                                        {blog.author.role && (
                                                            <span className="inline-block mt-1 text-xs font-medium text-sky-600 dark:text-sky-400">
                                                               {blog.author.role.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Edit & Delete buttons for owner/admin */}
                                            {user && (user.role === 'admin' || blog.authorId === user.id) && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditBlog(blog)}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="Edit post"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBlog(blog.id)}
                                                        className="text-slate-400 hover:text-red-600 transition-colors"
                                                        title="Delete post"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button className="text-slate-400 hover:text-purple-600 transition-colors">
                                                <Bookmark className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Body: Title & Content */}
                                    <div className="mb-4 pl-12">
                                        <Link href={`/blog/${blog.id}`}>
                                            <h2 className="text-xl font-bold mb-2 cursor-pointer hover:text-purple-600 transition-colors">
                                                {blog.title}
                                            </h2>
                                        </Link>
                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm">
                                            {blog.content.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                        {/* Display blog images */}
                                        {blog.images && blog.images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                                {blog.images.slice(0, 3).map((imageUrl, index) => (
                                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                                                        <Image
                                                            src={imageUrl}
                                                            alt={`Blog image ${index + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {blog.images.length > 3 && (
                                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                            +{blog.images.length - 3}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer: Tags & Interaction */}
                                    <div className="pl-12 flex items-center justify-between">
                                        <div className="flex gap-2 flex-wrap">
                                            {blog.tag && blog.tag.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="rounded-full font-normal text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" /> {blog.likesCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" /> {blog.commentsCount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment on main page */}
                                    <div className="pl-12 mt-4">
                                        {user ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Write a comment..."
                                                    value={commentTexts[blog.id] || ""}
                                                    onChange={(e) => handleCommentChange(blog.id, e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    onClick={() => handleSubmitComment(blog.id)}
                                                    disabled={!commentTexts[blog.id]?.trim()}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    Comment
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                Please login to comment.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- CỘT PHẢI (Sidebar) --- */}
                <div className="lg:col-span-4 pl-0 lg:pl-8 mt-8 lg:mt-0">
                    <div className="sticky top-24">
                        <h3 className="font-bold text-slate-500 uppercase text-xs mb-4">
                            Suggested Topics
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-8">
                            {["Front-end", "Back-end", "UI / UX Design", "DevOps", "AI"].map(topic => (
                                <Badge
                                    key={topic}
                                    className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 bg-slate-100 text-slate-600 px-3 py-2 rounded-full border-none transition-colors"
                                >
                                    {topic}
                                </Badge>
                            ))}
                        </div>

                        {/* Banner Quảng cáo */}
                        <div className="rounded-xl overflow-hidden relative aspect-video bg-gradient-to-br from-purple-700 to-indigo-600 flex items-center justify-center text-white text-center p-6 shadow-lg">
                            <div>
                                <h4 className="font-bold text-xl mb-1">HTML CSS PRO</h4>
                                <p className="text-xs opacity-90 mb-4">Practical course for beginners</p>
                                <Link href="/courses/1">
                                    <span className="inline-block bg-white text-purple-700 text-xs font-bold py-2.5 px-5 rounded-full cursor-pointer hover:bg-slate-100 hover:scale-105 transition-all">
                                        Enroll Now
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE POST DIALOG */}
            <Dialog
                open={showCreateDialog}
                onOpenChange={(open) => {
                    if (!open) resetPostForm();
                    setShowCreateDialog(open);
                }}
            >
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBlogId ? "Edit Post" : "Create New Post"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Title Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Title *
                            </label>
                            <Input
                                placeholder="Enter post title..."
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Content Textarea */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Content * (HTML)
                            </label>
                            <textarea
                                placeholder="Write post content... (HTML format)"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                rows={10}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                You can use HTML to format content
                            </p>
                        </div>

                        {/* Image Upload — chỉ khi tạo mới (API PATCH chưa hỗ trợ đổi ảnh) */}
                        {!editingBlogId && (
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Images (Optional, max 10)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                width={200}
                                                height={200}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        )}

                        {/* Tags Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Tags (Optional)
                            </label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="Enter tag and press Enter..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddTag}
                                    variant="outline"
                                    disabled={!tagInput.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                            {/* Tags Display */}
                            {postTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {postTags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="rounded-full px-3 py-1 flex items-center gap-2"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetPostForm();
                                    setShowCreateDialog(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSavePost}
                                disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isSubmitting
                                    ? editingBlogId
                                        ? "Saving..."
                                        : "Publishing..."
                                    : editingBlogId
                                      ? "Save changes"
                                      : "Publish Post"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
