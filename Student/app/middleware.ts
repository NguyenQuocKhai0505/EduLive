import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Lấy token từ Cookie
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/search')) {
    return NextResponse.redirect(new URL('/courses', request.url));
  }

  // 2. Danh sách các trang yêu cầu phải đăng nhập (ví dụ: /cart)
  const protectedPaths = ['/cart', '/admin', '/teacher'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // 3. Nếu vào trang bảo mật mà KHÔNG có token
  if (isProtected && !token) {
    // Tạo URL trang login
    const loginUrl = new URL('/login', request.url);
    // Lưu lại trang hiện tại (ví dụ: /cart) vào tham số 'callbackUrl'
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/admin/:path*', '/teacher/:path*', '/search/:path*'],
};