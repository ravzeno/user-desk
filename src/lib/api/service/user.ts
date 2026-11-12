import { jsonBody, normalizePage, request } from "@/lib/api/client";
import type { PageResult } from "@/lib/api/type/base";
import type { UserGroupRecord } from "@/lib/api/type/group";
import type { SessionRecord } from "@/lib/api/type/session";
import type {
  CreateUserReq,
  EditUserReq,
  Role,
  UserListScope,
  UserRecord,
} from "@/lib/api/type/user";

export async function getUsers(
  q: string,
  page: number,
  limit: number,
  scope?: UserListScope,
): Promise<PageResult<UserRecord>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q.trim()) params.set("q", q.trim());
  if (scope) params.set("scope", scope);
  const result = await request<unknown>(
    `/backoffice/users?${params.toString()}`,
  );
  return normalizePage<UserRecord>(result, page, limit);
}

export function createUser(body: CreateUserReq) {
  return request<{ id?: string } | string>("/backoffice/users", {
    method: "POST",
    body: jsonBody(body),
  });
}

export function getUser(id: string) {
  return request<UserRecord>(`/backoffice/users/${encodeURIComponent(id)}`);
}

export function updateUser(id: string, body: EditUserReq) {
  return request<UserRecord>(`/backoffice/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: jsonBody(body),
  });
}

export function setUserRole(id: string, role: Role) {
  return request<unknown>(`/backoffice/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    body: jsonBody({ role }),
  });
}

export function banUser(id: string) {
  return request<unknown>(`/backoffice/users/${encodeURIComponent(id)}/ban`, {
    method: "POST",
  });
}

export function unbanUser(id: string) {
  return request<unknown>(`/backoffice/users/${encodeURIComponent(id)}/ban`, {
    method: "DELETE",
  });
}

export function deleteUser(id: string) {
  return request<unknown>(`/backoffice/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getUserGroups(id: string): Promise<UserGroupRecord[]> {
  const data = await request<unknown>(
    `/backoffice/users/${encodeURIComponent(id)}/groups`,
  );
  if (Array.isArray(data)) return data as UserGroupRecord[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.groups))
      return record.groups as UserGroupRecord[];
    if (Array.isArray(record.items)) return record.items as UserGroupRecord[];
  }
  return [];
}

export async function getUserSessions(id: string): Promise<SessionRecord[]> {
  const data = await request<unknown>(
    `/backoffice/users/${encodeURIComponent(id)}/sessions`,
  );
  if (Array.isArray(data)) return data as SessionRecord[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as SessionRecord[];
    if (Array.isArray(record.sessions))
      return record.sessions as SessionRecord[];
  }
  return [];
}

export function revokeUserSession(id: string, sessionId: string) {
  return request<unknown>(
    `/backoffice/users/${encodeURIComponent(id)}/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
  );
}
