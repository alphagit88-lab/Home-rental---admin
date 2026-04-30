import { getBackendBaseUrl } from "@/lib/session";

const normalizeHeaders = (headers) => {
  if (!headers) {
    return {};
  }

  if (typeof headers.entries === "function") {
    return Object.fromEntries(headers.entries());
  }

  return { ...headers };
};

export const fetchBackendResponse = async (
  path,
  options = {},
  _config = {},
) => {
  const baseUrl = getBackendBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedHeaders = normalizeHeaders(options.headers);
  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...options,
    headers: normalizedHeaders,
    cache: "no-store",
  });

  return {
    baseUrl,
    response,
  };
};
