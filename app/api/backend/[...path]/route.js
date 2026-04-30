import { cookies } from "next/headers";

import { fetchBackendResponse } from "@/lib/backend";
import { buildJsonResponse } from "@/lib/proxy";
import { AUTH_COOKIE_NAME } from "@/lib/session";

export const dynamic = "force-dynamic";

const proxy = async (request, context) => {
  const params = await context.params;
  const pathSegments = Array.isArray(params?.path) ? params.path : [];
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const search = request.nextUrl.search || "";

  const headers = {};
  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers["content-type"] = contentType;
  }

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const method = request.method;
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  const { response, baseUrl } = await fetchBackendResponse(
    `/api/${pathSegments.join("/")}${search}`,
    {
      method,
      headers,
      body,
    },
  );

  const nextResponse = await buildJsonResponse(response);
  nextResponse.headers.set("x-home-rental-backend", baseUrl);

  return nextResponse;
};

export async function GET(request, context) {
  return proxy(request, context);
}

export async function POST(request, context) {
  return proxy(request, context);
}

export async function PUT(request, context) {
  return proxy(request, context);
}

export async function PATCH(request, context) {
  return proxy(request, context);
}

export async function DELETE(request, context) {
  return proxy(request, context);
}
