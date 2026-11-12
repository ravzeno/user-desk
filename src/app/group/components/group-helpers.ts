import type { GroupRecord } from "@/lib/api/type/group";

export function isSystemGroup(group?: GroupRecord) {
  if (!group) return false;
  return Boolean(
    group.isSystem ??
    group.systemProtected ??
    group.isSystemGroup ??
    group.protected,
  );
}

export function isRootAdminGroup(group?: GroupRecord) {
  return group?.slug === "root-admin";
}
