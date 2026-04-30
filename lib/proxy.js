import { NextResponse } from "next/server";

export const buildJsonResponse = async (response) => {
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "application/json";

  return new NextResponse(text || "{}", {
    status: response.status,
    headers: {
      "content-type": contentType,
    },
  });
};

