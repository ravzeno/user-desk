import userDeskMark from "@/assets/user-desk-mark.svg";
import type { ReactNode } from "react";

export function AuthFrame({
  children,
  label = "จัดการบัญชีผู้ใช้ กลุ่ม และสิทธิ์",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <main className="auth-background">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
      <div className="auth-shell">
        <section className="auth-intro">
          <div className="brand-lockup auth-brand">
            <img className="brand-mark" src={userDeskMark} alt="" />
            <div>
              <strong>User Desk</strong>
              <span>ACCOUNT MANAGEMENT</span>
            </div>
          </div>
          <div className="auth-intro-copy">
            <div className="eyebrow light-eyebrow">
              พื้นที่สำหรับเจ้าหน้าที่
            </div>
            <h1>
              จัดการบัญชี
              <br />
              <span>และสิทธิ์ผู้ใช้</span>
            </h1>
            <p>{label}</p>
          </div>
        </section>
        <section className="auth-card-wrap">{children}</section>
      </div>
    </main>
  );
}
