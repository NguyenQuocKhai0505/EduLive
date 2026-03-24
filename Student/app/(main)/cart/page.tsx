"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllCourses, CourseResponse } from "@/services/course.service";
import { Trash2, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { CartItemResponse, addToCart, getCartItems, removeFromCart } from "@/services/cart.service";
import { validateVoucher, VoucherValidationResponse } from "@/services/voucher.service";
import { formatPrice, formatRating } from "@/lib/utils";

export default function CartPage() {
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedCourses, setSuggestedCourses] = useState<CourseResponse[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherData, setVoucherData] = useState<VoucherValidationResponse | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const selectionInitializedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [courses, cartItems] = await Promise.all([
          getAllCourses(),
          getCartItems(),
        ]);

        setSuggestedCourses(courses.filter(c => c.isPublished).slice(0, 3));
        setItems(cartItems);
        setSelectedCourseIds((prev) => {
          const nextIds = cartItems.map((item) => item.courseId);
          if (!selectionInitializedRef.current) {
            return nextIds;
          }
          return prev.filter((id) => nextIds.includes(id));
        });
        selectionInitializedRef.current = true;
      } catch (err: any) {
        console.error("Error fetching cart data:", err);
        setError(err.response?.data?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedCourseIds.includes(item.courseId)),
    [items, selectedCourseIds]
  );
  const subtotal = useMemo(
    //useMemo: lưu kết quả tính toán để tránh tính toán lại khi component render lại
    () => selectedItems.reduce((sum, item) => sum + Number(item.priceSnapshot), 0),
    [selectedItems]
  );
  const discountAmount = voucherData?.discountAmount ?? 0;
  const totalPrice = Math.max(subtotal - discountAmount, 0);

  const handleAddToCart = async (courseId: number) => {
    try {
      await addToCart(courseId);
      const cartItems = await getCartItems();
      setItems(cartItems);
      setSelectedCourseIds((prev) => (prev.includes(courseId) ? prev : [...prev, courseId]));
      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleRemoveFromCart = async (courseId: number) => {
    try {
      await removeFromCart(courseId);
      setItems(prev => prev.filter(item => item.courseId !== courseId));
      setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
      toast.success("Removed from cart");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove");
    }
  };

  const toggleCourse = (courseId: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCourseIds.length === items.length) {
      setSelectedCourseIds([]);
      return;
    }
    setSelectedCourseIds(items.map((item) => item.courseId));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Please enter a voucher code");
      return;
    }
    setApplyingVoucher(true);
    setVoucherError(null);
    try {
      const result = await validateVoucher(voucherCode.trim(), subtotal);
      if (!result.valid) {
        setVoucherData(null);
        setVoucherError(result.message || "Voucher is invalid");
        return;
      }
      setVoucherData(result);
      toast.success(`Voucher applied: ${result.discountPercent}% off`);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to apply voucher";
      setVoucherError(message);
      toast.error(message);
    } finally {
      setApplyingVoucher(false);
    }
  };

  useEffect(() => {
    setVoucherData(null);
    setVoucherError(null);
  }, [subtotal]);

  const EmptyCartView = () => (
    <div className="text-center py-8 sm:py-12">
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-full">
          <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-900 dark:text-white">Your cart is empty</h2>
      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">Keep shopping to find a course!</p>
      <Link href="/">
        <Button className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">Keep Shopping</Button>
      </Link>

      {!loading && suggestedCourses.length > 0 && (
        <div className="mt-12 sm:mt-16 text-left">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-slate-900 dark:text-white">Learners are viewing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {suggestedCourses.map(course => (
              <div key={course.id} className="border dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="relative h-40 w-full bg-slate-200">
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold line-clamp-2 h-12 mb-1 text-sm">{course.title}</h4>
                  <div className="text-xs text-slate-500 mb-2">{course.instructor?.name || "Unknown"}</div>
                  <div className="flex items-center mb-2">
                    <span className="font-bold text-amber-500 mr-1 text-sm">{formatRating(course.rating)}</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-3 mt-auto">
                    <span className="font-bold">
                      {formatPrice(course.price)}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => handleAddToCart(course.id)}>
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

  const FilledCartView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      <div className="lg:col-span-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">Shopping Cart</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bold mb-4">
          {selectedItems.length} selected / {items.length} in cart
        </p>

        <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
          <input
            type="checkbox"
            checked={items.length > 0 && selectedCourseIds.length === items.length}
            onChange={toggleSelectAll}
          />
          Select all
        </label>

        <div className="space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 sm:gap-4 border-t border-slate-200 dark:border-slate-800 py-3 sm:py-4">
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={selectedCourseIds.includes(item.courseId)}
                  onChange={() => toggleCourse(item.courseId)}
                />
              </div>
              <div className="w-20 h-14 sm:w-24 sm:h-16 md:w-32 md:h-20 bg-slate-200 dark:bg-slate-800 flex-shrink-0 relative rounded overflow-hidden">
                <Image src={item.course.thumbnail} alt={item.course.title} fill className="object-cover" />
              </div>

              <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-2 min-w-0">
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="font-bold line-clamp-2 text-xs sm:text-sm md:text-base text-slate-900 dark:text-white">{item.course.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">By {item.course.instructor?.name || "Unknown"}</p>
                </div>

                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-purple-600 dark:text-purple-400 font-bold text-sm sm:text-base">
                    {formatPrice(Number(item.priceSnapshot))}
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.courseId)}
                    className="text-red-500 dark:text-red-400 text-xs hover:underline mt-1 sm:mt-2 flex items-center sm:justify-end"
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
        <div className="sticky top-20 sm:top-24 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 font-bold text-base sm:text-lg mb-2">Total:</div>
          <div className="text-2xl sm:text-3xl font-bold mb-2 text-purple-700 dark:text-purple-400">
            {formatPrice(totalPrice)}
          </div>
          {discountAmount > 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Discount ({voucherData?.discountPercent}%): -{formatPrice(discountAmount)}
            </div>
          )}
          {(() => {
            const params = new URLSearchParams();
            if (voucherData?.code) params.set("voucher", voucherData.code);
            if (selectedCourseIds.length) params.set("selected", selectedCourseIds.join(","));
            const checkoutHref = params.toString() ? `/checkout?${params.toString()}` : "/checkout";
            return (
              <Link href={checkoutHref}>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 h-11 sm:h-12 text-sm sm:text-lg mb-4"
                  disabled={selectedCourseIds.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            );
          })()}
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            You won&apos;t be charged yet
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Apply Coupon</div>
            <div className="flex gap-2">
              <input
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value)}
                placeholder="Enter code"
                className="flex-1 h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button variant="outline" className="h-10" onClick={handleApplyVoucher} disabled={applyingVoucher}>
                {applyingVoucher ? "Applying..." : "Apply"}
              </Button>
            </div>
            {voucherError && <div className="text-xs text-red-500 mt-2">{voucherError}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {loading && <div className="text-center text-slate-500">Loading cart...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (items.length === 0 ? <EmptyCartView /> : <FilledCartView />)}
    </div>
  );
}