"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { 
    getBlogById, 
    toggleLike, 
    checkUserLiked, 
    createComment, 
    getComments,
    deleteBlog,
    updateBlog,
    BlogResponse,
    CommentResponse 
} from "@/services/blog.service";
import { getMyProfile, UserProfile } from "@/services/user.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MessageCircle, Heart, Share2, MoreHorizontal, Send, X, Image as ImageIcon, Trash2, Pencil } from "lucide-react";

export default function BlogPostPage() {
    const params = useParams();
    const blogId = parseInt(params.id as string);

    const [blog, setBlog] = useState<BlogResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    
    // Like state
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    
    // Comment state
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [commentImages, setCommentImages] = useState<File[]>([]);
    const [commentImagePreviews, setCommentImagePreviews] = useState<string[]>([]);

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editTags, setEditTags] = useState<string[]>([]);
    const [editTagInput, setEditTagInput] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Fetch blog data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch blog
                const blogData = await getBlogById(blogId);
                setBlog(blogData);
                setLikesCount(blogData.likesCount);

                // Check if user liked (nếu đã đăng nhập)
                try {
                    const { liked } = await checkUserLiked(blogId);
                    setIsLiked(liked);
                } catch (err) {
                    // User chưa đăng nhập → không check
                    setIsLiked(false);
                }

                // Fetch comments
                const commentsData = await getComments(blogId);
                setComments(commentsData);

                // Fetch user profile (nếu đã đăng nhập)
                try {
                    const userData = await getMyProfile();
                    setUser(userData);
                } catch (err) {
                    setUser(null);
                }
            } catch (err: any) {
                console.error("Error fetching blog:", err);
                setError(err.response?.data?.message || "Blog not found");
            } finally {
                setLoading(false);
            }
        };

        if (blogId) {
            fetchData();
        }
    }, [blogId]);

    // Handle like
    const handleLike = async () => {
        try {
            const result = await toggleLike(blogId);
            setIsLiked(result.liked);
            setLikesCount(result.likesCount);
            toast.success(result.liked ? "Post liked!" : "Post unliked");
        } catch (error: any) {
            console.error("Error toggling like:", error);
            if (error.response?.status === 401) {
                toast.error("Please login to like the post");
            } else {
                toast.error("Failed to like post");
            }
        }
    };

    // Handle comment image selection
    const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + commentImages.length > 10) {
            toast.error("Maximum 10 images allowed");
            return;
        }
        setCommentImages([...commentImages, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setCommentImagePreviews([...commentImagePreviews, ...newPreviews]);
    };

    // Handle remove comment image
    const handleRemoveCommentImage = (index: number) => {
        const newImages = commentImages.filter((_, i) => i !== index);
        const newPreviews = commentImagePreviews.filter((_, i) => i !== index);
        setCommentImages(newImages);
        setCommentImagePreviews(newPreviews);
        URL.revokeObjectURL(commentImagePreviews[index]);
    };

    // Handle comment
    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() && commentImages.length === 0) return;

        const loadingToast = toast.loading(replyingTo ? "Posting reply..." : "Posting comment...");

        try {
            const newComment = await createComment(blogId, {
                content: commentText,
                parentId: replyingTo || undefined,
                images: commentImages.length > 0 ? commentImages : undefined
            });
            
            // Thêm comment mới vào danh sách
            if (replyingTo) {
                setComments(prev => prev.map(comment => {
                    if (comment.id === replyingTo) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newComment]
                        };
                    }
                    return comment;
                }));
            } else {
                setComments(prev => [newComment, ...prev]);
            }
            
            setCommentText("");
            setReplyingTo(null);
            setCommentImages([]);
            setCommentImagePreviews([]);
            
            // Cập nhật commentsCount trong blog
            if (blog) {
                setBlog({ ...blog, commentsCount: blog.commentsCount + 1 });
            }
            
            toast.success(replyingTo ? "Reply posted!" : "Comment posted!", { id: loadingToast });
        } catch (error: any) {
            console.error("Error creating comment:", error);
            if (error.response?.status === 401) {
                toast.error("Please login to comment", { id: loadingToast });
            } else {
                toast.error("Failed to post comment", { id: loadingToast });
            }
        }
    };

    // Handle delete blog
    const handleDeleteBlog = async () => {
        toast.promise(
            deleteBlog(blogId),
            {
                loading: "Deleting post...",
                success: () => {
                    setTimeout(() => {
                        window.location.href = "/blog";
                    }, 1000);
                    return "Post deleted successfully!";
                },
                error: (error: any) => {
                    return error.response?.data?.message || "Failed to delete post";
                },
            }
        );
    };

    const resetEditForm = () => {
        setEditTitle("");
        setEditContent("");
        setEditTags([]);
        setEditTagInput("");
    };

    const openEditBlogDialog = () => {
        if (!blog) return;
        setEditTitle(blog.title);
        setEditContent(blog.content);
        setEditTags(Array.isArray(blog.tag) && blog.tag.length ? [...blog.tag] : []);
        setEditTagInput("");
        setShowEditDialog(true);
    };

    const handleAddEditTag = () => {
        const t = editTagInput.trim();
        if (t && !editTags.includes(t)) {
            setEditTags([...editTags, t]);
            setEditTagInput("");
        }
    };

    const handleRemoveEditTag = (tag: string) => {
        setEditTags(editTags.filter((x) => x !== tag));
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            toast.error("Please fill in title and content");
            return;
        }
        const loadingToast = toast.loading("Saving...");
        try {
            setIsSavingEdit(true);
            const updated = await updateBlog(blogId, {
                title: editTitle.trim(),
                content: editContent.trim(),
                tags: editTags,
            });
            setBlog((prev) => (prev ? { ...prev, ...updated } : null));
            setShowEditDialog(false);
            resetEditForm();
            toast.success("Post updated!", { id: loadingToast });
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to update post",
                { id: loadingToast }
            );
        } finally {
            setIsSavingEdit(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center text-slate-600 dark:text-slate-400">
                    Loading...
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {error || "Blog not found"}
                    </h2>
                    <Link href="/blog">
                        <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                            Back to Blog
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* SIDEBAR: Author info */}
                {blog.author && (
                    <aside className="lg:col-span-3 order-2 lg:order-1">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-6 shadow-sm text-center">
                                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-100 dark:border-slate-800">
                                    <Image
                                        src={blog.author.avatar || "/default-avatar.png"}
                                        alt={blog.author.fullName || "Unknown"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{blog.author.fullName || "Unknown"}</h3>
                                <p className="text-sm text-purple-600 font-medium mb-3 capitalize">
                                    {blog.author.role === 'teacher' ? 'Instructor' : 'Student'}
                                </p>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-3">
                                    {blog.author.bio || "No introduction yet"}
                                </p>
                                <Link href={`/profile/${blog.author.id}`} className="block w-full">
                                    <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                                        View Profile
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </aside>
                )}

                {/* MAIN CONTENT */}
                <main className="lg:col-span-9 order-1 lg:order-2">
                    <div className="bg-white dark:bg-slate-950 rounded-xl p-6 md:p-12 shadow-sm border dark:border-slate-800">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex gap-2 mb-4">
                                {blog.tag && blog.tag.map((tag) => (
                                    <Badge
                                        key={tag}
                                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                                {blog.title}
                            </h1>
                            <div className="flex items-center gap-6 text-slate-500 text-sm">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> {formatDate(blog.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> 5 min read
                                </span>
                            </div>
                        </div>

                        {/* Content HTML */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none mb-10 text-slate-700 dark:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Display blog images */}
                        {blog.images && blog.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {blog.images.map((imageUrl, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={`Blog image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between py-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex gap-4">
                                <Button
                                    variant="ghost"
                                    className={`gap-2 ${isLiked ? 'text-red-500 bg-red-50' : 'text-slate-500'}`}
                                    onClick={handleLike}
                                >
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    {likesCount} Likes
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="gap-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                                    onClick={() => setShowCommentModal(true)}
                                >
                                    <MessageCircle className="w-5 h-5" /> {blog.commentsCount} Comments
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                {/* Edit & Delete buttons for owner/admin */}
                                {user && (user.role === 'admin' || blog.authorId === user.id) && (
                                    <>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={openEditBlogDialog}
                                            title="Edit post"
                                        >
                                            <Pencil className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={handleDeleteBlog}
                                            title="Delete post"
                                        >
                                            <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-600" />
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" size="icon">
                                    <Share2 className="w-5 h-5 text-slate-400" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* COMMENT MODAL */}
            {showCommentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => {
                            setShowCommentModal(false);
                            setReplyingTo(null);
                        }}
                    ></div>

                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                            <h3 className="text-lg font-bold">Comments ({blog.commentsCount})</h3>
                            <Button variant="ghost" size="icon" onClick={() => {
                                setShowCommentModal(false);
                                setReplyingTo(null);
                            }} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-950">
                            {comments.length === 0 ? (
                                <p className="text-center text-slate-500 py-10">No comments yet.</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="space-y-3">
                                        {/* Main Comment */}
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex-shrink-0 flex items-center justify-center font-bold text-sm select-none">
                                                {comment.user.fullName.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-sm">{comment.user.fullName}</h4>
                                                        <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                                                    </div>
                                                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                                                        {comment.content}
                                                    </p>
                                                    {/* Display comment images */}
                                                    {comment.images && comment.images.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            {comment.images.map((imageUrl, imgIndex) => (
                                                                <div key={imgIndex} className="relative aspect-video rounded-lg overflow-hidden">
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt={`Comment image ${imgIndex + 1}`}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-4 mt-1 ml-2 text-xs text-slate-500 font-medium">
                                                    <button 
                                                        className="hover:text-purple-600"
                                                        onClick={() => {
                                                            setReplyingTo(comment.id);
                                                            setCommentText(`@${comment.user.fullName} `);
                                                        }}
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="pl-11 space-y-3">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold text-sm select-none">
                                                            {reply.user.fullName.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-bold text-sm">{reply.user.fullName}</h4>
                                                                    <span className="text-xs text-slate-400">{formatRelativeTime(reply.createdAt)}</span>
                                                                </div>
                                                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                                                    {reply.content}
                                                                </p>
                                                                {/* Display reply images */}
                                                                {reply.images && reply.images.length > 0 && (
                                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                                        {reply.images.map((imageUrl, imgIndex) => (
                                                                            <div key={imgIndex} className="relative aspect-video rounded-lg overflow-hidden">
                                                                                <Image
                                                                                    src={imageUrl}
                                                                                    alt={`Reply image ${imgIndex + 1}`}
                                                                                    fill
                                                                                    className="object-cover"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reply Input (nếu đang reply comment này) */}
                                        {replyingTo === comment.id && (
                                            <div className="pl-11 space-y-2">
                                                {/* Image previews for reply */}
                                                {commentImagePreviews.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {commentImagePreviews.map((preview, index) => (
                                                            <div key={index} className="relative group">
                                                                <Image
                                                                    src={preview}
                                                                    alt={`Preview ${index + 1}`}
                                                                    width={100}
                                                                    height={100}
                                                                    className="w-full h-20 object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCommentImage(index)}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <form onSubmit={handleComment} className="flex gap-3 items-center">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-4 pr-20 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                                            placeholder="Write a reply..."
                                                            value={commentText}
                                                            onChange={(e) => setCommentText(e.target.value)}
                                                        />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleCommentImageChange}
                                                            className="hidden"
                                                            id="reply-image-input"
                                                        />
                                                        <label
                                                            htmlFor="reply-image-input"
                                                            className="absolute right-12 top-2 p-2 text-slate-500 hover:text-purple-600 cursor-pointer"
                                                        >
                                                            <ImageIcon className="w-4 h-4" />
                                                        </label>
                                                        <button
                                                            type="submit"
                                                            disabled={!commentText.trim() && commentImages.length === 0}
                                                            className="absolute right-2 top-1.5 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800 z-10">
                            {replyingTo && (
                                <div className="mb-2 text-xs text-purple-600">
                                    Replying to: {comments.find(c => c.id === replyingTo)?.user.fullName}
                                    <button 
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setCommentText("");
                                            setCommentImages([]);
                                            setCommentImagePreviews([]);
                                        }}
                                        className="ml-2 text-slate-500 hover:text-slate-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                            {/* Image previews */}
                            {commentImagePreviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {commentImagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className="w-full h-20 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCommentImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <form onSubmit={handleComment} className="flex gap-3 items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-4 pr-20 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleCommentImageChange}
                                        className="hidden"
                                        id="comment-image-input"
                                    />
                                    <label
                                        htmlFor="comment-image-input"
                                        className="absolute right-12 top-2 p-2 text-slate-500 hover:text-purple-600 cursor-pointer"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim() && commentImages.length === 0}
                                        className="absolute right-2 top-1.5 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Dialog
                open={showEditDialog}
                onOpenChange={(open) => {
                    if (!open) resetEditForm();
                    setShowEditDialog(open);
                }}
            >
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Title *</label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Post title"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Content * (HTML)</label>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={10}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                placeholder="Post content..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tags</label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={editTagInput}
                                    onChange={(e) => setEditTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddEditTag();
                                        }
                                    }}
                                    placeholder="Tag + Enter"
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" onClick={handleAddEditTag}>
                                    Add
                                </Button>
                            </div>
                            {editTags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {editTags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="rounded-full px-3 py-1 flex items-center gap-2"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEditTag(tag)}
                                                className="hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetEditForm();
                                    setShowEditDialog(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={isSavingEdit || !editTitle.trim() || !editContent.trim()}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isSavingEdit ? "Saving..." : "Save changes"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}