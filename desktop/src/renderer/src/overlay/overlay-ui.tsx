import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import ghostLogo from "../assets/ghost-logo.png";
import type { QuickAction } from "../services/ai";
import { useStreamingDisplayText } from "../hooks/useStreamingDisplayText";
import type { PillThemeStyles } from "../hooks/usePillBackdrop";

export { pickAutoAction } from "../services/transcript";
export type { PillThemeStyles } from "../hooks/usePillBackdrop";

export const QUICK_ACTIONS: {
  id: QuickAction;
  label: string;
  shortLabel: string;
  icon: "sparkle" | "wand" | "chat" | "recap";
}[] = [
  { id: "assist", label: "Assist", shortLabel: "Assist", icon: "sparkle" },
  { id: "say", label: "What should I say?", shortLabel: "Say", icon: "wand" },
  { id: "followup", label: "Follow-up", shortLabel: "Follow-up", icon: "chat" },
  { id: "recap", label: "Recap", shortLabel: "Recap", icon: "recap" },
];

export function ActionIcon({ type }: { type: (typeof QUICK_ACTIONS)[number]["icon"] }) {
  if (type === "sparkle") {
    return (
      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
      </svg>
    );
  }
  if (type === "wand") {
    return (
      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M15 4l5 5M9.5 6.5L4 12l8 8 5.5-5.5M14 5l5 5" />
      </svg>
    );
  }
  if (type === "chat") {
    return (
      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    );
  }
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export function GhostMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <img
      src={ghostLogo}
      alt=""
      aria-hidden
      draggable={false}
      className={`${className} object-contain`}
    />
  );
}

function LiveTranscriptStrip({
  text,
  listening,
  hearingAudio,
  isStreaming = false,
  theme,
}: {
  text: string;
  listening: boolean;
  hearingAudio?: boolean;
  isStreaming?: boolean;
  theme: PillThemeStyles;
}) {
  const streamed = useStreamingDisplayText(text, isStreaming && !!text);
  const display =
    streamed ||
    (listening && hearingAudio ? "…" : listening ? "Speak now" : "");

  const isPlaceholder = !text || display === "Speak now" || display === "…";
  const textClass = isPlaceholder
    ? hearingAudio
      ? theme.transcriptMuted
      : theme.transcriptMuted
    : theme.transcript;

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden pl-2">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8"
        style={{ background: theme.edgeFade }}
      />
      <p
        className={`truncate whitespace-nowrap text-[14px] font-medium leading-snug ${textClass}`}
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 24px, black 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 24px, black 100%)",
        }}
      >
        {display}
        {isStreaming && text && streamed !== text ? (
          <span className="ml-0.5 inline-block h-[14px] w-[2px] animate-pulse bg-current opacity-60" />
        ) : null}
      </p>
    </div>
  );
}

