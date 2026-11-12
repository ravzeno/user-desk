import { jsonBody, normalizePage, request } from "@/lib/api/client";
import type { PageResult } from "@/lib/api/type/base";
import type { CreateGroupReq, GroupRecord, GroupReq } from "@/lib/api/type/group";
import type { UserRecord } from "@/lib/api/type/user";

function normalizeGroup(value: unknown): GroupRecord {
  if (!value || typeof value !== "object") {
    throw new Error("รูปแบบข้อมูลกลุ่มจาก API ไม่ถูกต้อง");
  }

  const record = value as Record<string, unknown>;
  const counts =
    record._count && typeof record._count === "object"
      ? (record._count as Record<string, unknown>)
      : {};
  const permissions = Array.isArray(record.permissions)
    ? record.permissions.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const permission = item as Record<string, unknown>;
          const key = permission.permission ?? permission.key;
          if (typeof key === "string") return key;
        }
        throw new Error("รูปแบบ permissions ของกลุ่มจาก API ไม่ถูกต้อง");
      })
    : undefined;
  const members = Array.isArray(record.members)
    ? record.members
    : Array.isArray(record.users)
      ? record.users
      : undefined;

  return {
    ...record,
    ...(permissions ? { permissions } : {}),
    permissionCount:
      typeof counts.permissions === "number"
        ? counts.permissions
        : permissions?.length,
    memberCount:
      typeof counts.users === "number" ? counts.users : members?.length,
  } as GroupRecord;
}

export async function getGroups(
  q: string,
  page: number,
  limit: number,
): Promise<PageResult<GroupRecord>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q.trim()) params.set("q", q.trim());
  const result = normalizePage<GroupRecord>(
    await request<unknown>(`/backoffice/groups?${params.toString()}`),
    page,
    limit,
  );
  return { ...result, items: result.items.map(normalizeGroup) };
}

export async function getGroup(id: string): Promise<GroupRecord> {
  return normalizeGroup(
    await request<unknown>(`/backoffice/groups/${encodeURIComponent(id)}`),
  );
}

export async function getGroupMembers(
  id: string,
  page: number,
  limit: number,
): Promise<PageResult<UserRecord>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return normalizePage<UserRecord>(
    await request<unknown>(
      `/backoffice/groups/${encodeURIComponent(id)}/users?${params.toString()}`,
    ),
    page,
    limit,
  );
}

export function createGroup(body: CreateGroupReq) {
  return request<{ id?: string | number } | string | number>(
    "/backoffice/groups",
    { method: "POST", body: jsonBody(body) },
  );
}

export function updateGroup(id: string, body: GroupReq) {
  return request<GroupRecord>(`/backoffice/groups/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: jsonBody(body),
  });
}

export function deleteGroup(id: string) {
  return request<unknown>(`/backoffice/groups/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function setGroupPermissions(id: string, permissions: string[]) {
  return request<unknown>(
    `/backoffice/groups/${encodeURIComponent(id)}/permissions`,
    { method: "PUT", body: jsonBody({ permissions }) },
  );
}

export function assignGroupUser(id: string, userId: string) {
  return request<unknown>(
    `/backoffice/groups/${encodeURIComponent(id)}/users/${encodeURIComponent(userId)}`,
    { method: "PUT" },
  );
}

export function removeGroupUser(id: string, userId: string) {
  return request<unknown>(
    `/backoffice/groups/${encodeURIComponent(id)}/users/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
}
