import { request } from "@/lib/api/client";
import type { PermissionRecord } from "@/lib/api/type/permission";

const INVALID_PERMISSION_CATALOG =
  "รูปแบบ permission catalog จาก API ไม่ถูกต้อง";

function isPermissionRecord(value: unknown): value is PermissionRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.key === "string" &&
    (record.name === undefined || typeof record.name === "string") &&
    (record.description === undefined || typeof record.description === "string")
  );
}

function parsePermissionList(value: unknown): PermissionRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(INVALID_PERMISSION_CATALOG);
  }
  return value.map((permission) => {
    // The backoffice API currently returns permission keys as strings.
    // Keep accepting the richer record form for compatible API versions.
    if (typeof permission === "string") return { key: permission };
    if (isPermissionRecord(permission)) return permission;
    throw new Error(INVALID_PERMISSION_CATALOG);
  });
}

export async function getPermissions(): Promise<PermissionRecord[]> {
  const data = await request<unknown>("/backoffice/permissions");
  if (Array.isArray(data)) return parsePermissionList(data);
  if (data && typeof data === "object") {
    const items = (data as Record<string, unknown>).items;
    if (Array.isArray(items)) return parsePermissionList(items);
  }
  throw new Error(INVALID_PERMISSION_CATALOG);
}
