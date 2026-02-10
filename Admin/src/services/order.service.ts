import api from "@/lib/api";

export type OrderStatus = "PENDING" | "PAID" | "FAILED";

export type OrderUser = {
  id: number;
  fullName: string;
  email: string;
  role?: string;
};

export type OrderCourse = {
  id: number;
  title: string;
  price?: number;
};

export type OrderItem = {
  id: number;
  orderId: number;
  courseId: number;
  priceSnapshot: number;
  course?: OrderCourse;
};

export type Order = {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  idempotencyKey: string;
  createdAt: string;
  updateAt: string;
  user?: OrderUser;
  items?: OrderItem[];
};

/** Admin: lấy tất cả đơn hàng (student mua khóa học) */
export const getAllOrders = () =>
  api.get<Order[]>("/cart/orders").then((res) => res.data);
