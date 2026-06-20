import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveTranscriptFeed } from "../hooks/useLiveTranscriptFeed";
import { OVERLAY_PILL_THEME } from "../hooks/usePillBackdrop";
import { useOverlayClickThrough } from "../hooks/useOverlayClickThrough";
import {
  askReplii,
  type QuickAction,
  type TranscriptLine,
} from "../services/ai";
import { streamRepliiSuggestion } from "../services/replii-suggest";
import {
  autoTriggerDelayMs,
  buildLiveDisplayText,
  isDirectQuestion,
  normalizeTranscriptText,
  shouldAutoSuggestLine,
  shouldSuggestFromInterim,
  suggestionTriggerKey,
} from "../services/transcript";
import { clearScreenContext } from "../services/screen-context";
import { bootstrapOpenAIKey } from "../services/whisper";
import { OPENAI_LIMITS } from "../lib/openai-config";
import {
  getEffectiveObjections,
  getEffectiveProduct,
  getLiveKnowledgeContext,
} from "../lib/company-info";
import { useContentProtectionSync } from "../hooks/useContentProtectionSync";
import { createSuggestionRecord } from "../lib/suggestion-tags";
import { endRepliiSession } from "../lib/end-replii-session";
import { useAppStore, rehydrateAppStoreFromStorage } from "../store/useAppStore";
import type { SuggestionRecord } from "../store/types";
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

  const {
    activeMode,
    companyInfo,
    knowledgeContext,
    settings,
  } = useAppStore();
  const liveCoachingContext = getLiveKnowledgeContext(knowledgeContext);
  const assistCoachingContext = knowledgeContext;
  const aiProduct = getEffectiveProduct(companyInfo);
  const aiObjections = getEffectiveObjections(companyInfo);
  const sessionStartRef = useRef<number | null>(null);
  const suggestionUsesRef = useRef(0);
  const suggestionsRef = useRef<SuggestionRecord[]>([]);
  const hideSuggestionTimerRef = useRef<number | null>(null);
  const assistAbortRef = useRef<AbortController | null>(null);
  const interimRef = useRef("");
  const linesRef = useRef<TranscriptLine[]>([]);
  const runAssistRef = useRef<
    (action: QuickAction, customPrompt?: string) => Promise<void>
  >(() => Promise.resolve());
  const lastTriggerKeyRef = useRef<string | null>(null);
  const lastProcessedLineIdRef = useRef<string | null>(null);
  const lastSuggestionAtRef = useRef(0);
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
    window.replii?.clearLiveTranscript?.();
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
    suggestionsRef.current = [];
    void window.replii?.setOverlayMode("pill");
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
    suggestionsRef.current = [];

    await bootstrapOpenAIKey();
    const permissions = await window.replii?.getPermissionStatus?.();
    if (permissions && !permissions.microphone) {
      await window.replii?.showMicHelper?.();
      await window.replii?.ensureMicrophone?.();
    }

    document.documentElement.classList.add("active-mode");
    document.body.classList.add("active-mode");
    await window.replii?.setOverlayMode("active");
    setPhase("active");
    setListening(true);
    window.replii?.setSessionListening?.(true);
    window.replii?.requestLiveTranscript?.();
  }, []);

  useEffect(() => {
    return window.replii?.onStoreChanged?.(() => {
      void rehydrateAppStoreFromStorage();
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("overlay");
    document.body.classList.add("overlay");
    void window.replii?.getSettings?.().then((s) => {
      if (s.sessionActive) void activateListening();
    });
    return () => {
      document.documentElement.classList.remove("overlay", "active-mode");
      document.body.classList.remove("overlay", "active-mode");
    };
  }, [activateListening]);

  useContentProtectionSync(true);

  useEffect(() => {
    return window.replii?.onSessionStarted?.(() => void activateListening());
  }, [activateListening]);

  useEffect(() => {
    return window.replii?.onSessionStopped?.(() => resetSessionState());
  }, [resetSessionState]);

  useEffect(() => {
    return window.replii?.onShortcutToggle?.(() => {
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

  const sessionElapsedSec = () =>
    sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;

  const recordSuggestion = useCallback(
    (
      text: string,
      source: "auto" | "assist",
      opts?: { triggerText?: string; health?: number; transcriptLineId?: string },
    ) => {
      const suggestion = createSuggestionRecord({
        text,
        triggerText: opts?.triggerText,
        transcriptLineId: opts?.transcriptLineId,
        timestamp: sessionElapsedSec(),
        health: opts?.health,
        source,
      });
      suggestionsRef.current = [...suggestionsRef.current, suggestion];
      return suggestion;
    },
    [],
  );

  const runSuggestion = useCallback(
    (triggerText: string, triggerKey?: string) => {
      const text = normalizeTranscriptText(triggerText);
      if (text.length < 3 || text === "…") return;

      const key = triggerKey ?? suggestionTriggerKey(text);
      if (!key || key === lastTriggerKeyRef.current) return;

      const isQuestion = isDirectQuestion(text);
      const cooldownMs = isQuestion
        ? OPENAI_LIMITS.questionSuggestionCooldownMs
        : OPENAI_LIMITS.suggestionCooldownMs;
      if (Date.now() - lastSuggestionAtRef.current < cooldownMs) return;

      assistAbortRef.current?.abort();
      const controller = new AbortController();
      assistAbortRef.current = controller;

      clearHideSuggestionTimer();
      setDealHealth(null);
      setLoading(true);
      setStreamingText("");

      void streamRepliiSuggestion(text, linesRef.current, {
        product: aiProduct,
        objections: aiObjections,
        coachingContext: liveCoachingContext,
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
          lastSuggestionAtRef.current = Date.now();
          lastTriggerKeyRef.current = key;
          suggestionUsesRef.current += 1;
          const lastLine = linesRef.current[linesRef.current.length - 1];
          recordSuggestion(result.suggestion, "auto", {
            triggerText: text,
            health: result.health,
            transcriptLineId: lastLine?.id,
          });
          setStreamingText("");
          setActiveSuggestion(result.suggestion);
          setDealHealth(result.health);
          setLoading(false);
          scheduleHideSuggestion(result.suggestion);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          console.error("[replii] Auto suggestion failed:", err);
          setLoading(false);
        })
        .finally(() => {
          if (assistAbortRef.current === controller) {
            assistAbortRef.current = null;
          }
        });
    },
    [aiObjections, aiProduct, hasMic, hasSystemAudio, liveCoachingContext, clearHideSuggestionTimer, scheduleHideSuggestion, recordSuggestion],
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
        const response = await askReplii(action, snapshotLines, {
          customPrompt,
          systemPrompt: assistCoachingContext,
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
        const lastProspect = [...snapshotLines]
          .reverse()
          .find((l) => l.speaker === "Prospect");
        recordSuggestion(final, "assist", {
          triggerText: lastProspect?.text ?? snapshotInterim,
          transcriptLineId: lastProspect?.id,
        });
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
    [assistCoachingContext, smartMode, settings.outputLanguage, clearHideSuggestionTimer, scheduleHideSuggestion, recordSuggestion],
  );

  runAssistRef.current = runAssist;

  useEffect(() => {
    return window.replii?.onAssist(() => void runAssist("assist"));
  }, [runAssist]);

  useEffect(() => {
    return window.replii?.onClearSession(() => {
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

  const stopSession = useCallback(async () => {
    const duration = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;

    setListening(false);

    await endRepliiSession({
      duration,
      transcript: linesRef.current,
      activeMode,
      suggestionUses: suggestionUsesRef.current,
      suggestions: suggestionsRef.current,
    });
  }, [activeMode]);

  useEffect(() => {
    return window.replii?.onRequestEndSession?.(() => void stopSession());
  }, [stopSession]);

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
          onMouseEnter={() => void window.replii?.setIgnoreMouseEvents?.(false)}
          onMouseLeave={() =>
            void window.replii?.setIgnoreMouseEvents?.(true, { forward: true })
          }
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
        onMouseEnter={() => void window.replii?.setIgnoreMouseEvents?.(false)}
        onMouseLeave={() =>
          void window.replii?.setIgnoreMouseEvents?.(true, { forward: true })
        }
      >
        <ControlButtons
          onToggleDashboard={() => void window.replii?.toggleDashboard?.()}
          listening={listening}
          onToggleListening={() => {
            const next = !listening;
            setListening(next);
            window.replii?.setSessionListening?.(next);
          }}
          onEndSession={() => void stopSession()}
          pillTheme={pillTheme}
        />
      </div>
    </div>
  );
}
