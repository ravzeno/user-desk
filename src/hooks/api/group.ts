import { ACCESS_QUERY_KEY } from "@/hooks/api/access";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BaseQueryOptions } from "@/hooks/api/type";
import type { CreateGroupReq, GroupReq } from "@/lib/api/type/group";
import {
  assignGroupUser,
  createGroup,
  deleteGroup,
  getGroup,
  getGroupMembers,
  getGroups,
  removeGroupUser,
  setGroupPermissions,
  updateGroup,
} from "@/lib/api/service/group";

export const GROUP_QUERY_KEYS = {
  all: () => ["groups"] as const,
  list: (q: string, page: number, limit: number) =>
    [...GROUP_QUERY_KEYS.all(), "list", q, page, limit] as const,
  detail: (id: string) => [...GROUP_QUERY_KEYS.all(), "detail", id] as const,
  members: (id: string) => [...GROUP_QUERY_KEYS.all(), "members", id] as const,
};

export function useGetGroups(
  q: string,
  page: number,
  limit: number,
  options?: BaseQueryOptions,
) {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.list(q, page, limit),
    queryFn: () => getGroups(q, page, limit),
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useGetGroup(id: string, options?: BaseQueryOptions) {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.detail(id),
    queryFn: () => getGroup(id),
    enabled: Boolean(id) && options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useGetGroupMembers(
  id: string,
  page: number,
  limit: number,
  options?: BaseQueryOptions,
) {
  return useQuery({
    queryKey: [...GROUP_QUERY_KEYS.members(id), page, limit],
    queryFn: () => getGroupMembers(id, page, limit),
    enabled: Boolean(id) && options?.enabled !== false,
    staleTime: options?.staleTime,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGroupReq) => createGroup(body),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all() }),
      queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }),
    ]),
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, body }: { groupId: string; body: GroupReq }) =>
      updateGroup(groupId, body),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all() }),
      queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }),
    ]),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all() }),
      queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }),
    ]),
  });
}

export function useSetGroupPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      permissions,
    }: {
      groupId: string;
      permissions: string[];
    }) => setGroupPermissions(groupId, permissions),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all() }),
      queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }),
    ]),
  });
}

export function useAssignGroupUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      assignGroupUser(groupId, userId),
    onSuccess: (_data, { groupId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: GROUP_QUERY_KEYS.members(groupId),
        }),
        queryClient.invalidateQueries({ queryKey: ["users", "groups"] }),
      ]),
  });
}

export function useRemoveGroupUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      removeGroupUser(groupId, userId),
    onSuccess: (_data, { groupId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: GROUP_QUERY_KEYS.members(groupId),
        }),
        queryClient.invalidateQueries({ queryKey: ["users", "groups"] }),
      ]),
  });
}
