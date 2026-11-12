import { jsonBody, request } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/type/user";

export async function getCurrentUser(): Promise<CurrentUser> {
  const result = await request<unknown>("/me");
  if (result && typeof result === "object" && "user" in result) {
    return (result as { user: CurrentUser }).user;
  }
  return result as CurrentUser;
}

export function uploadMyAvatar(file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<CurrentUser>("/me/avatar", { method: "POST", body });
}

export function updateMyProfile(body: { name: string; phoneNumber: string | null }) {
  return request<CurrentUser>("/me", { method: "PATCH", body: jsonBody(body) });
}
