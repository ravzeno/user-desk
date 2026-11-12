export interface AuditRecord {
  id: string | number;
  actor?: { id?: string; name?: string; email?: string } | string | null;
  actorName?: string;
  actorEmail?: string;
  userId?: string | null;
  action: string;
  target?: { id?: string; type?: string; name?: string } | string | null;
  targetId?: string | null;
  targetType?: string | null;
  createdAt: string;
  metadata?: unknown;
}
