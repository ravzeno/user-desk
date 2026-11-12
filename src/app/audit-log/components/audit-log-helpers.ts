import type { AuditRecord } from "@/lib/api/type/audit-log";

export function actorText(record: AuditRecord) {
  if (typeof record.actor === "string") return record.actor;
  if (record.actor && typeof record.actor === "object") {
    return (
      record.actor.name ||
      record.actor.email ||
      record.actor.id ||
      "ไม่ระบุผู้ดำเนินการ"
    );
  }
  return (
    record.actorName ||
    record.actorEmail ||
    record.userId ||
    "ไม่ระบุผู้ดำเนินการ"
  );
}

export function targetText(record: AuditRecord) {
  if (typeof record.target === "string") return record.target;
  if (record.target && typeof record.target === "object") {
    return (
      record.target.name ||
      [record.target.type, record.target.id].filter(Boolean).join(" · ") ||
      "—"
    );
  }
  return (
    [record.targetType, record.targetId].filter(Boolean).join(" · ") || "—"
  );
}
