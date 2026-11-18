import { createElement, useEffect, useState, type ReactNode } from "react";

let scriptPromise: Promise<void> | undefined;
export function loadSakuga() {
  return scriptPromise ??= new Promise<void>((resolve, reject) => {
    if (customElements.get("sakuga-button")) return resolve();
    const script = document.createElement("script");
    script.src = `${import.meta.env.BASE_URL}sakuga-vfx/button.js`;
    script.onload = () => resolve();
    script.onerror = () => { scriptPromise = undefined; reject(); };
    document.head.appendChild(script);
  });
}

export function SakugaButton({ children, disabled, variant = "primary", full = false }: {
  children: ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  full?: boolean;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;
    const update = () => {
      if (motion.matches) { setReady(false); return; }
      loadSakuga().then(() => { if (active && !motion.matches) setReady(true); }).catch(() => {});
    };
    update();
    motion.addEventListener("change", update);
    return () => { active = false; motion.removeEventListener("change", update); };
  }, []);
  if (!ready) return <button type="submit" disabled={disabled} className={`button button-${variant}${full ? " button-full" : ""}`}>{children}</button>;
  return createElement("sakuga-button", { type: "submit", variant, disabled, className: full ? "sakuga-full" : undefined }, children);
}
