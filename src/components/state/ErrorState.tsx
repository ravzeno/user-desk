import { AlertCircle } from "lucide-react";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-panel error-state" role="alert">
      <span className="state-icon">
        <AlertCircle size={20} />
      </span>
      <div>
        <strong>โหลดข้อมูลไม่สำเร็จ</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button
          className="button button-secondary button-small"
          onClick={onRetry}
        >
          ลองอีกครั้ง
        </button>
      )}
    </div>
  );
}
