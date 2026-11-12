import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, CircleUserRound, Menu } from "lucide-react";
import { ApiError, clearExpiredSessionState } from "@/lib/api/client";
import { useCurrentUser, useSignOut } from "@/hooks/api/auth";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { ErrorState, LoadingState, useToast } from "@/components/ui";

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const currentUserQuery = useCurrentUser();
  const logout = useSignOut();

  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      showToast("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง", "error");
      navigate("/login?expired=1", { replace: true });
    };
    window.addEventListener("userdesk:session-expired", onExpired);
    return () =>
      window.removeEventListener("userdesk:session-expired", onExpired);
  }, [navigate, queryClient, showToast]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  if (currentUserQuery.isLoading)
    return <LoadingState label="กำลังตรวจสอบเซสชัน" />;
  if (currentUserQuery.error || !currentUserQuery.data)
    return (
      <main className="auth-background">
        <ErrorState
          message={
            currentUserQuery.error instanceof Error
              ? currentUserQuery.error.message
              : "ยังไม่สามารถตรวจสอบเซสชันได้"
          }
          onRetry={() => void currentUserQuery.refetch()}
        />
      </main>
    );

  const currentUser = currentUserQuery.data;
  const pageLabel = location.pathname.startsWith("/users")
    ? "ผู้ใช้"
    : location.pathname.startsWith("/groups")
      ? "กลุ่ม"
      : "ประวัติการเปลี่ยนแปลง";

  return (
    <div className="app-shell">
      <AppSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>User Desk</span>
            <ChevronRight size={14} />
            <strong>{pageLabel}</strong>
          </div>
          <div className="topbar-user">
            <div className="user-avatar">
              <CircleUserRound size={20} />
            </div>
            <div className="topbar-user-info">
              <strong>{currentUser.name || currentUser.email}</strong>
              <span>{currentUser.email}</span>
            </div>
            <button
              className="button button-quiet button-small"
              onClick={() =>
                logout.mutate(undefined, {
                  onSuccess: () => {
                    queryClient.clear();
                    clearExpiredSessionState();
                    navigate("/login", { replace: true });
                  },
                  onError: (error) => {
                    if (error instanceof ApiError && error.status === 401)
                      return;
                    showToast(
                      error instanceof Error
                        ? error.message
                        : "ออกจากระบบไม่สำเร็จ",
                      "error",
                    );
                  },
                })
              }
              disabled={logout.isPending}
            >
              {logout.isPending ? "กำลังออก…" : "ออกจากระบบ"}
            </button>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>User Desk</span>
          <span>ระบบจัดการผู้ใช้ภายใน</span>
        </footer>
      </div>
    </div>
  );
}
