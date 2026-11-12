import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import type { UserRecord } from "@/lib/api/type/user";

export function userInitials(name?: string) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function UserStatusBadge({ user }: { user: UserRecord }) {
  if (user.banned === true)
    return <StatusBadge tone="danger">ระงับ</StatusBadge>;
  if (user.banned === false)
    return <StatusBadge tone="success">ปกติ</StatusBadge>;
  return <StatusBadge tone="neutral">ไม่ทราบสถานะ</StatusBadge>;
}

export function UserAvatar({ name, image, large = false }: { name?: string | null; image?: string | null; large?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return (
    <div className={`person-avatar${large ? " person-avatar-large" : ""}`}>
      {image && failedUrl !== image ? <img src={image} alt="" onError={() => setFailedUrl(image)} /> : userInitials(name ?? undefined)}
    </div>
  );
}
