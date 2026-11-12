import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  LockKeyhole,
  Search,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { z } from "zod";
import type { UserRecord } from "@/lib/api/type/user";
import {
  useAssignGroupUser,
  useCreateGroup,
  useDeleteGroup,
  useGetGroup,
  useGetGroupMembers,
  useRemoveGroupUser,
  useSetGroupPermissions,
  useUpdateGroup,
} from "@/hooks/api/group";
import { useGetUsers } from "@/hooks/api/user";
import { useGetPermissions } from "@/hooks/api/permission";
import {
  isSystemGroup,
  isRootAdminGroup,
} from "@/app/group/components/group-helpers";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeading,
  Pagination,
  StatusBadge,
  getErrorMessage,
  useToast,
} from "@/components/ui";

const groupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อกลุ่ม")
    .max(160, "ชื่อกลุ่มยาวเกินไป"),
  description: z.string().max(500, "คำอธิบายต้องไม่เกิน 500 ตัวอักษร"),
  active: z.boolean(),
});
type GroupValues = z.infer<typeof groupSchema>;

export function GroupDetailPage({ create = false }: { create?: boolean }) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"overview" | "members" | "permissions">(
    "overview",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersPage, setMembersPage] = useState(1);
  const [membersLimit, setMembersLimit] = useState(20);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [removeUser, setRemoveUser] = useState<UserRecord | null>(null);
  const groupQuery = useGetGroup(id, { enabled: !create });
  const group = groupQuery.data;
  const loadedGroupId = useRef<string | null>(null);
  const form = useForm<GroupValues>({
    resolver: zodResolver(groupSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "", active: true },
  });
  useEffect(() => {
    if (
      group &&
      (loadedGroupId.current !== String(group.id) || !form.formState.isDirty)
    ) {
      form.reset({
        name: group.name,
        description: group.description || "",
        active: group.active,
      });
      loadedGroupId.current = String(group.id);
    }
  }, [form.formState.isDirty, form.reset, group]);

  useEffect(() => {
    setMembersPage(1);
  }, [id]);
  const membersQuery = useGetGroupMembers(id, membersPage, membersLimit, {
    enabled: !create && tab === "members",
  });
  const members = membersQuery.data?.items || [];
  const memberCount =
    membersQuery.data?.total ?? group?.memberCount ?? members.length;
  useEffect(() => {
    const total = membersQuery.data?.total;
    if (total === undefined) return;
    const lastPage = Math.max(1, Math.ceil(total / membersLimit));
    if (membersPage > lastPage) setMembersPage(lastPage);
  }, [membersLimit, membersPage, membersQuery.data?.total]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionsDirty, setPermissionsDirty] = useState(false);
  const permissionsGroupId = useRef<string | null>(null);
  useEffect(() => {
    if (!group) return;
    const groupId = String(group.id);
    if (permissionsGroupId.current !== groupId || !permissionsDirty) {
      setPermissions(Array.isArray(group.permissions) ? group.permissions : []);
      setPermissionsDirty(false);
      permissionsGroupId.current = groupId;
    }
  }, [group, permissionsDirty]);
  const catalogQuery = useGetPermissions({
    enabled: tab === "permissions" || create,
  });
  const usersQuery = useGetUsers(memberSearch, 1, 100, {
    enabled: !create && tab === "members",
  });

  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const savePending = create ? createGroup.isPending : updateGroup.isPending;
  const handleSave = (values: GroupValues) => {
    const onError = (error: Error) =>
      showToast(getErrorMessage(error), "error");
    if (create) {
      createGroup.mutate(values, {
        onSuccess: (result) => {
          showToast("สร้างกลุ่มแล้ว", "success");
          const resultId =
            typeof result === "string" || typeof result === "number"
              ? result
              : result?.id;
          navigate(resultId !== undefined ? `/groups/${resultId}` : "/groups", {
            replace: true,
          });
        },
        onError,
      });
    } else {
      updateGroup.mutate(
        { groupId: id, body: values },
        {
          onSuccess: () => {
            form.reset(values);
            showToast("บันทึกกลุ่มแล้ว", "success");
          },
          onError,
        },
      );
    }
  };
  const remove = useDeleteGroup();
  const handleDelete = () =>
    remove.mutate(id, {
      onSuccess: () => {
        showToast("ลบกลุ่มแล้ว", "success");
        navigate("/groups", { replace: true });
      },
      onError: (error) => showToast(getErrorMessage(error), "error"),
    });
  const assignUser = useAssignGroupUser();
  const handleAssignUser = () =>
    selectedUserId &&
    assignUser.mutate(
      { groupId: id, userId: selectedUserId },
      {
        onSuccess: () => {
          setSelectedUserId("");
          showToast("เพิ่มสมาชิกเข้ากลุ่มแล้ว", "success");
        },
        onError: (error) => showToast(getErrorMessage(error), "error"),
      },
    );
  const removeMember = useRemoveGroupUser();
  const handleRemoveMember = () =>
    removeUser &&
    removeMember.mutate(
      { groupId: id, userId: removeUser.id },
      {
        onSuccess: () => {
          setRemoveUser(null);
          showToast("นำสมาชิกออกจากกลุ่มแล้ว", "success");
        },
        onError: (error) => {
          setRemoveUser(null);
          showToast(getErrorMessage(error), "error");
        },
      },
    );
  const savePermissions = useSetGroupPermissions();
  const handleSavePermissions = () =>
    savePermissions.mutate(
      { groupId: id, permissions },
      {
        onSuccess: () => {
          setPermissionsDirty(false);
          showToast("บันทึกสิทธิ์ของกลุ่มแล้ว", "success");
        },
        onError: (error) => showToast(getErrorMessage(error), "error"),
      },
    );

  if (!create && groupQuery.isLoading)
    return <LoadingState label="กำลังโหลดข้อมูลกลุ่ม" />;
  if (!create && (groupQuery.error || !group))
    return (
      <ErrorState
        message={getErrorMessage(groupQuery.error, "ไม่พบข้อมูลกลุ่ม")}
        onRetry={() => void groupQuery.refetch()}
      />
    );
  const systemGroup = isSystemGroup(group);
  const rootAdminGroup = isRootAdminGroup(group);
  const activeFormValue = form.watch("active");
  const canEditDetails =
    !systemGroup || group?.active === true || activeFormValue;
  const canManageMembers = !rootAdminGroup;
  const canManagePermissions = !rootAdminGroup;
  const candidates = (usersQuery.data?.items || []).filter(
    (user) =>
      user.role !== "root-admin" &&
      !members.some((member) => member.id === user.id),
  );

  return (
    <>
      <Link className="back-link" to="/groups">
        <ArrowLeft size={16} /> กลับรายการกลุ่ม
      </Link>
      <PageHeading
        eyebrow="สิทธิ์และการเข้าถึง"
        title={create ? "สร้างกลุ่ม" : group?.name || "รายละเอียดกลุ่ม"}
        description={
          create
            ? "กำหนดชื่อกลุ่ม คำอธิบาย และสถานะเริ่มต้น"
            : group?.description || "จัดการสมาชิกและสิทธิ์ของกลุ่ม"
        }
        actions={
          !create && (
            <>
              {systemGroup && (
                <StatusBadge tone="accent">
                  <LockKeyhole size={13} /> กลุ่มระบบ
                </StatusBadge>
              )}
              {!systemGroup && (
                <button
                  className="button button-danger-outline"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={15} /> ลบกลุ่ม
                </button>
              )}
            </>
          )
        }
      />

      {!create && (
        <div className="detail-tabs" role="tablist" aria-label="แท็บกลุ่ม">
          {[
            { id: "overview", label: "ข้อมูลกลุ่ม", icon: Shield },
            { id: "members", label: "สมาชิก", icon: Users },
            { id: "permissions", label: "สิทธิ์", icon: Check },
          ].map(({ id: tabId, label, icon: Icon }) => (
            <button
              className={`detail-tab ${tab === tabId ? "detail-tab-active" : ""}`}
              role="tab"
              aria-selected={tab === tabId}
              key={tabId}
              onClick={() => setTab(tabId as typeof tab)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}

      {(create || tab === "overview") && (
        <section className="panel form-panel">
          <div className="section-heading">
            <div className="section-icon">
              <Shield size={18} />
            </div>
            <div>
              <h2>ข้อมูลกลุ่ม</h2>
              <p>สถานะกลุ่มจะมีผลต่อ permissions ที่สมาชิกได้รับ</p>
            </div>
          </div>
          <form
            className="form-stack narrow-form"
            onSubmit={form.handleSubmit(handleSave)}
          >
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  label="ชื่อกลุ่ม"
                  htmlFor="group-name"
                  error={fieldState.error?.message}
                >
                  <input
                    {...field}
                    id="group-name"
                    disabled={!canEditDetails}
                    placeholder="เช่น ฝ่ายบริการลูกค้า"
                  />
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  label="คำอธิบาย"
                  htmlFor="group-description"
                  hint="ไม่เกิน 500 ตัวอักษร"
                  error={fieldState.error?.message}
                >
                  <textarea
                    {...field}
                    id="group-description"
                    maxLength={500}
                    rows={4}
                    disabled={!canEditDetails}
                    placeholder="อธิบายวัตถุประสงค์ของกลุ่ม"
                  />
                </Field>
              )}
            />
            <Controller
              name="active"
              control={form.control}
              render={({ field }) => {
                const activeSwitchLocked = systemGroup && field.value;
                return (
                <label
                  className={`switch-row ${activeSwitchLocked ? "switch-disabled" : ""}`}
                >
                  <span>
                    <strong>เปิดใช้งานกลุ่ม</strong>
                    <small>
                      กลุ่มที่ปิดใช้งานจะไม่นำ permissions ไปคำนวณให้สมาชิก
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={activeSwitchLocked}
                  />
                  <span className="switch-ui" />
                </label>
                );
              }}
            />
            {systemGroup && (
              <div className="notice notice-info">
                <LockKeyhole size={16} />
                กลุ่มระบบปิดใช้งานหรือลบไม่ได้
              </div>
            )}
            <div className="form-actions">
              <Link className="button button-secondary" to="/groups">
                ยกเลิก
              </Link>
              <button
                className="button button-primary"
                type="submit"
                disabled={
                  !form.formState.isValid ||
                  savePending ||
                  (!create && !form.formState.isDirty)
                }
              >
                {savePending
                  ? "กำลังบันทึก…"
                  : create
                    ? "สร้างกลุ่ม"
                    : "บันทึกกลุ่ม"}
              </button>
            </div>
          </form>
        </section>
      )}

      {!create && tab === "members" && (
        <section className="panel table-panel">
          <div className="table-heading">
            <div>
              <strong>สมาชิกกลุ่ม</strong>
              <span>{memberCount.toLocaleString("th-TH")} คน</span>
            </div>
          </div>
          {canManageMembers && (
            <div className="member-assign">
              <div className="member-search">
                <Search size={17} />
                <input
                  value={memberSearch}
                  onChange={(event) => {
                    setMemberSearch(event.target.value);
                    setSelectedUserId("");
                  }}
                  placeholder="ค้นหาผู้ใช้เพื่อเพิ่มเข้ากลุ่ม"
                  aria-label="ค้นหาผู้ใช้เพื่อเพิ่มเข้ากลุ่ม"
                />
              </div>
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                aria-label="เลือกผู้ใช้"
                disabled={
                  usersQuery.isLoading ||
                  Boolean(usersQuery.error) ||
                  candidates.length === 0
                }
              >
                <option value="">
                  {usersQuery.isLoading
                    ? "กำลังโหลดรายชื่อผู้ใช้…"
                    : usersQuery.error
                      ? "โหลดรายชื่อผู้ใช้ไม่สำเร็จ"
                      : candidates.length === 0
                        ? memberSearch.trim()
                          ? "ไม่พบผู้ใช้ที่เพิ่มได้"
                          : "ไม่มีผู้ใช้ที่เพิ่มได้"
                        : "เลือกผู้ใช้…"}
                </option>
                {candidates.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} — {user.email}
                  </option>
                ))}
              </select>
              <button
                className="button button-primary"
                onClick={() => handleAssignUser()}
                disabled={
                  !selectedUserId ||
                  !candidates.some((user) => user.id === selectedUserId) ||
                  assignUser.isPending ||
                  usersQuery.isLoading ||
                  Boolean(usersQuery.error)
                }
              >
                <UserPlus size={16} /> เพิ่มสมาชิก
              </button>
            </div>
          )}
          {usersQuery.error && tab === "members" && (
            <ErrorState
              message={getErrorMessage(usersQuery.error)}
              onRetry={() => void usersQuery.refetch()}
            />
          )}
          {membersQuery.isLoading ? (
            <LoadingState label="กำลังโหลดรายชื่อสมาชิก" />
          ) : membersQuery.error ? (
            <ErrorState
              message={getErrorMessage(membersQuery.error)}
              onRetry={() => void membersQuery.refetch()}
            />
          ) : !members.length ? (
            <EmptyState
              title="ไม่พบสมาชิกในกลุ่ม"
              description="เมื่อมีสมาชิก ระบบจะแสดงรายชื่อในส่วนนี้"
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>สมาชิก</th>
                    <th>อีเมล</th>
                    <th>บทบาท</th>
                    <th>ยืนยันอีเมล</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {members.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="person-cell">
                          <div className="person-avatar">
                            {user.name
                              ?.trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part.charAt(0))
                              .join("")
                              .toUpperCase() || "U"}
                          </div>
                          <div>
                            <strong>{user.name || "ไม่ระบุชื่อ"}</strong>
                            <small>ID: {user.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role || "—"}</td>
                      <td>
                        {user.emailVerified === true ? (
                          <StatusBadge tone="success">ยืนยันแล้ว</StatusBadge>
                        ) : user.emailVerified === false ? (
                          <StatusBadge tone="warning">รอยืนยัน</StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">ไม่ทราบ</StatusBadge>
                        )}
                      </td>
                      <td>
                        {canManageMembers && (
                          <button
                            className="button button-danger-outline button-small"
                            onClick={() => setRemoveUser(user)}
                          >
                            <UserMinus size={14} /> นำออก
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!membersQuery.isLoading && !membersQuery.error && members.length > 0 && (
            <Pagination
              page={membersQuery.data?.page ?? membersPage}
              limit={membersQuery.data?.limit ?? membersLimit}
              total={memberCount}
              onPage={setMembersPage}
              onLimit={(next) => {
                setMembersLimit(Math.min(100, next));
                setMembersPage(1);
              }}
            />
          )}
        </section>
      )}

      {!create && tab === "permissions" && (
        <section className="panel table-panel">
          <div className="table-heading">
            <div>
              <strong>Permissions ของกลุ่ม</strong>
              <span>เลือกจาก permission catalog ที่ API ส่งกลับ</span>
            </div>
            {canManagePermissions && (
              <button
                className="button button-primary"
                onClick={handleSavePermissions}
                disabled={savePermissions.isPending || !permissionsDirty}
              >
                {savePermissions.isPending ? "กำลังบันทึก…" : "บันทึกสิทธิ์"}
              </button>
            )}
          </div>
          {catalogQuery.isLoading ? (
            <LoadingState label="กำลังโหลด permission catalog" />
          ) : catalogQuery.error ? (
            <ErrorState
              message={getErrorMessage(catalogQuery.error)}
              onRetry={() => void catalogQuery.refetch()}
            />
          ) : !catalogQuery.data?.length ? (
            <EmptyState
              title="ไม่พบ permission"
              description="API ยังไม่ได้ส่งรายการ permission catalog มา"
            />
          ) : (
            <div className="permission-list">
              {catalogQuery.data.map((permission) => {
                const checked = permissions.includes(permission.key);
                return (
                  <label
                    className={`permission-option ${checked ? "permission-selected" : ""} ${!canManagePermissions || savePermissions.isPending ? "permission-disabled" : ""}`}
                    key={permission.key}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!canManagePermissions || savePermissions.isPending}
                      onChange={() => {
                        const updated = checked
                          ? permissions.filter(
                              (item) => item !== permission.key,
                            )
                          : [...permissions, permission.key];
                        const saved = Array.isArray(group?.permissions)
                          ? group.permissions
                          : [];
                        setPermissions(updated);
                        setPermissionsDirty(
                          updated.length !== saved.length ||
                            updated.some((item) => !saved.includes(item)),
                        );
                      }}
                    />
                    <span className="permission-check">
                      {checked && <Check size={14} />}
                    </span>
                    <span className="permission-copy">
                      <strong>{permission.key}</strong>
                      <small>
                        {permission.description || permission.name || ""}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {rootAdminGroup && (
            <div className="notice notice-info">
              <LockKeyhole size={16} />
              Permissions ของกลุ่ม Root administrator ถูกกำหนดไว้ตายตัว
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="ลบกลุ่มนี้?"
        description="สมาชิกจะไม่สามารถใช้ permissions จากกลุ่มนี้ได้ การลบยังอยู่ภายใต้ข้อจำกัดของระบบ"
        confirmLabel="ลบกลุ่ม"
        destructive
        busy={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={Boolean(removeUser)}
        title="นำสมาชิกออกจากกลุ่ม?"
        description={`นำ ${removeUser?.name || removeUser?.email || "ผู้ใช้"} ออกจากกลุ่มนี้`}
        confirmLabel="นำออกจากกลุ่ม"
        destructive
        busy={removeMember.isPending}
        onCancel={() => setRemoveUser(null)}
        onConfirm={handleRemoveMember}
      />
    </>
  );
}
