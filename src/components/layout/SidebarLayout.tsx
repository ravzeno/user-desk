import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ACCESS_QUERY_KEY, ACCESS_STALE_MS, useAccessSession } from "@/hooks/api/access";
import { useCurrentUser } from "@/hooks/api/auth";
import { AccountMenu } from "@/components/sidebar/AccountMenu";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { ErrorState, LoadingState, useToast } from "@/components/ui";

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(() => window.matchMedia("(min-width: 701px)").matches);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const currentUserQuery = useCurrentUser();
  const access = useAccessSession();
  useEffect(() => {
    const state = queryClient.getQueryState(ACCESS_QUERY_KEY);
    if (state?.dataUpdatedAt && Date.now() - state.dataUpdatedAt >= ACCESS_STALE_MS) {
      void queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY });
    }
  }, [location.pathname, location.search, queryClient]);
  useEffect(() => {
    const refresh = () => { void queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY }); };
    window.addEventListener("userdesk:access-denied", refresh);
    return () => window.removeEventListener("userdesk:access-denied", refresh);
  }, [queryClient]);

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

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 701px)");
    const handleChange = (event: MediaQueryListEvent) => setMobileOpen(event.matches);
    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(max-width: 700px)").matches) setMobileOpen(false);
  }, [location.pathname, location.search]);

  if (currentUserQuery.isLoading || access.isLoading)
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

  if (access.error || !access.data) return <main className="auth-background"><ErrorState message={access.error instanceof Error ? access.error.message : "ไม่สามารถตรวจสอบสิทธิ์ได้"} onRetry={() => void access.refetch()} /></main>;
  const required = location.pathname === "/users" ? "core_user:list" : location.pathname === "/users/new" ? "core_user:create" : location.pathname.startsWith("/users/") ? "core_user:get" : location.pathname === "/groups" ? "core_group:list" : location.pathname === "/groups/new" ? "core_group:create" : location.pathname.startsWith("/groups/") ? "core_group:view" : location.pathname.startsWith("/audit-logs") ? "core_audit_log:list" : null;
  const allowed = !required || access.data.includes(required);
  const currentUser = currentUserQuery.data;
  const pageLabel = location.pathname === "/" ? "หน้าแรก" : location.pathname.startsWith("/users")
    ? "ผู้ใช้"
    : location.pathname.startsWith("/groups")
      ? "กลุ่ม"
      : "ประวัติการเปลี่ยนแปลง";

  return (
    <div className={`app-shell ${mobileOpen ? "sidebar-visible" : "sidebar-hidden"}`}>
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={mobileOpen}
            aria-controls="main-sidebar"
          >
            {mobileOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
      <AppSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} onExpand={() => setMobileOpen(true)} account={<AccountMenu user={currentUser} collapsed={!mobileOpen} onExpand={() => setMobileOpen(true)} />} />
      <div className="workspace">
        <header className="topbar">

          <div className="breadcrumb">
            <span>User Desk</span>
            <ChevronRight size={14} />
            <strong>{pageLabel}</strong>
          </div>
        </header>
        <main className="main-content">
          {allowed ? <Outlet /> : <section className="access-denied"><h1>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h1><p>ติดต่อผู้ดูแลระบบหากต้องการสิทธิ์ใช้งาน หรือกลับไปยังหน้าแรกเพื่อดูเมนูที่ใช้ได้</p><a className="button button-secondary" href="/">กลับหน้าแรก</a></section>}
        </main>
        <footer className="app-footer">
          <span>User Desk</span>
          <span>ระบบจัดการผู้ใช้ภายใน</span>
        </footer>
      </div>
    </div>
  );
}
