import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, ChevronDown, X } from "lucide-react";
import { AvatarCropDialog } from "@/components/sidebar/AvatarCropDialog";
import { UserAvatar } from "@/app/user/components/UserIdentity";
import { useSignOut, useUpdateMyProfile, useUploadMyAvatar } from "@/hooks/api/auth";
import { clearExpiredSessionState } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/type/user";
import { useToast } from "@/components/ui";

export function AccountMenu({ user, collapsed, onExpand }: { user: CurrentUser; collapsed: boolean; onExpand: () => void }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phoneNumber || "");
  const menuRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logout = useSignOut();
  const upload = useUploadMyAvatar();
  const update = useUpdateMyProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", dismiss); document.removeEventListener("keydown", escape); };
  }, [open]);
  useEffect(() => {
    if (profileOpen) { setName(user.name || ""); setPhone(user.phoneNumber || ""); dialogRef.current?.showModal(); }
  }, [profileOpen]);
  const closeProfile = () => { dialogRef.current?.close(); setProfileOpen(false); setEditing(false); };
  const cancelEdit = () => { setName(user.name || ""); setPhone(user.phoneNumber || ""); setEditing(false); };
  const error = (err: unknown) => showToast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง", "error");

  return <>
    <div className="account-menu" ref={menuRef}>
      {open && <div className="account-popover">
        <div className="account-popover-identity"><UserAvatar name={user.name || user.email} image={user.image} /><div><strong>{user.name || user.email}</strong><span>{user.email}</span></div></div>
        <button type="button" onClick={() => { setOpen(false); setProfileOpen(true); }}>บัญชีของฉัน</button>
        <button type="button" disabled={logout.isPending} onClick={() => logout.mutate(undefined, { onSuccess: () => { queryClient.clear(); clearExpiredSessionState(); navigate("/login", { replace: true }); }, onError: error })}>{logout.isPending ? "กำลังออก…" : "ออกจากระบบ"}</button>
      </div>}
      <button className="account-trigger" type="button" aria-label="เมนูบัญชี" aria-expanded={open} onClick={() => { if (collapsed) onExpand(); setOpen(!open); }}>
        <UserAvatar name={user.name || user.email} image={user.image} /><span>{user.name || user.email}</span><ChevronDown size={16} />
      </button>
    </div>
    {profileOpen && <dialog ref={dialogRef} className="my-profile-dialog" aria-labelledby="my-profile-title" onCancel={(event) => { event.preventDefault(); closeProfile(); }} onClick={(event) => { if (event.target === event.currentTarget) closeProfile(); }}>
      <div className="my-profile-heading"><h2 id="my-profile-title">บัญชีของฉัน</h2><button className="icon-button" type="button" onClick={closeProfile} aria-label="ปิด"><X size={20} /></button></div>
      <div className="my-profile-hero"><div className="my-profile-avatar"><UserAvatar name={user.name || user.email} image={user.image} large />{editing && <button type="button" aria-label="เปลี่ยนรูปโปรไฟล์" title="เปลี่ยนรูปโปรไฟล์" disabled={upload.isPending} onClick={() => inputRef.current?.click()}><Camera size={17} /></button>}</div><strong>{user.name || user.email}</strong><span>{user.email}</span></div>
      <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" tabIndex={-1} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { showToast("เลือกรูป JPEG, PNG หรือ WebP ขนาดไม่เกิน 5 MB", "error"); return; } setCropFile(file); }} />
      {!editing ? <div className="my-profile-form">
        <dl className="my-profile-details"><div><dt>ชื่อ-นามสกุล</dt><dd>{user.name || "–"}</dd></div><div><dt>อีเมล</dt><dd>{user.email}</dd></div><div><dt>เบอร์โทรศัพท์</dt><dd>{user.phoneNumber || "–"}</dd></div></dl>
        <div className="my-profile-actions"><button className="button button-primary" type="button" onClick={() => setEditing(true)}>แก้ไขข้อมูล</button></div>
      </div> : <form className="my-profile-form" onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; update.mutate({ name: name.trim(), phoneNumber: phone.trim() || null }, { onSuccess: () => { showToast("บันทึกข้อมูลส่วนตัวแล้ว", "success"); closeProfile(); }, onError: error }); }}>
        <label>ชื่อ-นามสกุล<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={200} /></label>
        <label>อีเมล<input value={user.email} readOnly /></label>
        <label>เบอร์โทรศัพท์<input value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={32} type="tel" /></label>
        <div className="my-profile-actions"><button className="button button-secondary" type="button" onClick={cancelEdit}>ยกเลิก</button><button className="button button-primary" type="submit" disabled={update.isPending || !name.trim()}>{update.isPending ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}</button></div>
      </form>}
    </dialog>}
    {cropFile && <AvatarCropDialog file={cropFile} onCancel={() => setCropFile(null)} onConfirm={(file) => { setCropFile(null); upload.mutate(file, { onSuccess: () => showToast("เปลี่ยนรูปโปรไฟล์แล้ว", "success"), onError: error }); }} />}
  </>;
}
