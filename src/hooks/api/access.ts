import { useQuery } from "@tanstack/react-query";
import { dispatchExpiredSession, request } from "@/lib/api/client";

export const ACCESS_QUERY_KEY = ["access-session"] as const;
export const ACCESS_STALE_MS = 60_000;
export function useAccessSession() {
  return useQuery({
    queryKey: ACCESS_QUERY_KEY,
    queryFn: async () => {
      const data = await request<unknown>("/auth/get-session", { cache: "no-store" });
      if (data === null) {
        dispatchExpiredSession();
        throw new Error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
      }
      if (!data || typeof data !== "object") {
        throw new Error("ไม่สามารถตรวจสอบสิทธิ์จากเซสชันได้ กรุณาลองอีกครั้ง");
      }
      const session = data as { permissions?: unknown; user?: { permissions?: unknown } };
      const permissions = session.user?.permissions ?? session.permissions;
      if (!Array.isArray(permissions) || !permissions.every((item) => typeof item === "string")) {
        throw new Error("ข้อมูลสิทธิ์จากเซสชันไม่ถูกต้อง");
      }
      return permissions as string[];
    },
    staleTime: ACCESS_STALE_MS,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
export function usePermission() {
  const { data } = useAccessSession();
  return (permission: string) => data?.includes(permission) === true;
}
