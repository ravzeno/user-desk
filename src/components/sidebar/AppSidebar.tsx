import userDeskMark from "@/assets/user-desk-mark.svg";
import { usePermission } from "@/hooks/api/access";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { menuItems } from "./sidebar.config";

export function AppSidebar({
  open,
  onClose,
  onExpand,
  account,
}: {
  open: boolean;
  onClose: () => void;
  onExpand: () => void;
  account: ReactNode;
}) {
  const location = useLocation();
  const can = usePermission();
  const [usersOpen, setUsersOpen] = useState(() => location.pathname.startsWith("/users"));
  useEffect(() => {
    if (location.pathname.startsWith("/users")) setUsersOpen(true);
  }, [location.pathname]);
  const activeScope =
    new URLSearchParams(location.search).get("scope") === "backoffice"
      ? "backoffice"
      : "customer";

  return (
    <>
      {open && (
        <button
          className="mobile-scrim"
          aria-label="ปิดเมนู"
          onClick={onClose}
        />
      )}
      <aside id="main-sidebar" className={`sidebar ${open ? "sidebar-open" : ""}`} inert={!open && window.matchMedia("(max-width: 700px)").matches}>
        <div className="brand-lockup">
          <img className="brand-mark" src={userDeskMark} alt="" />
          <div>
            <strong>User Desk</strong>
            <span>ACCOUNT MANAGEMENT</span>
          </div>
        </div>
        <div className="sidebar-caption">จัดการระบบ</div>
        <nav className="main-nav" aria-label="เมนูหลัก">
          {menuItems.filter(({ to }) => to === "/" || can(to === "/users" ? "core_user:list" : to === "/groups" ? "core_group:list" : "core_audit_log:list")).map(({ to, label, icon: Icon, children }) => {
            const isUsersActive =
              Boolean(children) && location.pathname.startsWith(to);
            return children ? (
              <div
                className={`nav-group ${usersOpen ? "nav-group-open" : ""}`}
                key={to}
              >
                <button
                  type="button"
                  className={`nav-item nav-group-toggle ${isUsersActive ? "nav-item-active" : ""}`}
                  title={label}
                  aria-label={label}
                  onClick={() => { if (!open) onExpand(); setUsersOpen((value) => !value); }}
                  aria-expanded={usersOpen}
                  aria-controls="user-submenu"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  <ChevronRight className="nav-chevron" size={15} />
                </button>
                <div
                  className={`nav-submenu-clip ${usersOpen ? "nav-submenu-clip-open" : ""}`}
                  id="user-submenu"
                  aria-label="หมวดผู้ใช้"
                  aria-hidden={!usersOpen}
                  inert={!usersOpen}
                >
                  <div className="nav-submenu">
                    {children.map((child) => (
                      <NavLink
                        className={`nav-subitem ${isUsersActive && activeScope === child.scope ? "nav-subitem-active" : ""}`}
                        end
                        key={child.scope}
                        to={child.to}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-item-active" : ""}`
                }
                to={to}
                end={to === "/"}
                title={label}
                aria-label={label}
                onClick={() => setUsersOpen(false)}
                key={to}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
        {account}
      </aside>
    </>
  );
}
