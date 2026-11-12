import type { UserRecord } from "./user";

export interface GroupRecord {
  id: string | number;
  slug?: string;
  name: string;
  description?: string | null;
  active: boolean;
  isSystem?: boolean;
  permissions?: string[];
  permissionCount?: number;
  memberCount?: number;
  members?: UserRecord[];
  users?: UserRecord[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// The user-groups endpoint returns a summary without the group's active state.
export interface UserGroupRecord {
  id: string | number;
  name: string;
  description?: string | null;
  active?: boolean;
  [key: string]: unknown;
}

export interface GroupReq {
  name: string;
  description: string;
  active: boolean;
}

export interface CreateGroupReq {
  slug: string;
  name: string;
  description: string;
}
