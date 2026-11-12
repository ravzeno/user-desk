import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { AuthFrame } from "@/app/auth/components/AuthFrame";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const invalid = Boolean(params.get("error"));
  return (
    <AuthFrame label="ยืนยันอีเมลเพื่อดูแลบัญชีได้อย่างปลอดภัย">
      <div className="auth-card verify-card">
        <div
          className={`auth-card-icon ${invalid ? "icon-warning" : "icon-success"}`}
        >
          {invalid ? <Mail size={20} /> : <CheckCircle2 size={22} />}
        </div>
        <div className="eyebrow">การยืนยันอีเมล</div>
        <h2>{invalid ? "ลิงก์ไม่ถูกต้อง" : "ยืนยันอีเมลแล้ว"}</h2>
        <p className="auth-card-lead">
          {invalid
            ? "ลิงก์อาจหมดอายุหรือถูกใช้งานไปแล้ว กรุณาขอลิงก์ยืนยันใหม่จากเจ้าหน้าที่"
            : "ขอบคุณที่ยืนยันอีเมล บัญชีของคุณพร้อมสำหรับการใช้งาน"}
        </p>
        <Link
          className="button button-primary button-full button-link"
          to="/login"
        >
          กลับไปเข้าสู่ระบบ <span>→</span>
        </Link>
      </div>
    </AuthFrame>
  );
}
