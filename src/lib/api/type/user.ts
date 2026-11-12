export type Role = "customer" | "staff";
export type UserListScope = "customer" | "backoffice";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  role?: Role | string | null;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CurrentUser {
  phoneNumber?: string | null;
  image?: string | null;
  id: string;
  name?: string;
  email: string;
  [key: string]: unknown;
}

export interface CreateUserReq {
  email: string;
  name: string;
  password: string;
}

export interface EditUserReq {
  name: string;
  email: string;
  phoneNumber: string;
}
