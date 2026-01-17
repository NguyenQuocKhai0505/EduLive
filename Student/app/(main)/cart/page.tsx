"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { getAllCourses, CourseResponse } from "@/services/course.service";
import { Trash2, ShoppingCart, Star } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, totalPrice, addToCart } = useCart();
  const [suggestedCourses, setSuggestedCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedCourses = async () => {
      try {
        setLoading(true);
        // Lấy tất cả courses đã publish, lấy 3 courses đầu tiên
        const courses = await getAllCourses();
        setSuggestedCourses(courses.filter(c => c.isPublished).slice(0, 3));
      } catch (error) {
        console.error("Error fetching suggested courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedCourses();
  }, []);

  // Component hiển thị khi giỏ hàng trống
  const EmptyCartView = () => (
    <div className="text-center py-12">
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full">
            <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-slate-500 mb-8">Keep shopping to find a course!</p>
      <Link href="/">
        <Button className="bg-purple-600 hover:bg-purple-700">Keep Shopping</Button>
      </Link>

     {/* Hiển thị gợi ý từ API */}
     {!loading && suggestedCourses.length > 0 && (
       <div className="mt-16 text-left">
            <h3 className="text-xl font-bold mb-4">Learners are viewing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestedCourses.map(course => (
                    <div key={course.id} className="border dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="relative h-40 w-full bg-slate-200">
                             <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h4 className="font-bold line-clamp-2 h-12 mb-1 text-sm">{course.title}</h4>
                            <div className="text-xs text-slate-500 mb-2">{course.instructor?.name || "Unknown"}</div>
                            <div className="flex items-center mb-2">
                                <span className="font-bold text-amber-500 mr-1 text-sm">{course.rating || 0}</span>
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            </div>
                            <div className="flex items-center gap-2 mb-3 mt-auto">
                                <span className="font-bold">
                                  {course.price > 0 
                                    ? `${course.price.toLocaleString('vi-VN')}đ` 
                                    : "Miễn phí"}
                                </span>
                                {course.originalPrice > course.price && (
                                  <span className="text-sm text-slate-400 line-through">
                                    {course.originalPrice.toLocaleString('vi-VN')}đ
                                  </span>
                                )}
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => addToCart({
                                id: course.id,
                                title: course.title,
                                thumbnail: course.thumbnail,
                                price: course.price > 0 
                                  ? `${course.price.toLocaleString('vi-VN')}đ` 
                                  : "Miễn phí",
                                originalPrice: course.originalPrice > 0
                                  ? `${course.originalPrice.toLocaleString('vi-VN')}đ`
                                  : undefined,
                                rating: course.rating,
                                instructor: course.instructor?.name || "Unknown",
                                students: course.students,
                                lectures: course.lectures,
                                category: course.category?.name || "",
                                description: course.description,
                                level: course.level,
                                language: course.language,
                                duration: `${course.duration} hours`,
                                curriculum: [],
                                whatYouWillLearn: [],
                                lastUpdated: new Date(course.updateAt).toLocaleDateString('vi-VN')
                              })} 
                            >
                              Add to cart
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
     )}
    </div>
  );

  // Component hiển thị khi có hàng
  const FilledCartView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-slate-600 font-bold mb-4">{items.length} Course in Cart</p>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border-t py-4 dark:border-slate-800">
              <div className="w-24 h-16 sm:w-32 sm:h-20 bg-slate-200 flex-shrink-0 relative rounded overflow-hidden">
                   <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
              </div>
              
              <div className="flex-1 flex justify-between">
                 <div className="space-y-1">
                    <h3 className="font-bold line-clamp-2 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500">By {item.instructor}</p>
                 </div>
                 
                 <div className="text-right">
                    <div className="text-purple-600 font-bold">{item.priceDisplay}</div>
                    <div className="text-slate-400 line-through text-xs">{item.originalPrice.toLocaleString('vi-VN')}đ</div>
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-xs hover:underline mt-2 flex items-center justify-end w-full"
                    >
                       <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4">
         <div className="sticky top-24">
            <div className="text-slate-500 font-bold text-lg mb-2">Total:</div>
            {/* Format số thành tiền Việt */}
            <div className="text-3xl font-bold mb-4 text-purple-700">
                {totalPrice.toLocaleString('vi-VN')}đ
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg mb-4">
                Checkout
            </Button>
         </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {items.length === 0 ? <EmptyCartView /> : <FilledCartView />}
    </div>
  );
}