"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Star } from "lucide-react";

const categories = [
  { id: "web", label: "Web Development", slug: "web-development" },
  { id: "data", label: "Data Science", slug: "data-science" },
  { id: "mobile", label: "Mobile App", slug: "mobile-apps" },
  { id: "design", label: "Design", slug: "design" },
];

const courses = [

  {

    id: 1,

    categoryId: "web",

    title: "HTML CSS Pro - Học từ cơ bản",

    price: "1.299.000đ",

    image: "https://files.fullstack.edu.vn/f8-prod/courses/15/62f13d2424a47.png",

    rating: 4.9,

    lessons: 120,

    isFeatured: true,

  },

  {

    id: 2,

    categoryId: "web",

    title: "ReactJS Master Class",

    price: "2.500.000đ",

    image: "https://files.fullstack.edu.vn/f8-prod/courses/13/13.png",

    rating: 4.8,

    lessons: 85,

    isFeatured: true,

  },

  {

    id: 3,

    categoryId: "data",

    title: "Python cho người mới bắt đầu",

    price: "Miễn phí",

    image: "https://files.fullstack.edu.vn/f8-prod/courses/19/62f13cb607b4b.png",

    rating: 4.7,

    lessons: 45,

    isFeatured: true,

  },

  {

    id: 4,

    categoryId: "data",

    title: "Machine Learning A-Z",

    price: "1.800.000đ",

    image: "https://files.fullstack.edu.vn/f8-prod/courses/7.png",

    rating: 4.6,

    lessons: 200,

    isFeatured: true,

  },

  {

    id: 5,

    categoryId: "mobile",

    title: "Lập trình Flutter Pro",

    price: "1.500.000đ",

    image: "https://files.fullstack.edu.vn/f8-prod/courses/12.png",

    rating: 5.0,

    lessons: 90,

    isFeatured: true,

  },

];

export function FeaturedCourses() {
  return (
    <div className="py-10 space-y-6 bg-transparent text-foreground transition-colors duration-300">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Skills to transform your career and life
        </h2>
        <p className="text-muted-foreground">
          From critical skills to technical topics, <b>Keducation</b> supports your professional development.
        </p>
      </div>

      <Tabs defaultValue="web" className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none mb-6 overflow-x-auto flex-nowrap scrollbar-hide">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="rounded-none border-b-2 border-transparent px-4 py-3 font-bold 
                         text-muted-foreground 
                         data-[state=active]:border-primary 
                         data-[state=active]:text-foreground 
                         data-[state=active]:bg-transparent 
                         hover:text-foreground transition-colors"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => {
          const filteredCourses = courses.filter(
            (c) => c.categoryId === cat.id && c.isFeatured
          );

          return (
            <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in-50 duration-500 space-y-8">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg border-border">
                  Chưa có khóa học nổi bật cho mục này.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} data={course} />
                  ))}
                </div>
              )}

              <div className="flex justify-start">
                <Button variant="outline" className="border-border hover:bg-accent hover:text-accent-foreground font-bold" asChild>
                  <Link href={`/topic/${cat.slug}`}>
                    Show all {cat.label} courses
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function CourseCard({ data }: { data: any }) {
  return (
    /* Card sử dụng bg-card để tự động chuyển màu tối khi có class .dark */
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-border bg-card h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <CardHeader className="p-4 pb-2">
        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors text-card-foreground">
          {data.title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <span className="font-bold text-yellow-600 flex items-center">
            {data.rating} <Star className="w-3 h-3 ml-1 fill-yellow-600" />
          </span>
          <span className="mx-1">•</span>
          <span className="flex items-center">
            <BookOpen className="w-3 h-3 mr-1" /> {data.lessons} bài
          </span>
        </div>
        <div className="text-xs text-muted-foreground">Giảng viên: Sơn Đặng</div>
      </CardContent>

      <CardFooter className="p-4 border-t border-border pt-3 flex items-center justify-between">
        <span className="font-bold text-lg text-card-foreground">{data.price}</span>
      </CardFooter>
    </Card>
  );
}