// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const isAuthenticated =
    request.cookies.get("Access")?.value === "Authenticated";

  // If not authenticated and trying to access protected routes
  if (
    !isAuthenticated &&
    (request.nextUrl.pathname.startsWith("/text-extractor") ||
      request.nextUrl.pathname.startsWith("/title-extractor") ||
      request.nextUrl.pathname.startsWith("/redbox"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/text-extractor", "/title-extractor", "/redbox"],
};
