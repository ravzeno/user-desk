import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { auditLogRoutes } from "@/app/audit-log/audit-log.routes";
import { authRoutes } from "@/app/auth/auth.routes";
import { groupRoutes } from "@/app/group/group.routes";
import { userRoutes } from "@/app/user/user.routes";

const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      { index: true, element: <Navigate to="/users" replace /> },
      ...authRoutes,
      {
        path: "",
        element: <SidebarLayout />,
        children: [
          ...userRoutes,
          ...groupRoutes,
          ...auditLogRoutes,
        ],
      },
      { path: "*", element: <Navigate to="/users" replace /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
