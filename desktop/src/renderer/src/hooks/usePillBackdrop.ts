import type { CSSProperties } from "react";
import { useEffect, useState, type RefObject } from "react";

export type PillTheme = "light" | "dark";

export interface PillThemeStyles {
  theme: PillTheme;
  glass: CSSProperties;
  status: string;
  transcript: string;
  transcriptMuted: string;
  label: string;
  body: string;
  edgeFade: string;
}

const LIGHT: PillThemeStyles = {
  theme: "light",
  glass: {
    backdropFilter: "blur(48px) saturate(180%)",
    WebkitBackdropFilter: "blur(48px) saturate(180%)",
    background: "rgba(255,255,255,0.32)",
    border: "1px solid rgba(255,255,255,0.55)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.65)",
  },
  status: "text-zinc-900",
  transcript: "text-zinc-600",
  transcriptMuted: "text-zinc-400",
  label: "text-zinc-600",
  body: "text-zinc-900",
  edgeFade: "linear-gradient(to right, rgba(255,255,255,0.85) 0%, transparent 100%)",
};

const DARK: PillThemeStyles = {
  theme: "dark",
  glass: {
    backdropFilter: "blur(48px) saturate(160%)",
    WebkitBackdropFilter: "blur(48px) saturate(160%)",
    background: "rgba(12,12,16,0.62)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  status: "text-white",
  transcript: "text-white/75",
  transcriptMuted: "text-white/45",
  label: "text-white/55",
  body: "text-white/90",
  edgeFade: "linear-gradient(to right, rgba(12,12,16,0.9) 0%, transparent 100%)",
};

export function usePillBackdrop(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
): PillThemeStyles {
  const [theme, setTheme] = useState<PillTheme>("light");

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const sample = async () => {
      const el = ref.current;
      if (!el || !window.ghost?.sampleBackdrop) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      try {
        const result = await window.ghost.sampleBackdrop({
          x: Math.round(rect.left + rect.width * 0.35),
          y: Math.round(rect.top + rect.height / 2),
          width: Math.round(rect.width * 0.5),
          height: Math.round(rect.height),
        });
        if (!cancelled && result) {
          setTheme(result.isDark ? "dark" : "light");
        }
      } catch {
        // keep current theme
      }
    };

    void sample();
    const id = window.setInterval(() => void sample(), 1200);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [active, ref]);

  return theme === "dark" ? DARK : LIGHT;
}
