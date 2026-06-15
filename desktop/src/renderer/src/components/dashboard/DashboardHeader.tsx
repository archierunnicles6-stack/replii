import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { SALES_MODES, salesModeShortLabel, type SalesMode } from "../../store/types";

function ModeDropdown({
  activeMode,
  onSelect,
}: {
  activeMode: SalesMode;
  onSelect: (mode: SalesMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-8 min-w-[108px] items-center justify-between gap-6 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        <span>{salesModeShortLabel(activeMode)}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[200px] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
          {SALES_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                onSelect(mode.id);
                setOpen(false);
              }}
              className={`flex w-full flex-col px-3.5 py-2.5 text-left transition-colors hover:bg-zinc-50 ${
                activeMode === mode.id ? "bg-blue-50/60" : ""
              }`}
            >
              <span className="text-[13px] font-medium text-zinc-900">
                {salesModeShortLabel(mode.id)}
              </span>
              <span className="mt-0.5 text-[11px] leading-snug text-zinc-500">
                {mode.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardHeader({
  onStartSession,
  onRequestUpgrade,
  canStartSession = true,
  sessionActive = false,
  sessionsRemaining,
  isPaid = false,
}: {
  onStartSession: () => void;
  onRequestUpgrade: () => void;
  canStartSession?: boolean;
  sessionActive?: boolean;
  sessionsRemaining?: number;
  isPaid?: boolean;
}) {
  const { activeMode, setActiveMode } = useAppStore();

  return (
    <div className="no-drag shrink-0 border-b border-zinc-100 bg-white px-8 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <h1 className="shrink-0 text-[20px] font-semibold tracking-tight text-zinc-900">
            Ghost
          </h1>

          <ModeDropdown activeMode={activeMode} onSelect={setActiveMode} />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {!isPaid && sessionsRemaining !== undefined && (
            <span className="hidden text-[12px] text-zinc-500 sm:inline">
              {canStartSession
                ? `${sessionsRemaining} free session${sessionsRemaining === 1 ? "" : "s"} left`
                : "Free limit reached"}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (sessionActive) {
                onStartSession();
                return;
              }
              if (!canStartSession) {
                onRequestUpgrade();
                return;
              }
              onStartSession();
            }}
            title={
              sessionActive
                ? "Session active — click to show overlay"
                : canStartSession
                  ? "Start Ghost"
                  : "Upgrade to start more sessions on the free plan"
            }
            className="flex h-9 items-center gap-2 rounded-full bg-gradient-to-b from-[#4d9cf8] to-[#3b82f6] px-4 text-[13px] font-medium text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
            {sessionActive ? "Session active" : "Start Ghost"}
          </button>
        </div>
      </div>
    </div>
  );
}
