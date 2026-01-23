import api from "@/lib/axios";

export interface VoucherValidationResponse {
  valid: boolean;
  code: string | null;
  discountPercent: number;
  discountAmount: number;
  message?: string;
}

export const validateVoucher = async (code: string, cartTotal: number) => {
  const response = await api.post("/voucher/validate", { code, cartTotal });
  return response.data as VoucherValidationResponse;
};