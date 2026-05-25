import { NextRequest, NextResponse } from "next/server";

const tokenKey = process.env.NEXT_PUBLIC_TOKEN_VAR || "auth_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isWorkflowRoute = pathname === "/tools/workflow" || pathname.startsWith("/tools/workflow/");

  if (!isWorkflowRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(tokenKey)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("message", "Please login to access workflow.");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tools/workflow", "/tools/workflow/:path*"],
};

