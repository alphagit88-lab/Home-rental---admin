import { NextResponse } from "next/server";

import { fetchBackendResponse } from "@/lib/backend";
import { buildSessionCookieHeader } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();

    const { response, baseUrl } = await fetchBackendResponse("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        payload || {
          success: false,
          message: "Unable to sign in",
        },
        { status: response.status },
      );
    }

    const user = payload?.data?.user;
    const token = payload?.data?.token;

    if (!user || !token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login response from backend",
        },
        { status: 502 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    const nextResponse = NextResponse.json({
      success: true,
      data: { user },
    });
    nextResponse.headers.set("x-home-rental-backend", baseUrl);

    nextResponse.headers.append(
      "Set-Cookie",
      buildSessionCookieHeader(token, request),
    );

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error during sign in",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
