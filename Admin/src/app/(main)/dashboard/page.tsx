"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap, ShoppingBag } from "lucide-react";
import { getUsersByRole } from "../../../services/user.service";
import { getAllOrders, type Order } from "../../../services/order.service";

export default function AdminDashboardPage() {
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const [studentsRes, teachersRes] = await Promise.all([
          getUsersByRole("student"),
          getUsersByRole("teacher"),
        ]);
        setStudentCount(studentsRes.data.length);
        setTeacherCount(teachersRes.data.length);
      } catch (err: any) {
        console.error("Error fetching user counts:", err);
        setError(err.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const data = await getAllOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatStatus = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Chờ thanh toán", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
      PAID: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
      FAILED: { label: "Thất bại", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };
    const s = map[status] ?? { label: status, className: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" };
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Dashboard
      </h1>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng tài khoản Student
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? (
                  <span className="text-sm text-slate-500">Đang tải...</span>
                ) : studentCount !== null ? (
                  studentCount.toLocaleString("vi-VN")
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng tài khoản Teacher
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? (
                  <span className="text-sm text-slate-500">Đang tải...</span>
                ) : teacherCount !== null ? (
                  teacherCount.toLocaleString("vi-VN")
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng quản lý đơn hàng (student mua khóa học) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
            <ShoppingBag className="h-5 w-5 text-slate-500" />
            Đơn hàng — Student mua khóa học
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách đơn hàng và trạng thái thanh toán
          </p>
        </div>
        <div className="overflow-x-auto">
          {ordersLoading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Đang tải đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Chưa có đơn hàng nào
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    Mã đơn
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    Student
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    Khóa học
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {order.user?.fullName ?? `User #${order.userId}`}
                        </p>
                        {order.user?.email && (
                          <p className="text-xs text-slate-500">{order.user.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="list-inside list-disc space-y-0.5 text-slate-700 dark:text-slate-300">
                        {order.items?.length
                          ? order.items.map((item) => (
                              <li key={item.id}>
                                {item.course?.title ?? `Khóa #${item.courseId}`}
                              </li>
                            ))
                          : "—"}
                      </ul>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {Number(order.totalAmount).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-4 py-3">{formatStatus(order.status)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
