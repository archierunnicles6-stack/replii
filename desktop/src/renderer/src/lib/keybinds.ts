/** Modifier label for keyboard shortcuts (Mac vs Windows/Linux). */
export function shortcutModLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘" : "Ctrl";
}

export const OVERLAY_KEYBINDS = [
  { keys: (mod: string) => `${mod} Enter`, description: "Ask AI / Assist" },
  { keys: (mod: string) => `${mod} R`, description: "Clear session context" },
  { keys: (mod: string) => `${mod} ← →`, description: "Move overlay" },
  { keys: (mod: string) => `${mod} \\`, description: "Hide / show overlay" },
] as const;
