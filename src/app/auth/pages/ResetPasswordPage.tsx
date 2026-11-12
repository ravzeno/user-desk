import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound } from "lucide-react";
import { z } from "zod";
import { useResetPassword } from "@/hooks/api/auth";
import { Field } from "@/components/ui";
import { AuthFrame } from "@/app/auth/components/AuthFrame";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(12, "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร")
      .max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร"),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });
type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");
  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const reset = useResetPassword();

  return (
    <AuthFrame label="ตั้งรหัสผ่านใหม่เพื่อกลับเข้าใช้งาน User Desk">
      <div className="auth-card">
        <div className="auth-card-icon">
          <KeyRound size={20} />
        </div>
        {done ? (
          <>
            <div className="eyebrow">เรียบร้อยแล้ว</div>
            <h2>ตั้งรหัสผ่านสำเร็จ</h2>
            <p className="auth-card-lead">
              คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
            </p>
            <button
              className="button button-primary button-full"
              onClick={() => navigate("/login", { replace: true })}
            >
              กลับไปเข้าสู่ระบบ <span>→</span>
            </button>
          </>
        ) : (
          <>
            <div className="eyebrow">ตั้งค่าความปลอดภัย</div>
            <h2>รหัสผ่านใหม่</h2>
            <p className="auth-card-lead">
              รหัสผ่านต้องมีความยาว 12–128 ตัวอักษร
            </p>
            {!token && (
              <div className="notice notice-error">
                ลิงก์นี้ไม่มี token หรือไม่ถูกต้อง{" "}
                <Link to="/login">ขอลิงก์ใหม่</Link>
              </div>
            )}
            {formError && (
              <div className="notice notice-error" role="alert">
                {formError}
              </div>
            )}
            <form
              className="form-stack"
              onSubmit={form.handleSubmit((values) => {
                setFormError("");
                reset.mutate(
                  { token, newPassword: values.password },
                  {
                    onSuccess: () => setDone(true),
                    onError: (error) =>
                      setFormError(
                        error instanceof Error
                          ? error.message
                          : "รีเซ็ตรหัสผ่านไม่สำเร็จ",
                      ),
                  },
                );
              })}
            >
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    label="รหัสผ่านใหม่"
                    htmlFor="new-password"
                    error={fieldState.error?.message}
                  >
                    <input
                      {...field}
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="อย่างน้อย 12 ตัวอักษร"
                    />
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    label="ยืนยันรหัสผ่าน"
                    htmlFor="confirm-password"
                    error={fieldState.error?.message}
                  >
                    <input
                      {...field}
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                    />
                  </Field>
                )}
              />
              <button
                className="button button-primary button-full"
                type="submit"
                disabled={!token || !form.formState.isValid || reset.isPending}
              >
                {reset.isPending ? "กำลังบันทึก…" : "บันทึกรหัสผ่านใหม่"}
              </button>
            </form>
            <Link className="back-link" to="/login">
              <ArrowLeft size={15} /> กลับหน้าเข้าสู่ระบบ
            </Link>
          </>
        )}
      </div>
    </AuthFrame>
  );
}
