import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/api/service/audit-log";
import type { BaseQueryOptions } from "@/hooks/api/type";

export const AUDIT_LOG_QUERY_KEY = ["audit-logs"] as const;

export function useGetAuditLogs(
  page: number,
  limit: number,
  options?: BaseQueryOptions,
) {
  return useQuery({
    queryKey: [...AUDIT_LOG_QUERY_KEY, page, limit],
    queryFn: () => getAuditLogs(page, limit),
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}
