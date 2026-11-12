import { normalizePage, request } from "@/lib/api/client";
import type { PageResult } from "@/lib/api/type/base";
import type { AuditRecord } from "@/lib/api/type/audit-log";

export async function getAuditLogs(
  page: number,
  limit: number,
): Promise<PageResult<AuditRecord>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return normalizePage<AuditRecord>(
    await request<unknown>(`/backoffice/audit-logs?${params.toString()}`),
    page,
    limit,
  );
}
