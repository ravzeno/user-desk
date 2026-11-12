import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  X,
} from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface ToastMessage {
  id: number;
  text: string;
  kind: ToastKind;
}
interface ToastContextValue {
  showToast: (text: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const value = useMemo(
    () => ({
      showToast: (text: string, kind: ToastKind = "info") => {
        const id = Date.now() + Math.random();
        setMessages((current) => [...current, { id, text, kind }]);
        window.setTimeout(
          () =>
            setMessages((current) => current.filter((item) => item.id !== id)),
          4200,
        );
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => (
          <div
            className={`toast toast-${message.kind}`}
            key={message.id}
            role={message.kind === "error" ? "alert" : "status"}
          >
            <span className="toast-mark">
              {message.kind === "success" ? (
                <Check size={17} />
              ) : (
                <AlertCircle size={17} />
              )}
            </span>
            <span>{message.text}</span>
            <button
              className="icon-button toast-close"
              onClick={() =>
                setMessages((current) =>
                  current.filter((item) => item.id !== message.id),
                )
              }
              aria-label="ปิดการแจ้งเตือน"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-heading-actions">{actions}</div>}
    </div>
  );
}

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  size = "medium",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "medium" | "large";
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`dialog-card dialog-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-header">
          <div>
            <h2 id="dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "ยืนยัน",
  destructive = false,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
    >
      <div className="dialog-footer">
        <button
          className="button button-secondary"
          onClick={onCancel}
          disabled={busy}
        >
          ยกเลิก
        </button>
        <button
          className={`button ${destructive ? "button-danger" : "button-primary"}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy && <LoaderCircle className="spin" size={16} />}
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

export function Pagination({
  page,
  limit,
  total,
  onPage,
  onLimit,
}: {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="pagination">
      <div className="pagination-summary">
        แสดง {start.toLocaleString("th-TH")}–{end.toLocaleString("th-TH")} จาก{" "}
        {total.toLocaleString("th-TH")} รายการ
      </div>
      <div className="pagination-controls">
        <label className="limit-control">
          ต่อหน้า
          <select
            value={limit}
            onChange={(event) => onLimit(Number(event.target.value))}
            aria-label="จำนวนรายการต่อหน้า"
          >
            {[10, 20, 50, 100].map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          className="icon-button page-button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="หน้าก่อน"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="page-number">
          {page} / {pages}
        </span>
        <button
          className="icon-button page-button"
          onClick={() => onPage(Math.min(pages, page + 1))}
          disabled={page >= pages}
          aria-label="หน้าถัดไป"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function SearchForm({
  value,
  onSubmit,
  placeholder = "ค้นหา",
  buttonLabel = "ค้นหา",
}: {
  value: string;
  onSubmit: (q: string) => void;
  placeholder?: string;
  buttonLabel?: string;
}) {
  const [query, setQuery] = useState(value);
  useEffect(() => setQuery(value), [value]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(query);
  };
  return (
    <form className="search-form" onSubmit={submit} role="search">
      <input
        aria-label={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
      <button className="button button-secondary" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getErrorMessage(
  error: unknown,
  fallback = "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
) {
  if (error instanceof Error) return error.message;
  return fallback;
}
