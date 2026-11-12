import { useMutation, useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/service/account";
import {
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  signIn,
  signOut,
} from "@/lib/api/service/auth";
import type { BaseQueryOptions } from "@/hooks/api/type";

export const SESSION_QUERY_KEY = ["session"] as const;

export function useCurrentUser(options?: BaseQueryOptions) {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getCurrentUser,
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
  });
}

export function useSignOut() {
  return useMutation({ mutationFn: signOut });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: ({
      email,
      redirectTo,
    }: {
      email: string;
      redirectTo: string;
    }) => requestPasswordReset(email, redirectTo),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => resetPassword(token, newPassword),
  });
}

export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: ({
      email,
      callbackURL,
    }: {
      email: string;
      callbackURL: string;
    }) => sendVerificationEmail(email, callbackURL),
  });
}
