import { request } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/type/user";

export async function getCurrentUser(): Promise<CurrentUser> {
  const result = await request<unknown>("/me");
  if (result && typeof result === "object" && "user" in result) {
    return (result as { user: CurrentUser }).user;
  }
  return result as CurrentUser;
}