export function ListeningPill({
  listening,
  error,
  liveText,
  isStreaming = false,
  hearingAudio = false,
  hasMic = false,
  hasSystemAudio = false,
  isDemo = false,
  aiReady = false,
  pillTheme,
}: {
  listening: boolean;
  error?: string | null;
  liveText?: string;
  isStreaming?: boolean;
  hearingAudio?: boolean;
  hasMic?: boolean;
  hasSystemAudio?: boolean;
  isDemo?: boolean;
  aiReady?: boolean;
  pillTheme: PillThemeStyles;
}) {
  const [micAppName, setMicAppName] = useState("Electron");

  useEffect(() => {
    void window.ghost?.getMicAppName?.().then((name) => {
      if (name) setMicAppName(name);
    });
  }, []);

  const statusText = (() => {
    if (error === "mic-optional") return "Listening to call…";
    if (error === "screen-blocked") return "Screen blocked";
    if (error) return "Mic blocked";
    if (!listening) return "Paused";
    if (isDemo) return "Demo call…";
    if (hasSystemAudio && hasMic) return "Listening to call…";
    if (hasSystemAudio) return "Listening to call…";
    if (!hasMic && aiReady) return "Connecting audio…";
    return "Listening…";
  })();

  return (
    <div className="drag-region overflow-hidden rounded-full" style={pillTheme.glass}>
      <div className="flex min-w-[340px] max-w-[520px] items-center gap-3 px-3.5 py-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${hearingAudio && listening && (!error || error === "mic-optional") ? "animate-pulse-glow" : ""}`}
          style={{
            background:
              error && error !== "mic-optional"
                ? "rgba(220,38,38,0.9)"
                : "rgba(0,0,0,0.86)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 10px rgba(0,0,0,0.22)",
          }}
        >
          <GhostMark className="h-4 w-4" />
        </div>

        <span className={`shrink-0 text-[15px] font-semibold tracking-tight ${pillTheme.status}`}>
          {statusText}
        </span>

        <LiveTranscriptStrip
          text={liveText?.trim() ?? ""}
          listening={listening && (!error || error === "mic-optional")}
          hearingAudio={hearingAudio}
          isStreaming={isStreaming}
          theme={pillTheme}
        />
      </div>

      {error === "mic-optional" && (
        <div className="no-drag flex flex-wrap gap-2 px-4 pb-2.5">
          <p className="text-[11px] leading-snug text-amber-700">
            Call audio active. Enable <span className="font-semibold">{micAppName}</span> mic for your voice too.
          </p>
          <button
            type="button"
            onClick={() => void window.ghost?.showMicHelper?.()}
            className="shrink-0 rounded-full border border-amber-400 px-2.5 py-1 text-[10px] font-semibold text-amber-900 hover:bg-amber-50"
          >
            Enable mic
          </button>
        </div>
      )}

      {error && error !== "mic-optional" && (
        <div className="no-drag flex flex-col gap-2 px-4 pb-2.5">
          <p className="text-[11px] leading-snug text-red-600">
            {error === "screen-blocked" ? (
              <>
                Allow <span className="font-semibold">Ghost</span> in System Settings → Privacy → Screen
                Recording, then start a session and share your screen or call window when macOS prompts.
              </>
            ) : (
              <>
                System Settings → Privacy &amp; Security → Microphone → turn on{" "}
                <span className="font-semibold">{micAppName}</span>, then click Fix mic.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void window.ghost?.openPermissionSettings?.(
                  error === "screen-blocked" ? "screen" : "microphone",
                )
              }
              className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-700"
            >
              Open Settings
            </button>
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  await window.ghost?.ensureMicrophone?.();
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach((t) => t.stop());
                  } catch {
                    void window.ghost?.showMicHelper?.();
                  }
                })();
              }}
              className="shrink-0 rounded-full border border-red-300 px-2.5 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-50"
            >
              Fix mic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Suggestion pill — sits directly below listening pill ───────────────────

export function getSuggestionReadDurationMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minMs = 4500;
  const maxMs = 14000;
  const perWordMs = 380;
  return Math.min(maxMs, Math.max(minMs, 2800 + words * perWordMs));
}

