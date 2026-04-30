import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/session";

export function proxy(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
