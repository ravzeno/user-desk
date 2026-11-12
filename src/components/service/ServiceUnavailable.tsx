import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Unplug } from "lucide-react";
import { request } from "@/lib/api/client";

export function ServiceUnavailable() {
  const [unavailable, setUnavailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const queryClient = useQueryClient();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (unavailable) dialog.current?.showModal(); }, [unavailable]);
  useEffect(() => {
    const onUnavailable = () => setUnavailable(true);
    window.addEventListener("userdesk:service-unavailable", onUnavailable);
    return () => window.removeEventListener("userdesk:service-unavailable", onUnavailable);
  }, []);
  const retry = async () => {
    setChecking(true);
    setRetryFailed(false);
    try {
      const result = await request<{ status?: string }>("/health", { cache: "no-store", signal: AbortSignal.timeout(8000) }, false);
      if (result?.status !== "ok") throw new Error("Service unavailable");
      setUnavailable(false);
      void queryClient.invalidateQueries();
    } catch {
      setRetryFailed(true);
      setUnavailable(true);
    } finally {
      setChecking(false);
    }
  };
  if (!unavailable) return null;
  return <dialog ref={dialog} className="service-unavailable" aria-labelledby="service-unavailable-title" onCancel={(event) => event.preventDefault()}>
    <header className="service-unavailable-header">
      <div className="service-unavailable-brand"><span>U</span><strong>User Desk</strong></div>
    </header>
    <section className="service-unavailable-content">
      <div className="service-unavailable-icon"><Unplug size={22} strokeWidth={1.8} aria-hidden="true" /></div>
      <div className="service-unavailable-copy">
        <h1 id="service-unavailable-title">เชื่อมต่อระบบไม่ได้</h1>
        <p>ไม่สามารถติดต่อบริการได้ในขณะนี้ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง</p>
        <button type="button" className="button button-primary service-retry" onClick={() => void retry()} disabled={checking}>
          <RefreshCw size={16} /> {checking ? "กำลังตรวจสอบ…" : "ลองอีกครั้ง"}
        </button>
        {retryFailed && <p className="service-retry-message" role="status">ยังเชื่อมต่อไม่ได้ กรุณารอสักครู่แล้วลองใหม่</p>}
        <div className="service-unavailable-help">หากยังพบปัญหา โปรดติดต่อผู้ดูแลระบบ</div>
      </div>
    </section>
  </dialog>;
}
