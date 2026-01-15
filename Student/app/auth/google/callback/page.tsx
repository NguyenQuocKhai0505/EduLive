"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/lib/axios";

export default function GoogleCallbackPage() {
    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Lấy token từ cookie (backend đã set)
                const token = Cookies.get("accessToken");
                const userInfoCookie = Cookies.get("userInfo");

                if (token) {
                    let user;
                    
                    // Lấy user info từ cookie hoặc API
                    if (userInfoCookie) {
                        try {
                            user = JSON.parse(userInfoCookie);
                            Cookies.remove("userInfo");
                        } catch (e) {
                            console.error("Error parsing userInfo cookie:", e);
                        }
                    }

                    // Nếu không có user từ cookie, gọi API
                    if (!user) {
                        try {
                            const response = await api.get("/auth/me");
                            user = response.data;
                        } catch (error) {
                            console.error("Error fetching user info:", error);
                        }
                    }

                    if (user) {
                        // Gửi message về parent window (trang chính)
                        if (window.opener) {
                            window.opener.postMessage(
                                {
                                    type: "GOOGLE_AUTH_SUCCESS",
                                    access_token: token,
                                    user: user,
                                },
                                window.location.origin
                            );
                            // Đóng popup sau khi gửi message
                            setTimeout(() => {
                                window.close();
                            }, 100);
                        } else {
                            // Nếu không có opener, có thể là redirect trực tiếp (fallback)
                            // Redirect về trang chủ
                            window.location.href = "/";
                        }
                    } else {
                        throw new Error("Failed to get user information");
                    }
                } else {
                    throw new Error("No access token found");
                }
            } catch (error: any) {
                // Gửi error về parent window
                if (window.opener) {
                    window.opener.postMessage(
                        {
                            type: "GOOGLE_AUTH_ERROR",
                            error: error.message || "Authentication failed",
                        },
                        window.location.origin
                    );
                    // Đóng popup sau khi gửi error
                    setTimeout(() => {
                        window.close();
                    }, 100);
                } else {
                    // Fallback: redirect về login với error
                    window.location.href = "/login?error=" + encodeURIComponent(error.message || "Authentication failed");
                }
            }
        };

        handleCallback();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">
                    Completing authentication...
                </p>
            </div>
        </div>
    );
}
