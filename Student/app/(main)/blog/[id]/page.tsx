"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_POSTS, MOCK_USERS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageCircle, Heart, Share2, MoreHorizontal, Send, X } from "lucide-react";

export default function BlogPostPage({ params }: { params: { id: string } }) {
  // 1. Tìm dữ liệu bài viết và tác giả
  const post = MOCK_POSTS.find((p) => p.id === params.id);
  if (!post) return notFound();
  
  const author = MOCK_USERS.find((u) => u.id === post.userId);

  // 2. State quản lý tương tác
  const [isLiked, setIsLiked] = useState(false);
  
  // State cho Popup Comment
  const [showCommentModal, setShowCommentModal] = useState(false); 
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Nguyen Van A", content: "Bài viết rất hay, cảm ơn bạn!", date: "2 phút trước" },
    { id: 2, user: "Tran Thi B", content: "Hóng phần tiếp theo ạ.", date: "1 giờ trước" },
    { id: 3, user: "Le Van C", content: "Phần TypeScript giải thích rất dễ hiểu.", date: "3 giờ trước" }
  ]);

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user: "You",
      content: commentText,
      date: "Vừa xong"
    };
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- SIDEBAR TRÁI: THÔNG TIN TÁC GIẢ (Sticky) --- */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-6 shadow-sm text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-100 dark:border-slate-800">
                    <Image src={author?.avatar || ""} alt="Avt" fill className="object-cover" />
                </div>
                <h3 className="font-bold text-lg mb-1">{author?.name}</h3>
                <p className="text-sm text-purple-600 font-medium mb-3 capitalize">
                    {author?.role === 'teacher' ? 'Giảng viên' : 'Học viên'}
                </p>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3">{author?.bio}</p>
                <Link href={`/profile/${author?.id}`} className="block w-full">
                    <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                        Xem Profile
                    </Button>
                </Link>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT: NỘI DUNG BÀI VIẾT --- */}
        <main className="lg:col-span-9 order-1 lg:order-2">
            <div className="bg-white dark:bg-slate-950 rounded-xl p-6 md:p-12 shadow-sm border dark:border-slate-800">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex gap-2 mb-4">
                        {post.tags.map(tag => (
                            <Badge key={tag} className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-slate-500 text-sm">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.createdAt}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 5 phút đọc</span>
                    </div>
                </div>

                {/* Content HTML */}
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none mb-10 text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />
                
                {/* Action Bar (Nút mở Popup ở đây) */}
                <div className="flex items-center justify-between py-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                        <Button 
                            variant="ghost" 
                            className={`gap-2 ${isLiked ? 'text-red-500 bg-red-50' : 'text-slate-500'}`}
                            onClick={() => setIsLiked(!isLiked)}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} /> 
                            {post.likes + (isLiked ? 1 : 0)} Yêu thích
                        </Button>

                        {/* 👇 Nút Bấm để mở Popup */}
                        <Button 
                            variant="ghost" 
                            className="gap-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                            onClick={() => setShowCommentModal(true)}
                        >
                            <MessageCircle className="w-5 h-5" /> {comments.length} Bình luận
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon"><Share2 className="w-5 h-5 text-slate-400" /></Button>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5 text-slate-400" /></Button>
                    </div>
                </div>
            </div>
        </main>
      </div>

      {/* --- POPUP MODAL COMPONENT --- */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Lớp nền tối (Click ra ngoài để đóng) */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowCommentModal(false)}
            ></div>

            {/* Hộp thoại Popup */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
                
                {/* Header Popup */}
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <h3 className="text-lg font-bold">Bình luận ({comments.length})</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowCommentModal(false)} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Danh sách bình luận (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-950">
                    {comments.length === 0 ? (
                        <p className="text-center text-slate-500 py-10">Chưa có bình luận nào.</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex-shrink-0 flex items-center justify-center font-bold text-sm select-none">
                                    {comment.user.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-sm">{comment.user}</h4>
                                            <span className="text-xs text-slate-400">{comment.date}</span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                                            {comment.content}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 mt-1 ml-2 text-xs text-slate-500 font-medium">
                                        <button className="hover:text-purple-600">Thích</button>
                                        <button className="hover:text-purple-600">Phản hồi</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Ô nhập bình luận */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800 z-10">
                    <form onSubmit={handleComment} className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-4 pr-12 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                placeholder="Viết bình luận..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button 
                                type="submit"
                                disabled={!commentText.trim()}
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
    </div>
  );
}