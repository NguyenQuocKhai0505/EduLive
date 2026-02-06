"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

type BlogPost = {
  id: number;
  title: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
};

const mockBlogs: BlogPost[] = [
  { id: 1, title: "Bài viết mẫu 1", authorName: "User A", authorRole: "teacher", createdAt: "2024-01-15" },
  { id: 2, title: "Bài viết mẫu 2", authorName: "User B", authorRole: "student", createdAt: "2024-01-14" },
];

export default function ManageBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogs);

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Quản lý Blog
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        Xem và xóa bài viết (UI mẫu — chưa kết nối API).
      </p>
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Bài viết</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Tác giả</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Ngày</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Chưa có bài viết
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-800 dark:text-slate-200">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{post.authorName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700 dark:text-slate-300">
                        {post.authorRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{post.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)} className="gap-1">
                        <Trash2 className="h-4 w-4" /> Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
