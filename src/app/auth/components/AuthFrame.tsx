import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

export function AuthFrame({
  children,
  label = "ระบบจัดการบัญชีผู้ใช้",
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
            <div className="brand-mark">U</div>
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
              ดูแลบัญชี
              <br />
              <span>อย่างมั่นใจ</span>
            </h1>
            <p>{label} สำหรับผู้ดูแลระบบและเจ้าหน้าที่ที่ได้รับอนุญาต</p>
          </div>
          <div className="auth-security">
            <ShieldCheck size={18} />
            <span>การเข้าถึงได้รับการตรวจสอบโดยระบบทุกครั้ง</span>
          </div>
        </section>
        <section className="auth-card-wrap">{children}</section>
      </div>
    </main>
  );
}
