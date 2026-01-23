import api from "@/lib/axios";

export const createStripeIntent = async (orderId: number, amount: number) => {
  const res = await api.post("/payment/stripe/create-intent", { orderId, amount });
  return res.data as { clientSecret: string };
};

export const createPaypalOrder = async (orderId: number, amount: number) => {
  const res = await api.post("/payment/paypal/create-order", { orderId, amount });
  return res.data;
};

export const capturePaypalOrder = async (paypalOrderId: string, orderId: number) => {
  const res = await api.post("/payment/paypal/capture", { paypalOrderId, orderId });
  return res.data;
};

