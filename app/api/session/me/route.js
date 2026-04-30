import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { fetchBackendResponse } from "@/lib/backend";
import {
  AUTH_COOKIE_NAME,
  buildExpiredSessionCookieHeader,
} from "@/lib/session";

export const dynamic = "force-dynamic";

const buildExpiredSessionResponse = (request, payload, status) => {
  const nextResponse = NextResponse.json(
    payload || {
      success: false,
      message: "Session expired",
    },
    { status },
  );

  nextResponse.headers.append(
    "Set-Cookie",
    buildExpiredSessionCookieHeader(request),
  );

  return nextResponse;
};

export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 },
    );
  }

  try {
    const { response, baseUrl } = await fetchBackendResponse("/api/auth/me", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return buildExpiredSessionResponse(request, payload, response.status);
    }

    const user = payload?.data?.user;

    if (!user || user.role !== "admin") {
      return buildExpiredSessionResponse(
        request,
        {
          success: false,
          message: "Admin access required",
        },
        403,
      );
    }

    const nextResponse = NextResponse.json({
      success: true,
      data: { user },
    });
    nextResponse.headers.set("x-home-rental-backend", baseUrl);

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching session",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
