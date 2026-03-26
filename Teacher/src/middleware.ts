import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth cookies are httpOnly on the API host (e.g. Render), not on this frontend host.
// Gating on `accessToken` here always fails after cross-site login. Real checks run in
// `(main)/layout.tsx` via `/auth/me` with credentials.

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
