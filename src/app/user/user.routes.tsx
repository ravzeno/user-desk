import type { RouteObject } from "react-router-dom";
import {
  UserDetailPage,
  UserFormPage,
  UsersPage,
} from "@/app/user/pages/UserPage";

export const userRoutes: RouteObject[] = [
  { path: "users", element: <UsersPage /> },
  { path: "users/new", element: <UserFormPage /> },
  { path: "users/:id", element: <UserDetailPage /> },
];
