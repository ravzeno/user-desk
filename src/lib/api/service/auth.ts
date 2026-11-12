import { clearExpiredSessionState, jsonBody, request } from "@/lib/api/client";
import { authPaths } from "@/lib/api/generated/paths";

export async function signIn(email: string, password: string) {
  const result = await request<unknown>(
    authPaths.signInEmail,
    {
      method: "POST",
      body: jsonBody({ email, password }),
    },
    false,
  );
  clearExpiredSessionState();
  return result;
}

export function signOut() {
  return request<unknown>(authPaths.signOut, { method: "POST" });
}

export function requestPasswordReset(email: string, redirectTo: string) {
  return request<unknown>(
    authPaths.requestPasswordReset,
    {
      method: "POST",
      body: jsonBody({ email, redirectTo }),
    },
    false,
  );
}

export function resetPassword(token: string, newPassword: string) {
  return request<unknown>(
    authPaths.resetPassword,
    {
      method: "POST",
      body: jsonBody({ token, newPassword }),
    },
    false,
  );
}

export function sendVerificationEmail(email: string, callbackURL: string) {
  return request<unknown>(
    authPaths.sendVerificationEmail,
    {
      method: "POST",
      body: jsonBody({ email, callbackURL }),
    },
    false,
  );
}
