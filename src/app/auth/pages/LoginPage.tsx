import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { useRequestPasswordReset, useSignIn } from "@/hooks/api/auth";
import { Field, useToast } from "@/components/ui";
import { AuthFrame } from "@/app/auth/components/AuthFrame";

const loginSchema = z.object({
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});
type LoginValues = z.infer<typeof loginSchema>;

const emailSchema = z.object({
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
});
type EmailValues = z.infer<typeof emailSchema>;

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });
  const resetForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });
  const signIn = useSignIn();
  const requestReset = useRequestPasswordReset();

  const startLogin = (values: LoginValues) => {
    signIn.mutate(values, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        navigate("/users", { replace: true });
      },
      onError: (error) => {
        const text =
          error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ";
        setFormError(text);
      },
    });
  };

  return (
    <AuthFrame>
      <div className="auth-card">
        <div className="auth-card-icon">
          <KeyRound size={20} />
        </div>
        <div className="eyebrow">ยินดีต้อนรับกลับ</div>
        <h2>เข้าสู่ระบบ</h2>
        <p className="auth-card-lead">
          กรอกข้อมูลบัญชีเจ้าหน้าที่เพื่อดำเนินการต่อ
        </p>
        {params.get("expired") && (
          <div className="notice notice-warning">
            เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง
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
            startLogin(values);
          })}
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                label="อีเมล"
                htmlFor="login-email"
                error={fieldState.error?.message}
              >
                <div className="input-with-icon">
                  <Mail size={17} />
                  <input
                    {...field}
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder="name@company.com"
                    aria-invalid={fieldState.invalid}
                  />
                </div>
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                label="รหัสผ่าน"
                htmlFor="login-password"
                error={fieldState.error?.message}
              >
                <input
                  {...field}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="กรอกรหัสผ่าน"
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />
          <div className="auth-form-meta">
            <button
              type="button"
              className="text-button"
              onClick={() => setForgotOpen(true)}
            >
              ลืมรหัสผ่าน?
            </button>
          </div>
          <button
            className="button button-primary button-full"
            type="submit"
            disabled={!form.formState.isValid || signIn.isPending}
          >
            {signIn.isPending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <div className="auth-card-bottom">
          <span className="security-mini">
            <ShieldCheck size={15} /> ใช้เซสชันที่ปลอดภัย
          </span>
          <span>สำหรับการใช้งานภายใน</span>
        </div>
      </div>

      <div
        className={`auth-modal-scrim ${forgotOpen ? "auth-modal-open" : ""}`}
        aria-hidden={!forgotOpen}
      >
        {forgotOpen && (
          <section
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
          >
            <div className="dialog-header">
              <div>
                <h2 id="forgot-title">รีเซ็ตรหัสผ่าน</h2>
                <p>เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมล</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setForgotOpen(false)}
                aria-label="ปิด"
              >
                <span>×</span>
              </button>
            </div>
            <form
              className="form-stack"
              onSubmit={resetForm.handleSubmit((values) =>
                requestReset.mutate(
                  {
                    email: values.email,
                    redirectTo: `${window.location.origin}/reset-password`,
                  },
                  {
                    onSuccess: () => {
                      setForgotOpen(false);
                      resetForm.reset();
                      showToast(
                        "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งข้อความให้",
                        "success",
                      );
                    },
                  },
                ),
              )}
            >
              <Controller
                name="email"
                control={resetForm.control}
                render={({ field, fieldState }) => (
                  <Field
                    label="อีเมล"
                    htmlFor="reset-email"
                    error={fieldState.error?.message}
                  >
                    <input
                      {...field}
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                    />
                  </Field>
                )}
              />
              {requestReset.error && (
                <div className="notice notice-error" role="alert">
                  {requestReset.error instanceof Error
                    ? requestReset.error.message
                    : "ส่งคำขอไม่สำเร็จ"}
                </div>
              )}
              <div className="dialog-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setForgotOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={
                    !resetForm.formState.isValid || requestReset.isPending
                  }
                >
                  {requestReset.isPending ? "กำลังส่ง…" : "ส่งลิงก์"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </AuthFrame>
  );
}
