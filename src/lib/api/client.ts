import type { PageResult } from "@/lib/api/type/base";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"
).replace(/\/+$/, "");
let redirectingForExpiredSession = false;

export class ServiceUnavailableError extends Error {
  constructor() {
    super("ไม่สามารถเชื่อมต่อบริการได้ กรุณาลองอีกครั้ง");
    this.name = "ServiceUnavailableError";
  }
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function clearExpiredSessionState() {
  redirectingForExpiredSession = false;
}

export function dispatchExpiredSession() {
  if (redirectingForExpiredSession) return;
  redirectingForExpiredSession = true;
  window.dispatchEvent(new CustomEvent("userdesk:session-expired"));
}

export function unwrap<T>(value: unknown): T {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.message)) {
      const messages = record.message.filter((value): value is string => typeof value === "string");
      if (messages.length) return messages.join(", ");
    }
    if (typeof record.message === "string") return record.message;
    const error = record.error;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const nested = error as Record<string, unknown>;
      if (typeof nested.message === "string") return nested.message;
    }
    if (typeof record.message === "string") return record.message;
  }
  return fallback;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`,
      {
        ...options,
        credentials: "include",
        headers: {
          ...(options.body && !(options.body instanceof FormData)
            ? { "Content-Type": "application/json" }
            : {}),
          ...options.headers,
        },
      },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    window.dispatchEvent(new CustomEvent("userdesk:service-unavailable"));
    throw new ServiceUnavailableError();
  }
  if ([502, 503, 504].includes(response.status)) {
    window.dispatchEvent(new CustomEvent("userdesk:service-unavailable"));
    throw new ServiceUnavailableError();
  }

  let payload: unknown;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }
  }

  if (!response.ok) {
    if (response.status === 401 && authenticated) dispatchExpiredSession();
    if (response.status === 403 && authenticated && !path.startsWith("/auth/get-session")) {
      window.dispatchEvent(new CustomEvent("userdesk:access-denied"));
    }
    const fallback =
      response.status === 403
        ? "ไม่มีสิทธิ์ทำรายการ"
        : response.status === 401
          ? "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน"
          : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง";
    const message =
      response.status === 403 ? fallback : errorMessage(payload, fallback);
    const code =
      payload && typeof payload === "object" && "code" in payload
        ? String((payload as { code: unknown }).code)
        : undefined;
    throw new ApiError(message, response.status, code);
  }

  return unwrap<T>(payload);
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}

export function normalizePage<T>(
  payload: unknown,
  page: number,
  limit: number,
): PageResult<T> {
  if (Array.isArray(payload))
    return { items: payload as T[], page, limit, total: payload.length };
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const items = Array.isArray(record.items) ? (record.items as T[]) : [];
  return {
    items,
    page: typeof record.page === "number" ? record.page : page,
    limit: typeof record.limit === "number" ? record.limit : limit,
    total: typeof record.total === "number" ? record.total : items.length,
  };
}
