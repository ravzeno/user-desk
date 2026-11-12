import type { RouteObject } from "react-router-dom";
import { AuditPage } from "@/app/audit-log/pages/AuditLogPage";

export const auditLogRoutes: RouteObject[] = [
  { path: "audit-logs", element: <AuditPage /> },
];
