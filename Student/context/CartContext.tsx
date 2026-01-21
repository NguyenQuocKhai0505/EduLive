"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CartItemResponse, addToCart as apiAddToCart, getCartItems, removeFromCart as apiRemoveFromCart } from "@/services/cart.service";

export interface CartItem extends CartItemResponse {}

interface CartContextType {
  items: CartItem[];
  addToCart: (courseId: number) => Promise<void>;
  removeFromCart: (id: string | number) => void;
  totalPrice: number;
  // 👇 1. Thêm dòng này vào Interface để TypeScript hiểu hàm này tồn tại
  isInCart: (id: string | number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartItems = await getCartItems();
        setItems(cartItems);
      } catch {
        setItems([]);
      } finally {
        setLoaded(true);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (courseId: number) => {
    await apiAddToCart(courseId);
    const cartItems = await getCartItems();
    setItems(cartItems);
  };

  const removeFromCart = (id: string | number) => {
    apiRemoveFromCart(Number(id)).catch(() => undefined);
    setItems(items.filter((item) => item.courseId !== Number(id)));
  };

  // 👇 2. Viết hàm kiểm tra xem khóa học đã có trong giỏ chưa
  const isInCart = (id: string | number) => {
    return items.some((item) => item.courseId === Number(id));
  };

  const totalPrice = items.reduce((total, item) => total + Number(item.priceSnapshot), 0);

  return (
    // 👇 3. Nhớ bỏ isInCart vào value để component khác dùng được
    <CartContext.Provider value={{ items: loaded ? items : [], addToCart, removeFromCart, totalPrice, isInCart }}>
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