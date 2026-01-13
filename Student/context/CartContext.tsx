"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Course } from "../lib/mock-data";

export interface CartItem extends Omit<Course, "price" | "originalPrice"> {
  price: number;
  originalPrice: number;
  priceDisplay: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (id: string | number) => void;
  totalPrice: number;
  // 👇 1. Thêm dòng này vào Interface để TypeScript hiểu hàm này tồn tại
  isInCart: (id: string | number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const parsePrice = (priceString: string): number => {
    if (!priceString) return 0;
    return parseInt(priceString.replace(/\D/g, '')) || 0;
  };

  const addToCart = (course: Course) => {
    if (!items.find((i) => i.id === course.id)) {
      const newItem: CartItem = {
        ...course,
        price: parsePrice(course.price),
        originalPrice: parsePrice(course.originalPrice),
        priceDisplay: course.price 
      };
      setItems([...items, newItem]);
    }
  };

  const removeFromCart = (id: string | number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // 👇 2. Viết hàm kiểm tra xem khóa học đã có trong giỏ chưa
  const isInCart = (id: string | number) => {
    return items.some((item) => item.id === id);
  };

  const totalPrice = items.reduce((total, item) => total + item.price, 0);

  return (
    // 👇 3. Nhớ bỏ isInCart vào value để component khác dùng được
    <CartContext.Provider value={{ items, addToCart, removeFromCart, totalPrice, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}