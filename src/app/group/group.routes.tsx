import type { RouteObject } from "react-router-dom";
import { GroupDetailPage } from "@/app/group/pages/GroupDetailPage";
import { GroupsPage } from "@/app/group/pages/GroupsPage";

export const groupRoutes: RouteObject[] = [
  { path: "groups", element: <GroupsPage /> },
  { path: "groups/new", element: <GroupDetailPage create /> },
  { path: "groups/:id", element: <GroupDetailPage /> },
];
