import { useEffect } from "react";
import { loadSakuga } from "@/components/ui/SakugaButton";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "@/lib/query-client";
import { router } from "@/routes";
import { ServiceUnavailable } from "@/components/service/ServiceUnavailable";
import { ToastProvider } from "@/components/ui";

type SakugaEffects = {
  at: (element: Element) => { x: number; y: number; w: number; h: number };
  ticks: (x: number, y: number, options: Record<string, number>) => void;
  puff: (x: number, y: number, options: Record<string, number>) => void;
  shards: (x: number, y: number, options: Record<string, number>) => void;
};

function useSakugaInteractions() {
  useEffect(() => {
    let active = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prepareEffects = () => {
      if (!motion.matches) void loadSakuga().catch(() => {});
    };
    prepareEffects();
    motion.addEventListener("change", prepareEffects);
    const onClick = (event: MouseEvent) => {
      if (!active || motion.matches || !(event.target instanceof Element)) return;
      // The custom button already plays its own complete reaction.
      if (event.composedPath().some((node) => node instanceof Element && node.tagName === "SAKUGA-BUTTON")) return;
      const target = event.target.closest("button:not(:disabled), a, input[type=checkbox]:not(:disabled), select:not(:disabled)");
      const fx = (window as Window & { SakugaFX?: SakugaEffects }).SakugaFX;
      if (!target || !fx) return;
      const point = fx.at(target);
      fx.ticks(point.x + point.w / 2 - 3, point.y - point.h / 2, { n: 3, dir: -1, r: 4, len: 12, life: .4 });
      if (target.matches(".button-primary, input[type=checkbox]")) {
        fx.shards(point.x, point.y, { n: 5, speed: 100, size: 5, arc: 6.28, grav: 200, life: .6 });
        fx.puff(point.x, point.y + point.h / 2, { size: 7, n: 3, vy: -12, life: .45 });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      active = false;
      motion.removeEventListener("change", prepareEffects);
      document.removeEventListener("click", onClick);
    };
  }, []);
}

export default function App() {
  useSakugaInteractions();
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        <ServiceUnavailable />
      </ToastProvider>
    </QueryClientProvider>
  );
}
