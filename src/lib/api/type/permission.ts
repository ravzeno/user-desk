export interface PermissionRecord {
  key: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}
