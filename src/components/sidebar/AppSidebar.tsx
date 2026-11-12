import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import { menuItems } from "./sidebar.config";

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
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
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark">U</div>
          <div>
            <strong>User Desk</strong>
            <span>ACCOUNT MANAGEMENT</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={onClose}
            aria-label="ปิดเมนู"
          >
            <X size={19} />
          </button>
        </div>
        <div className="sidebar-caption">จัดการระบบ</div>
        <nav className="main-nav" aria-label="เมนูหลัก">
          {menuItems.map(({ to, label, icon: Icon, children }) => {
            const isUsersActive =
              Boolean(children) && location.pathname.startsWith(to);
            return children ? (
              <div
                className={`nav-group ${isUsersActive ? "nav-group-open" : ""}`}
                key={to}
              >
                <NavLink
                  className={`nav-item ${isUsersActive ? "nav-item-active" : ""}`}
                  to={to}
                  aria-expanded={isUsersActive}
                  aria-controls="user-submenu"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  <ChevronRight className="nav-chevron" size={15} />
                </NavLink>
                <div
                  className={`nav-submenu-clip ${isUsersActive ? "nav-submenu-clip-open" : ""}`}
                  id="user-submenu"
                  aria-label="หมวดผู้ใช้"
                  aria-hidden={!isUsersActive}
                  inert={!isUsersActive}
                >
                  <div className="nav-submenu">
                    {children.map((child) => (
                      <NavLink
                        className={`nav-subitem ${activeScope === child.scope ? "nav-subitem-active" : ""}`}
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
                key={to}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                <ChevronRight className="nav-chevron" size={15} />
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <p>
            จัดการบัญชี กลุ่ม และสิทธิ์
            <br />
            จากพื้นที่ทำงานเดียว
          </p>
        </div>
      </aside>
    </>
  );
}
