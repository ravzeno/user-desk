import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { HomePage } from "@/app/home/HomePage";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { auditLogRoutes } from "@/app/audit-log/audit-log.routes";
import { authRoutes } from "@/app/auth/auth.routes";
import { groupRoutes } from "@/app/group/group.routes";
import { userRoutes } from "@/app/user/user.routes";

const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      ...authRoutes,
      {
        path: "",
        element: <SidebarLayout />,
        children: [
          { index: true, element: <HomePage /> },
          ...userRoutes,
          ...groupRoutes,
          ...auditLogRoutes,
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
