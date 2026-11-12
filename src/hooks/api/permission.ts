import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "@/lib/api/service/permission";
import type { BaseQueryOptions } from "@/hooks/api/type";

export const PERMISSION_QUERY_KEY = ["permissions"] as const;

export function useGetPermissions(options?: BaseQueryOptions) {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEY,
    queryFn: getPermissions,
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}
