import { ACCESS_QUERY_KEY } from "@/hooks/api/access";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BaseQueryOptions } from "@/hooks/api/type";
import type {
  CreateUserReq,
  EditUserReq,
  Role,
  UserListScope,
} from "@/lib/api/type/user";
import {
  banUser,
  createUser,
  deleteUser,
  getUser,
  getUserGroups,
  getUsers,
  getUserSessions,
  revokeUserSession,
  setUserRole,
  unbanUser,
  updateUser,
} from "@/lib/api/service/user";

export const USER_QUERY_KEYS = {
  all: () => ["users"] as const,
  list: (q: string, page: number, limit: number, scope?: UserListScope) =>
    [...USER_QUERY_KEYS.all(), "list", q, page, limit, scope] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.all(), "detail", id] as const,
  groups: (id: string) => [...USER_QUERY_KEYS.all(), "groups", id] as const,
  sessions: (id: string) => [...USER_QUERY_KEYS.all(), "sessions", id] as const,
};

type UserListOptions = BaseQueryOptions & { scope?: UserListScope };

export function useGetUsers(
  q: string,
  page: number,
  limit: number,
  options?: UserListOptions,
) {
  const scope = options?.scope;
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(q, page, limit, scope),
    queryFn: () => getUsers(q, page, limit, scope),
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useGetUser(id: string, options?: BaseQueryOptions) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => getUser(id),
    enabled: Boolean(id) && options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useGetUserGroups(id: string, options?: BaseQueryOptions) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.groups(id),
    queryFn: () => getUserGroups(id),
    enabled: Boolean(id) && options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useGetUserSessions(id: string, options?: BaseQueryOptions) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.sessions(id),
    queryFn: () => getUserSessions(id),
    enabled: Boolean(id) && options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserReq) => createUser(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: EditUserReq }) =>
      updateUser(userId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() }),
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      setUserRole(userId, role),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() }),
      queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }),
    ]),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: banUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() }),
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unbanUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() }),
  });
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      sessionId,
    }: {
      userId: string;
      sessionId: string;
    }) => revokeUserSession(userId, sessionId),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.sessions(variables.userId),
      }),
  });
}
