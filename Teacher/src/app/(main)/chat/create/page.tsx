"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getMyCourses } from "../../../../services/course.service";
import {
  ChatRoom,
  createChatRoom,
  getMyChatRooms,
} from "../../../../services/chat.service";

type Course = {
  id: number;
  title: string;
};

export default function CreateChatPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [joinUrl, setJoinUrl] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const availableCourses = useMemo(() => {
    const roomCourseIds = new Set(rooms.map((room) => room.courseId));
    return courses.filter((course) => !roomCourseIds.has(course.id));
  }, [courses, rooms]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, roomRes] = await Promise.all([
          getMyCourses(),
          getMyChatRooms(),
        ]);
        setCourses(courseRes.data);
        setRooms(roomRes.data);
      } catch {
        toast.error("Failed to load courses");
      }
    };
    fetchData();
  }, []);

  const handleCreateRoom = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    setCreating(true);
    try {
      const res = await createChatRoom(selectedCourseId);
      setJoinUrl(res.data.joinUrl || "");
      setRooms((prev) => [res.data, ...prev]);
      toast.success("Chat room created");
    } catch {
      toast.error("Failed to create chat room");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyJoinUrl = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      toast.success("Join link copied");
    } catch {
      toast.error("Failed to copy join link");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create Chat Room
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create rooms for courses that do not have chat yet.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="max-w-md">
          <label className="text-sm font-medium">Select Course</label>
          <Select
            value={selectedCourseId ? String(selectedCourseId) : ""}
            onValueChange={(value) => setSelectedCourseId(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availableCourses.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">
              All courses already have chat rooms.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCreateRoom} disabled={creating}>
            {creating ? "Creating..." : "Create Chat"}
          </Button>
          {joinUrl && (
            <Button variant="secondary" onClick={handleCopyJoinUrl}>
              Copy Join Link
            </Button>
          )}
        </div>

        {joinUrl && (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Join link:{" "}
            <a className="text-sky-600 hover:underline" href={joinUrl}>
              {joinUrl}
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
