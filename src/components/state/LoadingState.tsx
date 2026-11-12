import { LoaderCircle } from "lucide-react";

export function LoadingState({
  label = "กำลังโหลดข้อมูล",
}: {
  label?: string;
}) {
  return (
    <div className="state-panel loading-state" role="status">
      <LoaderCircle className="spin" size={21} />
      <span>{label}</span>
    </div>
  );
}