export function SuggestionPill({
  suggestion,
  loading,
  visible = true,
  dealHealth,
  pillTheme,
}: {
  suggestion: string;
  loading: boolean;
  visible?: boolean;
  dealHealth?: number | null;
  pillTheme: PillThemeStyles;
}) {
  const streamed = useStreamingDisplayText(suggestion, loading && !!suggestion);
  const healthColor =
    dealHealth == null
      ? pillTheme.label
      : dealHealth >= 70
        ? pillTheme.theme === "dark"
          ? "text-emerald-300"
          : "text-emerald-700"
        : dealHealth >= 45
          ? pillTheme.theme === "dark"
            ? "text-amber-300"
            : "text-amber-700"
          : pillTheme.theme === "dark"
            ? "text-red-300"
            : "text-red-700";

  return (
    <div
      className={`no-drag w-full overflow-hidden rounded-2xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
      }`}
      style={pillTheme.glass}
    >
      <div className="px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className={`text-[11px] font-medium ${pillTheme.label}`}>Suggestion</p>
          {dealHealth != null && !loading ? (
            <p className={`text-[11px] font-semibold ${healthColor}`}>
              Deal health {dealHealth}
            </p>
          ) : null}
        </div>

        {loading && !suggestion ? (
          <div className="flex items-center gap-2">
            <span className={`inline-block h-1.5 w-1.5 animate-pulse rounded-full ${pillTheme.theme === "dark" ? "bg-white/50" : "bg-zinc-500"}`} />
            <span className={`text-[14px] ${pillTheme.body}`}>Thinking…</span>
          </div>
        ) : (
          <p className={`whitespace-pre-wrap text-[15px] font-medium leading-relaxed ${pillTheme.body}`}>
            {streamed || suggestion}
            {loading && suggestion ? (
              <span className={`ml-0.5 inline-block h-4 w-[2px] animate-pulse ${pillTheme.theme === "dark" ? "bg-white/70" : "bg-zinc-700"}`} />
            ) : null}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Bottom control bar — mic | Ghost logo | play/pause ─────────────────────

function SideIconButton({
  title,
  onClick,
  children,
  bg,
  border,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  bg?: string;
  border?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="no-drag flex shrink-0 items-center justify-center rounded-full transition-all hover:bg-white/70 active:scale-95"
      style={{
        height: 44,
        width: 44,
        background: bg ?? "rgba(255,255,255,0.55)",
        border: border ?? "1.5px solid rgba(0,0,0,0.10)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
    >
      {children}
    </button>
  );
}

export function ControlButtons({
  onAssist,
  onTestAi,
  onMock,
  showTestAi = false,
  showMock = false,
  listening,
  onToggleListening,
  onEndSession,
  pillTheme,
}: {
  onAssist: () => void;
  onTestAi?: () => void;
  onMock?: () => void;
  showTestAi?: boolean;
  showMock?: boolean;
  listening: boolean;
  onToggleListening: () => void;
  onEndSession: () => void;
  pillTheme: PillThemeStyles;
}) {
  const iconClass = pillTheme.theme === "dark" ? "text-white/90" : "text-zinc-800";
  const sideBg =
    pillTheme.theme === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.55)";
  const sideBorder =
    pillTheme.theme === "dark" ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid rgba(0,0,0,0.10)";
  return (
    <div className="flex flex-col items-center gap-2">
      {(showMock || showTestAi) && (
        <div className="flex gap-2">
          {showMock && onMock ? (
            <button
              type="button"
              onClick={onMock}
              className="no-drag rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[11px] font-semibold text-yellow-900 hover:bg-yellow-100"
            >
              🎭 Mock
            </button>
          ) : null}
          {showTestAi && onTestAi ? (
            <button
              type="button"
              onClick={onTestAi}
              className="no-drag rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-800 hover:bg-violet-100"
            >
              Test AI
            </button>
          ) : null}
        </div>
      )}
      <div
        className="no-drag shrink-0 rounded-full"
        style={{
          minWidth: 320,
          ...pillTheme.glass,
        }}
      >
      <div className="flex items-center justify-between gap-4 px-5 py-2">
        <SideIconButton title="End session" onClick={onEndSession} bg={sideBg} border={sideBorder}>
          <svg
            className={`h-[18px] w-[18px] ${iconClass}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>
        </SideIconButton>

        <div
          className="no-drag shrink-0 rounded-full p-[3px]"
          style={{ border: "1.5px solid rgba(255,255,255,0.55)" }}
        >
          <button
            type="button"
            onClick={onAssist}
            title="Get AI suggestion"
            className="flex items-center justify-center rounded-full transition-all hover:scale-[1.03] active:scale-95"
            style={{
              height: 48,
              width: 48,
              background: "rgba(0,0,0,0.86)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 14px rgba(0,0,0,0.30)",
            }}
          >
            <GhostMark className="h-5 w-5" />
          </button>
        </div>

        <SideIconButton
          title={listening ? "Pause listening" : "Resume listening"}
          onClick={onToggleListening}
          bg={sideBg}
          border={sideBorder}
        >
          {listening ? (
            <svg className={`h-[18px] w-[18px] ${iconClass}`} viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="4.5" height="14" rx="1" />
            </svg>
          ) : (
            <svg
              className={`h-[18px] w-[18px] translate-x-[1px] ${iconClass}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
            </svg>
          )}
        </SideIconButton>
      </div>
    </div>
    </div>
  );
}

export function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex min-w-[18px] items-center justify-center rounded-[4px] bg-white/[0.10] px-1 py-px text-[10px] font-medium text-white/50">
      {children}
    </span>
  );
}
