import { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

const SIZE = 240;
const OUTPUT = 512;

export function AvatarCropDialog({ file, onCancel, onConfirm }: { file: File; onCancel: () => void; onConfirm: (file: File) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const [url, setUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { const objectUrl = URL.createObjectURL(file); setUrl(objectUrl); dialog.current?.showModal(); return () => { URL.revokeObjectURL(objectUrl); }; }, [file]);
  const base = dimensions.width && dimensions.height ? Math.max(SIZE / dimensions.width, SIZE / dimensions.height) : 0;
  const scale = base * zoom;
  const maxX = Math.max(0, (dimensions.width * scale - SIZE) / 2);
  const maxY = Math.max(0, (dimensions.height * scale - SIZE) / 2);
  const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));
  const x = clamp(position.x, maxX);
  const y = clamp(position.y, maxY);
  const confirm = () => {
    if (!image.current || !scale || saving) return;
    setSaving(true);
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT; canvas.height = OUTPUT;
    const context = canvas.getContext("2d");
    if (!context) { setError("ไม่สามารถจัดรูปได้ กรุณาลองอีกครั้ง"); setSaving(false); return; }
    const factor = OUTPUT / SIZE;
    context.drawImage(image.current, ((SIZE - dimensions.width * scale) / 2 + x) * factor, ((SIZE - dimensions.height * scale) / 2 + y) * factor, dimensions.width * scale * factor, dimensions.height * scale * factor);
    canvas.toBlob((blob) => {
      if (!blob) { setError("ไม่สามารถจัดรูปได้ กรุณาลองอีกครั้ง"); setSaving(false); return; }
      onConfirm(new File([blob], "avatar.png", { type: "image/png" }));
    }, "image/png");
  };
  return <dialog ref={dialog} className="avatar-crop-dialog" aria-labelledby="avatar-crop-title" onCancel={(event) => { event.preventDefault(); onCancel(); }}>
    <header><h2 id="avatar-crop-title">แก้ไขรูปโปรไฟล์</h2><button type="button" className="icon-button" aria-label="ปิด" onClick={onCancel}><X size={20} /></button></header>
    <p>ลากรูปเพื่อจัดตำแหน่ง แล้วปรับขนาดตามต้องการ</p>
    <div className="avatar-crop-stage" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, startX: x, startY: y }; }} onPointerMove={(event) => { if (!drag.current) return; setPosition({ x: clamp(drag.current.startX + event.clientX - drag.current.x, maxX), y: clamp(drag.current.startY + event.clientY - drag.current.y, maxY) }); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {url && <img ref={image} src={url} alt="" draggable={false} onLoad={(event) => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setError("เปิดไฟล์รูปไม่ได้ กรุณาเลือกไฟล์อื่น")} style={{ width: dimensions.width * scale, height: dimensions.height * scale, transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }} />}
      <div className="avatar-crop-mask" aria-hidden="true" />
    </div>
    <div className="avatar-crop-zoom"><ZoomOut size={19} aria-hidden="true" /><input type="range" min="1" max="3" step="0.01" value={zoom} aria-label="ขนาดรูป" onChange={(event) => setZoom(Number(event.target.value))} /><ZoomIn size={19} aria-hidden="true" /></div>
    {error && <p role="alert" className="avatar-crop-error">{error}</p>}
    <footer><button type="button" className="button button-secondary" onClick={onCancel}>ยกเลิก</button><button type="button" className="button button-primary" disabled={!scale || !!error || saving} onClick={confirm}>{saving ? "กำลังเตรียมรูป…" : "ยืนยัน"}</button></footer>
  </dialog>;
}
