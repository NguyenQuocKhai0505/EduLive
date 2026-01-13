"use client";

import Link from "next/link";
import Image from "next/image";
import { MOCK_POSTS, MOCK_USERS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Bookmark } from "lucide-react";

export default function BlogPage() {
  // Helper lấy thông tin user từ post
  const getAuthor = (userId: string) => MOCK_USERS.find(u => u.id === userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- CỘT TRÁI (Main Feed) --- */}
        <div className="lg:col-span-8">
          <h1 className="text-2xl font-bold mb-6">Bài viết nổi bật</h1>
          <div className="space-y-6">
            {MOCK_POSTS.map((post) => {
              const author = getAuthor(post.userId);
              return (
                <div key={post.id} className="border rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors bg-white dark:bg-slate-950 dark:border-slate-800">
                  {/* Header: Author info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${author?.id}`}>
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border">
                            <Image src={author?.avatar || ""} alt="Avt" fill className="object-cover"/>
                          </div>
                        </Link>
                        <div>
                           <Link href={`/profile/${author?.id}`} className="text-sm font-semibold hover:underline">
                              {author?.name}
                           </Link>
                           <p className="text-xs text-slate-500">{post.createdAt}</p>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><Bookmark className="w-4 h-4" /></button>
                  </div>

                  {/* Body: Title & Content */}
                  <div className="mb-4 pl-10">
                     <Link href={`/blog/${post.id}`}>
                        <h2 className="text-xl font-bold mb-2 cursor-pointer hover:text-purple-600">
                           {post.title}
                        </h2>
                     </Link>
                     <p className="text-slate-600 line-clamp-2 text-sm">
                        {post.content.replace(/<[^>]*>?/gm, '')} {/* Strip HTML tags đơn giản */}
                     </p>
                  </div>

                  {/* Footer: Tags & Interaction */}
                  <div className="pl-10 flex items-center justify-between">
                     <div className="flex gap-2">
                        {post.tags.map(tag => (
                           <Badge key={tag} variant="secondary" className="rounded-full font-normal text-xs text-slate-500 bg-slate-100 dark:bg-slate-800">
                              {tag}
                           </Badge>
                        ))}
                     </div>
                     <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1 cursor-pointer hover:text-red-500">
                           <Heart className="w-4 h-4" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1 cursor-pointer hover:text-blue-500">
                           <MessageCircle className="w-4 h-4" /> {post.comments}
                        </span>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- CỘT PHẢI (Sidebar Topics) --- */}
        <div className="lg:col-span-4 pl-8">
           <div className="sticky top-24">
              <h3 className="font-bold text-slate-500 uppercase text-xs mb-4">Các chủ đề được đề xuất</h3>
              <div className="flex flex-wrap gap-2">
                 {["Front-end", "Back-end", "UI / UX Design", "Others"].map(topic => (
                    <Badge key={topic} className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 bg-slate-100 text-slate-600 px-3 py-2 rounded-full border-none">
                       {topic}
                    </Badge>
                 ))}
              </div>

              {/* Banner quảng cáo khóa học (như ảnh F8) */}
              <div className="mt-8 rounded-lg overflow-hidden relative aspect-video bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-center p-4">
                  <div>
                     <h4 className="font-bold text-lg">HTML CSS PRO</h4>
                     <p className="text-xs opacity-90 mt-1">Khóa học thực chiến cho người mới</p>
                     <button className="mt-3 bg-white text-purple-700 text-xs font-bold py-2 px-4 rounded-full">Tìm hiểu thêm</button>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}