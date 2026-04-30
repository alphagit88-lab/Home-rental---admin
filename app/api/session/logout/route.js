import { NextResponse } from "next/server";

import { buildExpiredSessionCookieHeader } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const nextResponse = NextResponse.json({
    success: true,
    message: "Signed out successfully",
  });

  nextResponse.headers.append(
    "Set-Cookie",
    buildExpiredSessionCookieHeader(request),
  );

  return nextResponse;
}
