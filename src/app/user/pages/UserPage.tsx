import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  AtSign,
  Ban,
  ChevronRight,
  CircleUserRound,
  Clock3,
  MailCheck,
  Pencil,
  Plus,
  RotateCcw,
  Shield,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { z } from "zod";
import type { Role, UserListScope } from "@/lib/api/type/user";
import {
  useBanUser,
  useCreateUser,
  useDeleteUser,
  useGetUser,
  useGetUserGroups,
  useGetUserSessions,
  useGetUsers,
  useRevokeUserSession,
  useSetUserRole,
  useUnbanUser,
  useUpdateUser,
} from "@/hooks/api/user";
import { useSendVerificationEmail } from "@/hooks/api/auth";
import {
  UserStatusBadge,
  userInitials,
} from "@/app/user/components/UserIdentity";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeading,
  Pagination,
  SearchForm,
  StatusBadge,
  formatDate,
  getErrorMessage,
  useToast,
} from "@/components/ui";

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อ")
    .max(200, "ชื่อต้องไม่เกิน 200 ตัวอักษร"),
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z
    .string()
    .min(12, "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร")
    .max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร"),
});
type CreateUserValues = z.infer<typeof createUserSchema>;

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อ")
    .max(200, "ชื่อต้องไม่เกิน 200 ตัวอักษร"),
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  phoneNumber: z.string().max(32, "เบอร์โทรศัพท์ต้องไม่เกิน 32 ตัวอักษร"),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function UsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchParams] = useSearchParams();
  const scope: UserListScope =
    searchParams.get("scope") === "backoffice" ? "backoffice" : "customer";
  const users = useGetUsers(q, page, limit, { scope });
  const accountTitle = scope === "customer" ? "บัญชีลูกค้า" : "บัญชี Backoffice";
  const accountCategory =
    scope === "customer" ? "ลูกค้า" : "บัญชี Backoffice";
  useEffect(() => setPage(1), [scope]);

  return (
    <>
      <PageHeading
        eyebrow="บัญชีและการเข้าถึง"
        title="ผู้ใช้"
        description="แยกรายชื่อลูกค้าและบัญชี Backoffice เพื่อค้นหาและจัดการได้ง่ายขึ้น"
        actions={
          scope === "customer" ? (
            <Link className="button button-primary" to="/users/new">
              <Plus size={17} /> เพิ่มลูกค้า
            </Link>
          ) : undefined
        }
      />
      <section className="panel filter-panel">
        <div className="filter-label">
          <span className="eyebrow">ค้นหารายชื่อ</span>
          <span className="filter-note">ค้นหาด้วยชื่อหรืออีเมล</span>
        </div>
        <SearchForm
          value={q}
          placeholder={`ชื่อ หรืออีเมล${accountCategory}`}
          onSubmit={(value) => {
            setQ(value.trim());
            setPage(1);
          }}
        />
      </section>
      {users.isLoading ? (
        <LoadingState label={`กำลังโหลด${accountTitle}`} />
      ) : users.error ? (
        <ErrorState
          message={getErrorMessage(users.error)}
          onRetry={() => void users.refetch()}
        />
      ) : !users.data?.items.length ? (
        <EmptyState
          title={
            q
              ? `ไม่พบ${accountCategory}ที่ตรงกับการค้นหา`
              : `ยังไม่มี${accountTitle}`
          }
          description={
            q
              ? "ลองตรวจคำค้นหรือค้นหาด้วยอีเมล"
              : scope === "customer"
                ? "เพิ่มบัญชีลูกค้าใหม่เพื่อเริ่มจัดการใน User Desk"
                : "บัญชีที่มีบทบาทเจ้าหน้าที่จะแสดงในส่วนนี้"
          }
          action={
            !q && scope === "customer" && (
              <Link
                className="button button-primary button-small"
                to="/users/new"
              >
                <Plus size={16} /> เพิ่มลูกค้า
              </Link>
            )
          }
        />
      ) : (
        <section className="panel table-panel">
          <div className="table-heading">
            <div>
              <strong>{accountTitle}</strong>
              <span>{users.data.total.toLocaleString("th-TH")} รายการ</span>
            </div>
            <span className="table-context">อัปเดตจากระบบโดยตรง</span>
          </div>
          <div className="table-scroll desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ผู้ใช้</th>
                  <th>อีเมล</th>
                  <th>บทบาท</th>
                  <th>สถานะ</th>
                  <th>ยืนยันอีเมล</th>
                  <th>สร้างเมื่อ</th>
                  <th aria-label="เปิดรายละเอียด" />
                </tr>
              </thead>
              <tbody>
                {users.data.items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="person-cell">
                        <div className="person-avatar">
                          {userInitials(user.name)}
                        </div>
                        <div>
                          <strong>{user.name || "ไม่ระบุชื่อ"}</strong>
                          <small>ID: {user.id}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{user.email}</td>
                    <td>
                      <StatusBadge
                        tone={user.role === "staff" ? "accent" : "neutral"}
                      >
                        {user.role || "ไม่ระบุ"}
                      </StatusBadge>
                    </td>
                    <td>
                      <UserStatusBadge user={user} />
                    </td>
                    <td>
                      {user.emailVerified === true ? (
                        <StatusBadge tone="success">ยืนยันแล้ว</StatusBadge>
                      ) : user.emailVerified === false ? (
                        <StatusBadge tone="warning">รอยืนยัน</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">ไม่ทราบ</StatusBadge>
                      )}
                    </td>
                    <td className="text-muted">{formatDate(user.createdAt)}</td>
                    <td>
                      <Link
                        className="icon-button row-open"
                        to={`/users/${encodeURIComponent(user.id)}?scope=${scope}`}
                        aria-label={`ดู ${user.name}`}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-record-list mobile-only">
            {users.data.items.map((user) => (
              <Link
                className="mobile-record"
                to={`/users/${encodeURIComponent(user.id)}?scope=${scope}`}
                key={user.id}
              >
                <div className="mobile-record-main">
                  <div className="person-avatar">{userInitials(user.name)}</div>
                  <div>
                    <strong>{user.name || "ไม่ระบุชื่อ"}</strong>
                    <span>{user.email}</span>
                  </div>
                  <ChevronRight size={17} />
                </div>
                <div className="mobile-record-meta">
                  <UserStatusBadge user={user} />
                  <StatusBadge
                    tone={user.role === "staff" ? "accent" : "neutral"}
                  >
                    {user.role || "ไม่ระบุ"}
                  </StatusBadge>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            page={users.data.page}
            limit={users.data.limit}
            total={users.data.total}
            onPage={setPage}
            onLimit={(next) => {
              setLimit(Math.min(100, next));
              setPage(1);
            }}
          />
        </section>
      )}
    </>
  );
}

export function UserFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "" },
  });
  const create = useCreateUser();

  const handleCreate = (values: CreateUserValues) =>
    create.mutate(values, {
      onSuccess: (result) => {
        showToast("สร้างบัญชีแล้ว ระบบส่งอีเมลยืนยันให้ผู้ใช้แล้ว", "success");
        const id =
          typeof result === "string"
            ? result
            : typeof result === "object" && result !== null
              ? result.id
              : undefined;
        navigate(id ? `/users/${encodeURIComponent(String(id))}` : "/users", {
          replace: true,
        });
      },
      onError: (error) => showToast(getErrorMessage(error), "error"),
    });

  return (
    <>
      <Link className="back-link" to="/users">
        <ArrowLeft size={16} /> กลับรายชื่อผู้ใช้
      </Link>
      <PageHeading
        eyebrow="บัญชีและการเข้าถึง"
        title="สร้างผู้ใช้"
        description="สร้างบัญชีใหม่ ระบบจะส่งอีเมลสำหรับยืนยันที่อยู่ให้ผู้ใช้"
      />
      <section className="panel form-panel">
        <div className="section-heading">
          <div className="section-icon">
            <UserRound size={18} />
          </div>
          <div>
            <h2>ข้อมูลบัญชี</h2>
            <p>กรอกข้อมูลพื้นฐานของผู้ใช้ใหม่</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={form.handleSubmit(handleCreate)}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                label="ชื่อ-นามสกุล"
                htmlFor="user-name"
                hint="ไม่เกิน 200 ตัวอักษร"
                error={fieldState.error?.message}
              >
                <input
                  {...field}
                  id="user-name"
                  autoComplete="name"
                  maxLength={200}
                  placeholder="เช่น สมชาย ใจดี"
                />
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                label="อีเมล"
                htmlFor="user-email"
                hint="ผู้ใช้จะได้รับอีเมลยืนยันบัญชี"
                error={fieldState.error?.message}
              >
                <input
                  {...field}
                  id="user-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                />
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                label="รหัสผ่านเริ่มต้น"
                htmlFor="user-password"
                hint="ความยาว 12–128 ตัวอักษร"
                error={fieldState.error?.message}
              >
                <input
                  {...field}
                  id="user-password"
                  type="password"
                  autoComplete="new-password"
                  maxLength={128}
                  placeholder="กำหนดรหัสผ่านเริ่มต้น"
                />
              </Field>
            )}
          />
          <div className="form-aside-note">
            <Shield size={16} />
            <span>
              สิทธิ์การใช้งานจะมาจากกลุ่มที่สมาชิกสังกัด บทบาทของบัญชีแยกจาก
              permissions ในกลุ่ม
            </span>
          </div>
          <div className="form-actions">
            <Link className="button button-secondary" to="/users">
              ยกเลิก
            </Link>
            <button
              className="button button-primary"
              type="submit"
              disabled={!form.formState.isValid || create.isPending}
            >
              {create.isPending ? "กำลังสร้าง…" : "สร้างบัญชี"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

type UserTab = "profile" | "groups" | "sessions";

export function UserDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToUsers = `/users?scope=${searchParams.get("scope") === "backoffice" ? "backoffice" : "customer"}`;
  const { showToast } = useToast();
  const [tab, setTab] = useState<UserTab>("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [confirm, setConfirm] = useState<"ban" | "delete" | "revoke" | null>(
    null,
  );
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const userQuery = useGetUser(id);
  const groupsQuery = useGetUserGroups(id, { enabled: tab === "groups" });
  const sessionsQuery = useGetUserSessions(id, { enabled: tab === "sessions" });
  const user = userQuery.data;

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", phoneNumber: "" },
  });
  const resetProfile = profileForm.reset;
  const loadedUserId = useRef<string | null>(null);
  useEffect(() => {
    if (!user) return;
    const userChanged = loadedUserId.current !== user.id;
    if (userChanged || !profileForm.formState.isDirty) {
      resetProfile({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
      if (userChanged) setEditingProfile(false);
      loadedUserId.current = user.id;
    }
  }, [profileForm.formState.isDirty, resetProfile, user]);

  const update = useUpdateUser();
  const handleUpdate = (values: ProfileValues) =>
    update.mutate(
      { userId: id, body: values },
      {
        onSuccess: () => {
          resetProfile(values);
          setEditingProfile(false);
          showToast(
            values.email !== user?.email
              ? "ข้อมูลบันทึกแล้ว ระบบส่งอีเมลเพื่อยืนยันอีเมลใหม่"
              : "บันทึกข้อมูลผู้ใช้แล้ว",
            "success",
          );
        },
        onError: (error) => showToast(getErrorMessage(error), "error"),
      },
    );
  const handleCancelProfileEdit = () => {
    if (!user) return;
    resetProfile({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    });
    setEditingProfile(false);
  };
  const roleValue: Role = user?.role === "staff" ? "staff" : "customer";
  const [nextRole, setNextRole] = useState<Role>(roleValue);
  const [editingRole, setEditingRole] = useState(false);
  useEffect(() => {
    if (user?.role === "customer" || user?.role === "staff")
      setNextRole(user.role);
    setEditingRole(false);
  }, [id, user?.role]);
  const handleCancelRoleEdit = () => {
    setNextRole(roleValue);
    setEditingRole(false);
  };
  const setRole = useSetUserRole();
  const handleSetRole = (role: Role) =>
    setRole.mutate(
      { userId: id, role },
      {
        onSuccess: () => {
          setEditingRole(false);
          showToast("อัปเดตบทบาทแล้ว", "success");
        },
        onError: (error) => showToast(getErrorMessage(error), "error"),
      },
    );
  const ban = useBanUser();
  const unban = useUnbanUser();
  const handleBan = () =>
    ban.mutate(id, {
      onSuccess: () => {
        setConfirm(null);
        showToast("ระงับบัญชีแล้ว", "success");
      },
      onError: (error) => {
        setConfirm(null);
        showToast(getErrorMessage(error), "error");
      },
    });
  const handleUnban = () =>
    unban.mutate(id, {
      onSuccess: () => {
        showToast("ยกเลิกการระงับบัญชีแล้ว", "success");
      },
      onError: (error) => showToast(getErrorMessage(error), "error"),
    });
  const remove = useDeleteUser();
  const handleDelete = () =>
    remove.mutate(id, {
      onSuccess: () => {
        setConfirm(null);
        showToast("ลบบัญชีแบบ soft-delete แล้ว", "success");
        navigate("/users", { replace: true });
      },
      onError: (error) => {
        setConfirm(null);
        showToast(getErrorMessage(error), "error");
      },
    });
  const revoke = useRevokeUserSession();
  const handleRevoke = () =>
    sessionToRevoke &&
    revoke.mutate(
      { userId: id, sessionId: sessionToRevoke },
      {
        onSuccess: () => {
          setConfirm(null);
          setSessionToRevoke(null);
          showToast("เพิกถอนเซสชันแล้ว", "success");
        },
        onError: (error) => {
          setConfirm(null);
          showToast(getErrorMessage(error), "error");
        },
      },
    );
  const verification = useSendVerificationEmail();
  const handleVerification = () =>
    verification.mutate(
      {
        email: user?.email || "",
        callbackURL: `${window.location.origin}/verify-email`,
      },
      {
        onSuccess: () => showToast("ส่งอีเมลยืนยันแล้ว", "success"),
        onError: (error) => showToast(getErrorMessage(error), "error"),
      },
    );
  const emailStatus =
    user?.emailVerified === false ? (
      <div className="notice notice-warning">
        <AtSign size={17} />
        <span>อีเมลยังไม่ได้รับการยืนยัน</span>
        <button
          type="button"
          className="text-button"
          onClick={handleVerification}
          disabled={verification.isPending}
        >
          {verification.isPending ? "กำลังส่ง…" : "ส่งอีเมลอีกครั้ง"}
        </button>
      </div>
    ) : user?.emailVerified ? (
      <div className="email-verified">
        <MailCheck size={17} /> ยืนยันอีเมลแล้ว
      </div>
    ) : null;

  if (userQuery.isLoading)
    return <LoadingState label="กำลังโหลดข้อมูลผู้ใช้" />;
  if (userQuery.error || !user)
    return (
      <ErrorState
        message={getErrorMessage(userQuery.error, "ไม่พบข้อมูลผู้ใช้")}
        onRetry={() => void userQuery.refetch()}
      />
    );

  const isStandardRole =
    user.role === "customer" || user.role === "staff" || !user.role;
  return (
    <>
      <Link className="back-link" to={returnToUsers}>
        <ArrowLeft size={16} /> กลับรายชื่อผู้ใช้
      </Link>
      <div className="user-detail-header">
        <div className="detail-person">
          <div className="person-avatar person-avatar-large">
            {userInitials(user.name)}
          </div>
          <div>
            <div className="detail-name-line">
              <h1>{user.name || "ไม่ระบุชื่อ"}</h1>
              <UserStatusBadge user={user} />
            </div>
            <p>
              {user.email} <span className="detail-dot">·</span> ID: {user.id}
            </p>
          </div>
        </div>
        <div className="detail-actions">
          {!user.banned ? (
            <button
              className="button button-secondary"
              onClick={() => setConfirm("ban")}
            >
              <Ban size={16} /> ระงับบัญชี
            </button>
          ) : (
            <button
              className="button button-secondary"
              onClick={handleUnban}
              disabled={unban.isPending}
            >
              <RotateCcw size={16} /> ยกเลิกระงับ
            </button>
          )}
          <button
            className="button button-danger-outline"
            onClick={() => setConfirm("delete")}
          >
            <Trash2 size={16} /> ลบบัญชี
          </button>
        </div>
      </div>

      <div className="detail-tabs" role="tablist" aria-label="รายละเอียดผู้ใช้">
        {[
          { id: "profile", label: "ข้อมูลบัญชี", icon: UserRound },
          { id: "groups", label: "กลุ่ม", icon: Users },
          { id: "sessions", label: "เซสชัน", icon: Clock3 },
        ].map(({ id: tabId, label, icon: Icon }) => (
          <button
            className={`detail-tab ${tab === tabId ? "detail-tab-active" : ""}`}
            role="tab"
            aria-selected={tab === tabId}
            key={tabId}
            onClick={() => setTab(tabId as UserTab)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="detail-grid">
          <section className="panel form-panel">
            <div className="section-heading profile-heading">
              <div className="profile-heading-copy">
                <div className="section-icon">
                  <CircleUserRound size={18} />
                </div>
                <div>
                  <h2>ข้อมูลส่วนตัว</h2>
                  <p>{editingProfile ? "แก้ไขข้อมูลบัญชีผู้ใช้" : "ข้อมูลบัญชีผู้ใช้"}</p>
                </div>
              </div>
              {!editingProfile && (
                <button
                  className="button button-secondary button-small"
                  type="button"
                  onClick={() => setEditingProfile(true)}
                >
                  <Pencil size={15} /> แก้ไข
                </button>
              )}
            </div>
            {editingProfile ? (
              <form
                className="form-stack"
                onSubmit={profileForm.handleSubmit(handleUpdate)}
              >
                <Controller
                  name="name"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field
                      label="ชื่อ-นามสกุล"
                      htmlFor="edit-name"
                      error={fieldState.error?.message}
                    >
                      <input {...field} id="edit-name" maxLength={200} />
                    </Field>
                  )}
                />
                <Controller
                  name="email"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field
                      label="อีเมล"
                      htmlFor="edit-email"
                      error={fieldState.error?.message}
                    >
                      <input
                        {...field}
                        id="edit-email"
                        type="email"
                        autoComplete="email"
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="phoneNumber"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field
                      label="เบอร์โทรศัพท์"
                      htmlFor="edit-phone"
                      error={fieldState.error?.message}
                    >
                      <input
                        {...field}
                        id="edit-phone"
                        type="tel"
                        maxLength={32}
                        placeholder="ไม่บังคับ"
                      />
                    </Field>
                  )}
                />
                {emailStatus}
                <div className="form-actions">
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={handleCancelProfileEdit}
                    disabled={update.isPending}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={
                      !profileForm.formState.isValid ||
                      update.isPending ||
                      !profileForm.formState.isDirty
                    }
                  >
                    {update.isPending ? "กำลังบันทึก…" : "บันทึกข้อมูล"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="profile-summary">
                  <div>
                    <dt>ชื่อ-นามสกุล</dt>
                    <dd>{user.name || "ไม่ระบุชื่อ"}</dd>
                  </div>
                  <div>
                    <dt>อีเมล</dt>
                    <dd>{user.email || "ไม่ระบุอีเมล"}</dd>
                  </div>
                  <div>
                    <dt>เบอร์โทรศัพท์</dt>
                    <dd>{user.phoneNumber || "ไม่ระบุ"}</dd>
                  </div>
                </dl>
                {emailStatus && (
                  <div className="profile-email-status">{emailStatus}</div>
                )}
              </>
            )}
          </section>
          <div className="detail-side-stack">
            <section className="panel compact-panel">
              <div className="section-heading profile-heading">
                <div className="profile-heading-copy">
                  <div className="section-icon">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h2>บทบาทบัญชี</h2>
                    <p>บทบาทไม่ใช่ permissions จากกลุ่ม</p>
                  </div>
                </div>
                {isStandardRole && !editingRole && (
                  <button
                    className="button button-secondary button-small"
                    type="button"
                    onClick={() => setEditingRole(true)}
                  >
                    <Pencil size={14} /> แก้ไข
                  </button>
                )}
              </div>
              {isStandardRole ? (
                editingRole ? (
                  <div className="role-edit-stack">
                    <select
                      value={nextRole}
                      onChange={(event) =>
                        setNextRole(event.target.value as Role)
                      }
                      aria-label="เลือกบทบาท"
                    >
                      <option value="customer">customer</option>
                      <option value="staff">staff</option>
                    </select>
                    <div className="role-edit-actions">
                      <button
                        className="button button-secondary button-small"
                        type="button"
                        onClick={handleCancelRoleEdit}
                        disabled={setRole.isPending}
                      >
                        ยกเลิก
                      </button>
                      <button
                        className="button button-primary button-small"
                        type="button"
                        onClick={() => handleSetRole(nextRole)}
                        disabled={setRole.isPending || nextRole === roleValue}
                      >
                        {setRole.isPending ? "กำลังบันทึก…" : "บันทึก"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="role-summary">{roleValue}</div>
                )
              ) : (
                <div className="protected-role">
                  <StatusBadge tone="accent">{String(user.role)}</StatusBadge>
                  <span>บทบาทนี้จัดการผ่าน bootstrap seed</span>
                </div>
              )}
            </section>
            <section className="panel compact-panel account-facts">
              <h2>ข้อมูลระบบ</h2>
              <dl>
                <div>
                  <dt>สถานะบัญชี</dt>
                  <dd>
                    <UserStatusBadge user={user} />
                  </dd>
                </div>
                <div>
                  <dt>สร้างเมื่อ</dt>
                  <dd>{formatDate(user.createdAt)}</dd>
                </div>
                <div>
                  <dt>แก้ไขล่าสุด</dt>
                  <dd>{formatDate(user.updatedAt)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      )}

      {tab === "groups" && (
        <section className="panel table-panel">
          <div className="table-heading">
            <div>
              <strong>กลุ่มที่เป็นสมาชิก</strong>
              <span>ข้อมูลจากบัญชีผู้ใช้</span>
            </div>
          </div>
          {groupsQuery.isLoading ? (
            <LoadingState label="กำลังโหลดกลุ่ม" />
          ) : groupsQuery.error ? (
            <ErrorState
              message={getErrorMessage(groupsQuery.error)}
              onRetry={() => void groupsQuery.refetch()}
            />
          ) : !groupsQuery.data?.length ? (
            <EmptyState
              title="ผู้ใช้ยังไม่อยู่ในกลุ่ม"
              description="กลุ่มที่ได้รับมอบหมายจะแสดงในส่วนนี้"
            />
          ) : (
            <div className="simple-list">
              {groupsQuery.data.map((group) => (
                <div className="simple-list-row user-group-row" key={group.id}>
                  <div className="simple-list-icon">
                    <Shield size={17} />
                  </div>
                  <div>
                    <strong>{group.name}</strong>
                    <span>{group.description || "ไม่มีคำอธิบาย"}</span>
                  </div>
                  {typeof group.active === "boolean" && (
                    <StatusBadge
                      tone={group.active ? "success" : "neutral"}
                    >
                      {group.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </StatusBadge>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "sessions" && (
        <section className="panel table-panel">
          <div className="table-heading">
            <div>
              <strong>เซสชันที่ใช้งาน</strong>
              <span>เพิกถอนเซสชันที่ไม่ต้องการได้</span>
            </div>
          </div>
          {sessionsQuery.isLoading ? (
            <LoadingState label="กำลังโหลดเซสชัน" />
          ) : sessionsQuery.error ? (
            <ErrorState
              message={getErrorMessage(sessionsQuery.error)}
              onRetry={() => void sessionsQuery.refetch()}
            />
          ) : !sessionsQuery.data?.length ? (
            <EmptyState
              title="ไม่พบเซสชัน"
              description="ไม่มีเซสชันที่ API ส่งกลับมา"
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>เซสชัน</th>
                    <th>เริ่มเมื่อ</th>
                    <th>หมดอายุ</th>
                    <th>IP address</th>
                    <th>อุปกรณ์</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sessionsQuery.data.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <code>{session.id.slice(0, 12)}…</code>
                      </td>
                      <td>{formatDate(session.createdAt)}</td>
                      <td>{formatDate(session.expiresAt)}</td>
                      <td>{session.ipAddress || "—"}</td>
                      <td className="session-agent">
                        {session.userAgent || "—"}
                      </td>
                      <td>
                        <button
                          className="button button-danger-outline button-small"
                          onClick={() => {
                            setSessionToRevoke(session.id);
                            setConfirm("revoke");
                          }}
                        >
                          <X size={14} /> เพิกถอน
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={confirm === "ban"}
        title="ระงับบัญชีผู้ใช้?"
        description={`ผู้ใช้ ${user.name || user.email} จะไม่สามารถใช้บัญชีนี้ได้จนกว่าจะยกเลิกการระงับ`}
        confirmLabel="ระงับบัญชี"
        destructive
        busy={ban.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={handleBan}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        title="ลบบัญชีผู้ใช้?"
        description="บัญชีจะถูก soft-delete และเซสชันที่เกี่ยวข้องจะถูกเพิกถอน บัญชีจะหายจากรายการปกติ"
        confirmLabel="ลบบัญชี"
        destructive
        busy={remove.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={confirm === "revoke"}
        title="เพิกถอนเซสชันนี้?"
        description="ผู้ใช้จะต้องเข้าสู่ระบบใหม่บนอุปกรณ์ที่ใช้เซสชันนี้"
        confirmLabel="เพิกถอนเซสชัน"
        destructive
        busy={revoke.isPending}
        onCancel={() => {
          setConfirm(null);
          setSessionToRevoke(null);
        }}
        onConfirm={handleRevoke}
      />
    </>
  );
}
