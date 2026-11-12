import type { RouteObject } from "react-router-dom";
import { LoginPage } from "@/app/auth/pages/LoginPage";
import { ResetPasswordPage } from "@/app/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/app/auth/pages/VerifyEmailPage";

export const authRoutes: RouteObject[] = [
  { path: "login", element: <LoginPage /> },
  { path: "reset-password", element: <ResetPasswordPage /> },
  { path: "verify-email", element: <VerifyEmailPage /> },
];
