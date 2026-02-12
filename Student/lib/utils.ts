import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format giá tiền theo chuẩn Việt Nam
 * - Cứ 3 số thì có 1 dấu chấm (thousands separator)
 * - Bỏ phần thập phân (.00)
 * 
 * @param price - Giá tiền (number hoặc string)
 * @returns Chuỗi giá đã được format (ví dụ: "10.000₫")
 * 
 * @example
 * formatPrice(10000) // "10.000₫"
 * formatPrice(50000.00) // "50.000₫"
 * formatPrice(1234567) // "1.234.567₫"
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (!price || price === 0) return "Miễn phí";
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "Miễn phí";
  
  // Làm tròn về số nguyên và format với dấu chấm làm thousands separator
  const roundedPrice = Math.round(numPrice);
  return `${roundedPrice.toLocaleString('vi-VN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).replace(/,/g, '.')}₫`;
}

/**
 * Format rating để không hiển thị .00 nếu là số nguyên
 * - Nếu là số nguyên (5, 4, 3...) → hiển thị "5", "4", "3"
 * - Nếu có phần thập phân (4.5, 3.7...) → hiển thị "4.5", "3.7"
 * 
 * @param rating - Rating (number)
 * @returns Chuỗi rating đã được format
 * 
 * @example
 * formatRating(5) // "5"
 * formatRating(5.00) // "5"
 * formatRating(4.5) // "4.5"
 * formatRating(3.75) // "3.8" (làm tròn 1 chữ số)
 */
export function formatRating(rating: number | null | undefined): string {
  if (!rating && rating !== 0) return "0";
  
  const numRating = Number(rating);
  if (isNaN(numRating)) return "0";
  
  // Nếu là số nguyên, trả về không có phần thập phân
  if (Number.isInteger(numRating)) {
    return numRating.toString();
  }
  
  // Nếu có phần thập phân, làm tròn 1 chữ số và loại bỏ số 0 thừa
  const rounded = Math.round(numRating * 10) / 10;
  return rounded.toString().replace(/\.0+$/, '');
}