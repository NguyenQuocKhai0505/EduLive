"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Course } from "../lib/mock-data"; // Import interface của bạn

// CartItem sẽ kế thừa từ Course nhưng có giá dạng số để tính toán
export interface CartItem extends Omit<Course, "price" | "originalPrice"> {
  price: number;           
  originalPrice: number;   
  priceDisplay: string;    
}

interface CartContextType {
  addToCart: (course: Course) => void; 
  removeFromCart: (id: string | number) => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hàm chuyển đổi chuỗi tiền "1.299.000đ" -> số 1299000
  const parsePrice = (priceString: string): number => {
    if (!priceString) return 0;
    // Xóa tất cả ký tự không phải số
    return parseInt(priceString.replace(/\D/g, '')) || 0;
  };

  const addToCart = (course: Course) => {
    // Kiểm tra trùng lặp
    if (!items.find((i) => i.id === course.id)) {
      const newItem: CartItem = {
        ...course,
        price: parsePrice(course.price),
        originalPrice: parsePrice(course.originalPrice),
        priceDisplay: course.price // Lưu lại chuỗi gốc để hiển thị
      };
      setItems([...items, newItem]);
    }
  };

  const removeFromCart = (id: string | number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const totalPrice = items.reduce((total, item) => total + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, totalPrice }}>
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