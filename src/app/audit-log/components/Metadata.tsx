import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function Metadata({ value }: { value: unknown }) {
  const [open, setOpen] = useState(false);
  if (value === undefined || value === null)
    return <span className="text-muted">—</span>;
  let serialized = "";
  try {
    serialized = JSON.stringify(value, null, 2);
  } catch {
    serialized = String(value);
  }
  return (
    <div className="metadata-cell">
      <button
        className="metadata-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}{" "}
        {open ? "ซ่อน metadata" : "ดู metadata"}
      </button>
      {open && <pre className="metadata-value">{serialized}</pre>}
    </div>
  );
}
