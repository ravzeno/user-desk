export interface SessionRecord {
  id: string;
  createdAt?: string;
  expiresAt?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  [key: string]: unknown;
}
