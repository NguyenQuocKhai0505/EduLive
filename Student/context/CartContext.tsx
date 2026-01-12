"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { Course } from "@/lib/mock-data";


type CartContextType ={
    cartItems:Course[]
    addToCart: (course:Course) => void
    removeFromCart:(courseId:string | number) =>void
    isInCart:(courseId:string | number) =>boolean
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }){
    const [cartItems,setCartItems] = useState<Course[]>([])

    

    //Luu vao localstorage moi khi cart thay doi(sau nay se thay bang Api)
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }, []);

      // Lưu vào LocalStorage mỗi khi cart thay đổi (sau này thay bằng API post)
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (course: Course) => {
        setCartItems((prev) => {
            // Kiểm tra trùng lặp
            if (prev.find((item) => item.id === course.id)) return prev;
            return [...prev, course];
        });
      }

    const removeFromCart = (courseId: string | number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== courseId));
    };

    const isInCart = (courseId: string | number) => {
        return cartItems.some((item) => item.id === courseId);
      }

      return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, isInCart }}>
          {children}
        </CartContext.Provider>
      );
    }

    export const useCart = () => {
        const context = useContext(CartContext);
        if (!context) throw new Error("useCart must be used within a CartProvider");
        return context;
      }
