export const AUTH_COOKIE_NAME = "home_rental_admin_token";

const normalizeBackendUrl = (value) =>
  String(value || "").trim().replace(/\/+$/, "");

export const getBackendBaseUrl = () => {
  const backendUrl = normalizeBackendUrl(process.env.BACKEND_URL);

  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  return backendUrl;
};

export const shouldUseSecureCookies = () => false;

const buildCookieHeader = (value, { expires, maxAge, secure }) => {
  const parts = [
    `${AUTH_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (typeof maxAge === "number") {
    parts.push(`Max-Age=${maxAge}`);
  }

  if (expires instanceof Date) {
    parts.push(`Expires=${expires.toUTCString()}`);
  }

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
};

export const buildSessionCookieHeader = (token, request) =>
  buildCookieHeader(token, {
    maxAge: 60 * 60 * 24 * 7,
    expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
    secure: shouldUseSecureCookies(request),
  });

export const buildExpiredSessionCookieHeader = (request) =>
  buildCookieHeader("", {
    maxAge: 0,
    expires: new Date(0),
    secure: shouldUseSecureCookies(request),
  });
