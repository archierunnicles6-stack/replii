import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveTranscriptFeed } from "../hooks/useLiveTranscriptFeed";
import { OVERLAY_PILL_THEME } from "../hooks/usePillBackdrop";
import { useOverlayClickThrough } from "../hooks/useOverlayClickThrough";
import {
  askGhost,
  type QuickAction,
  type TranscriptLine,
} from "../services/ai";
import { streamGhostSuggestion } from "../services/ghost-suggest";
import {
  autoTriggerDelayMs,
  buildLiveDisplayText,
  isDirectQuestion,
  normalizeTranscriptText,
  shouldAutoSuggestLine,
  shouldSuggestFromInterim,
  suggestionTriggerKey,
} from "../services/transcript";
import { clearScreenContext, getScreenContext } from "../services/screen-context";
import { bootstrapOpenAIKey } from "../services/whisper";
import { useAppStore, notifyAppStoreChanged, rehydrateAppStoreFromStorage } from "../store/useAppStore";
import { effectiveContentProtection } from "../store/types";
import {
  ControlButtons,
  getSuggestionReadDurationMs,
  ListeningPill,
  SuggestionPill,
} from "./overlay-ui";

type OverlayPhase = "idle" | "active";

export function OverlayApp() {
  const topPanelRef = useRef<HTMLDivElement>(null);
  const controlBarRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<OverlayPhase>("idle");
  const [listening, setListening] = useState(false);
  const [smartMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState("");
  const [dealHealth, setDealHealth] = useState<number | null>(null);
  const [topPanelHidden, setTopPanelHidden] = useState(false);

  const { activeMode, customSystemPrompt, settings, saveMeetingFromSession } =
    useAppStore();
  const plan = useAppStore((s) => s.plan);
  const sessionStartRef = useRef<number | null>(null);
  const suggestionUsesRef = useRef(0);
  const hideSuggestionTimerRef = useRef<number | null>(null);
  const assistAbortRef = useRef<AbortController | null>(null);
  const interimRef = useRef("");
  const linesRef = useRef<TranscriptLine[]>([]);
  const runAssistRef = useRef<
    (action: QuickAction, customPrompt?: string) => Promise<void>
  >(() => Promise.resolve());
  const lastTriggerKeyRef = useRef<string | null>(null);
  const lastProcessedLineIdRef = useRef<string | null>(null);
  const prevSpeakingRef = useRef(false);
  const suggestDebounceRef = useRef<number | null>(null);

  const feedActive = phase === "active";
  const {
    lines,
    interim,
    error,
    aiReady,
    hearingAudio,
    isSpeaking,
    hasMic,
    hasSystemAudio,
  } = useLiveTranscriptFeed(feedActive);

  const clearTranscript = useCallback(() => {
    window.ghost?.clearLiveTranscript?.();
  }, []);

  linesRef.current = lines;
  interimRef.current = interim;

  useOverlayClickThrough(phase === "active", topPanelRef, controlBarRef, topPanelHidden);
  const pillTheme = OVERLAY_PILL_THEME;

  const resetSessionState = useCallback(() => {
    clearTranscript();
    clearScreenContext();
    setStreamingText("");
    setActiveSuggestion("");
    setDealHealth(null);
    setTopPanelHidden(false);
    if (hideSuggestionTimerRef.current) {
      window.clearTimeout(hideSuggestionTimerRef.current);
      hideSuggestionTimerRef.current = null;
    }
    setListening(false);
    setPhase("idle");
    lastTriggerKeyRef.current = null;
    lastProcessedLineIdRef.current = null;
    assistAbortRef.current?.abort();
    assistAbortRef.current = null;
    sessionStartRef.current = null;
    suggestionUsesRef.current = 0;
    void window.ghost?.setOverlayMode("pill");
    document.documentElement.classList.remove("active-mode");
    document.body.classList.remove("active-mode");
  }, [clearTranscript]);

  const activateListening = useCallback(async () => {
    setStreamingText("");
    lastTriggerKeyRef.current = null;
    lastProcessedLineIdRef.current = null;
    assistAbortRef.current?.abort();
    assistAbortRef.current = null;
    sessionStartRef.current = Date.now();
    suggestionUsesRef.current = 0;

    await bootstrapOpenAIKey();
    const permissions = await window.ghost?.getPermissionStatus?.();
    if (permissions && !permissions.microphone) {
      await window.ghost?.showMicHelper?.();
      await window.ghost?.ensureMicrophone?.();
    }

    document.documentElement.classList.add("active-mode");
    document.body.classList.add("active-mode");
    await window.ghost?.setOverlayMode("active");
    setPhase("active");
    setListening(true);
    window.ghost?.setSessionListening?.(true);
    window.ghost?.requestLiveTranscript?.();
  }, []);

  useEffect(() => {
    return window.ghost?.onStoreChanged?.(() => {
      void rehydrateAppStoreFromStorage();
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("overlay");
    document.body.classList.add("overlay");
    void window.ghost?.getSettings?.().then((s) => {
      if (s.sessionActive) void activateListening();
    });
    return () => {
      document.documentElement.classList.remove("overlay", "active-mode");
      document.body.classList.remove("overlay", "active-mode");
    };
  }, [activateListening]);

  useEffect(() => {
    const protected_ = effectiveContentProtection(plan, settings.invisible);
    void window.ghost?.setContentProtection(protected_);
  }, [plan, settings.invisible]);

  useEffect(() => {
    return window.ghost?.onSessionStarted?.(() => void activateListening());
  }, [activateListening]);

  useEffect(() => {
    return window.ghost?.onSessionStopped?.(() => resetSessionState());
  }, [resetSessionState]);

  useEffect(() => {
    return window.ghost?.onShortcutToggle?.(() => {
      setTopPanelHidden((hidden) => !hidden);
    });
  }, []);

  const clearHideSuggestionTimer = useCallback(() => {
    if (hideSuggestionTimerRef.current) {
      window.clearTimeout(hideSuggestionTimerRef.current);
      hideSuggestionTimerRef.current = null;
    }
  }, []);

  const scheduleHideSuggestion = useCallback(
    (text: string) => {
      clearHideSuggestionTimer();
      hideSuggestionTimerRef.current = window.setTimeout(() => {
        setActiveSuggestion("");
        setStreamingText("");
        hideSuggestionTimerRef.current = null;
      }, getSuggestionReadDurationMs(text));
    },
    [clearHideSuggestionTimer],
  );

  const runSuggestion = useCallback(
    (triggerText: string, triggerKey?: string) => {
      const text = normalizeTranscriptText(triggerText);
      if (text.length < 3 || text === "…") return;

      const key = triggerKey ?? suggestionTriggerKey(text);
      if (!key || key === lastTriggerKeyRef.current) return;

      const isQuestion = isDirectQuestion(text);

      assistAbortRef.current?.abort();
      const controller = new AbortController();
      assistAbortRef.current = controller;

      clearHideSuggestionTimer();
      setDealHealth(null);
      setLoading(true);
      setStreamingText("");

      const modeConfig = useAppStore.getState().getActiveModeConfig();

      void streamGhostSuggestion(text, linesRef.current, {
        coachingContext: customSystemPrompt,
        product: modeConfig.description,
        micOnly: !hasSystemAudio && hasMic,
        fast: true,
        isQuestion,
        signal: controller.signal,
        onChunk: (chunk) => setStreamingText(chunk),
      })
        .then((result) => {
          if (controller.signal.aborted) return;
          if (!result) {
            setLoading(false);
            return;
          }
          lastTriggerKeyRef.current = key;
          suggestionUsesRef.current += 1;
          setStreamingText("");
          setActiveSuggestion(result.suggestion);
          setDealHealth(result.health);
          setLoading(false);
          scheduleHideSuggestion(result.suggestion);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          console.error("[ghost] Auto suggestion failed:", err);
          setLoading(false);
        })
        .finally(() => {
          if (assistAbortRef.current === controller) {
            assistAbortRef.current = null;
          }
        });
    },
    [customSystemPrompt, hasMic, hasSystemAudio, clearHideSuggestionTimer, scheduleHideSuggestion],
  );

  const runAssist = useCallback(
    async (action: QuickAction, customPrompt?: string) => {
      assistAbortRef.current?.abort();
      const controller = new AbortController();
      assistAbortRef.current = controller;

      clearHideSuggestionTimer();
      setActiveSuggestion("");
      setDealHealth(null);
      setLoading(true);
      setStreamingText("");

      const snapshotLines = linesRef.current;
      const snapshotInterim = interimRef.current;
      let accumulated = "";
      let final = "";

      try {
        const response = await askGhost(action, snapshotLines, {
          customPrompt,
          systemPrompt: customSystemPrompt,
          smartMode,
          interimText: snapshotInterim,
          outputLanguage: settings.outputLanguage,
          signal: controller.signal,
          onChunk: (text) => {
            accumulated = text;
            setStreamingText(text);
          },
        });

        if (controller.signal.aborted) return;

        final = accumulated || response;
        suggestionUsesRef.current += 1;
        setStreamingText("");
        setActiveSuggestion(final);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        throw err;
      } finally {
        if (assistAbortRef.current === controller) {
          assistAbortRef.current = null;
        }
        if (controller.signal.aborted) {
          setLoading(false);
          return;
        }
        setLoading(false);
        if (final) {
          scheduleHideSuggestion(final);
        }
      }
    },
    [customSystemPrompt, smartMode, settings.outputLanguage, clearHideSuggestionTimer, scheduleHideSuggestion],
  );

  runAssistRef.current = runAssist;

  useEffect(() => {
    return window.ghost?.onAssist(() => void runAssist("assist"));
  }, [runAssist]);

  useEffect(() => {
    return window.ghost?.onClearSession(() => {
      clearTranscript();
      setStreamingText("");
      setActiveSuggestion("");
      setDealHealth(null);
      clearHideSuggestionTimer();
      lastTriggerKeyRef.current = null;
      lastProcessedLineIdRef.current = null;
      assistAbortRef.current?.abort();
      assistAbortRef.current = null;
    });
  }, [clearTranscript, clearHideSuggestionTimer]);

  useEffect(() => {
    return () => clearHideSuggestionTimer();
  }, [clearHideSuggestionTimer]);

  useEffect(() => {
    if (phase !== "active" || !listening) return;
    const id = window.setInterval(() => void getScreenContext(true), 60_000);
    return () => window.clearInterval(id);
  }, [phase, listening]);

  useEffect(() => {
    if (!listening) return;

    const lastLine = lines[lines.length - 1];
    if (!lastLine) return;
    if (lastLine.id === lastProcessedLineIdRef.current) return;
    if (!shouldAutoSuggestLine(lastLine, hasSystemAudio, hasMic)) return;

    lastProcessedLineIdRef.current = lastLine.id;
    runSuggestion(lastLine.text);
  }, [lines, listening, hasSystemAudio, hasMic, runSuggestion]);

  useEffect(() => {
    if (!listening) return;

    const interimText = normalizeTranscriptText(interim);
    if (!shouldSuggestFromInterim(interimText)) return;

    const delay = autoTriggerDelayMs(interimText, true) ?? 80;
    const id = window.setTimeout(() => {
      runSuggestion(interimText);
    }, delay);

    return () => window.clearTimeout(id);
  }, [interim, listening, runSuggestion]);

  useEffect(() => {
    if (!listening) {
      prevSpeakingRef.current = false;
      return;
    }

    const wasSpeaking = prevSpeakingRef.current;
    prevSpeakingRef.current = isSpeaking;

    if (isSpeaking || !wasSpeaking) return;

    if (suggestDebounceRef.current) {
      window.clearTimeout(suggestDebounceRef.current);
    }

    const preview = buildLiveDisplayText(linesRef.current, interimRef.current);
    if (!preview || preview === "…" || preview.length < 3) return;

    const delay = isDirectQuestion(preview) ? 40 : 80;

    suggestDebounceRef.current = window.setTimeout(() => {
      suggestDebounceRef.current = null;
      const text = buildLiveDisplayText(linesRef.current, interimRef.current);
      if (text.length < 3 || text === "…") return;

      const lastLine = linesRef.current[linesRef.current.length - 1];
      if (
        lastLine &&
        suggestionTriggerKey(lastLine.text) === suggestionTriggerKey(text)
      ) {
        return;
      }

      if (
        !shouldAutoSuggestLine(
          { id: "tail", speaker: "You", text, timestamp: 0 },
          hasSystemAudio,
          hasMic,
        )
      ) {
        return;
      }

      runSuggestion(text);
    }, delay);
  }, [isSpeaking, listening, hasSystemAudio, hasMic, runSuggestion]);

  useEffect(() => {
    return () => {
      if (suggestDebounceRef.current) window.clearTimeout(suggestDebounceRef.current);
    };
  }, []);

  const stopSession = async () => {
    const duration = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;

    setListening(false);

    const meeting = saveMeetingFromSession({
      title: "Live session",
      company: "Meeting",
      mode: activeMode,
      duration,
      transcript: linesRef.current,
      summary: "Generating summary…",
      status: "processing",
      nextSteps: [],
      dealScore: 0,
      objections: [],
      suggestionUses: suggestionUsesRef.current,
    });

    if (linesRef.current.length === 0) {
      useAppStore.getState().refundFreeSessionUsage();
    }

    notifyAppStoreChanged();

    void window.ghost?.requestMeetingSummary?.({
      meetingId: meeting.id,
      transcript: linesRef.current,
    });

    await window.ghost?.stopSession();
    useAppStore.getState().setSessionActive(false);
    void window.ghost?.focusDashboard(`/meetings/${meeting.id}`);
  };

  if (phase === "idle") return null;

  const liveText =
    buildLiveDisplayText(lines, interim) ||
    (isSpeaking && listening ? "…" : "");
  const isStreaming = (!!interim.trim() || isSpeaking) && listening;
  const displaySuggestion = loading ? streamingText : activeSuggestion;
  const showSuggestionBox = loading || !!displaySuggestion.trim();

  return (
    <div className="pointer-events-none fixed inset-0 h-full w-full bg-transparent">
      {!topPanelHidden && (
        <div
          ref={topPanelRef}
          className="pointer-events-auto absolute left-4 top-4 flex w-[min(520px,calc(100vw-32px))] flex-col gap-2"
        >
          <ListeningPill
            listening={listening}
            error={error}
            aiReady={aiReady}
            liveText={liveText}
            isStreaming={isStreaming}
            hearingAudio={hearingAudio}
            hasMic={hasMic}
            hasSystemAudio={hasSystemAudio}
            pillTheme={pillTheme}
          />
          {showSuggestionBox && (
            <SuggestionPill
              suggestion={displaySuggestion}
              loading={loading}
              pillTheme={pillTheme}
            />
          )}
        </div>
      )}

      <div
        ref={controlBarRef}
        className="pointer-events-auto absolute bottom-6 left-1/2 w-max max-w-[calc(100vw-32px)] -translate-x-1/2"
      >
        <ControlButtons
          onToggleDashboard={() => void window.ghost?.toggleDashboard?.()}
          listening={listening}
          onToggleListening={() => {
            const next = !listening;
            setListening(next);
            window.ghost?.setSessionListening?.(next);
          }}
          onEndSession={() => void stopSession()}
          pillTheme={pillTheme}
        />
      </div>
    </div>
  );
}
