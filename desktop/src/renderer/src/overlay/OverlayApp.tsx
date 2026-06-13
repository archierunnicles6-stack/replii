import { useCallback, useEffect, useRef, useState } from "react";
import { usePillBackdrop } from "../hooks/usePillBackdrop";
import { useLiveTranscriptFeed } from "../hooks/useLiveTranscriptFeed";
import { useOverlayClickThrough } from "../hooks/useOverlayClickThrough";
import {
  askGhost,
  TEST_PROSPECT_LINES,
  testGhostSuggestion,
  type AssistResult,
  type QuickAction,
  type TranscriptLine,
} from "../services/ai";
import { getGhostSuggestion } from "../services/ghost-suggest";
import { buildLiveDisplayText, isLikelyProspectUtterance } from "../services/transcript";
import { shouldUseMockAudio } from "../services/mock-audio";
import { useAppStore, notifyAppStoreChanged, rehydrateAppStoreFromStorage } from "../store/useAppStore";
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
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [suggestionMounted, setSuggestionMounted] = useState(false);
  const [topPanelHidden, setTopPanelHidden] = useState(false);

  const { activeMode, customSystemPrompt, settings, saveMeetingFromSession } =
    useAppStore();
  const sessionStartRef = useRef<number | null>(null);
  const hideSuggestionTimerRef = useRef<number | null>(null);
  const assistAbortRef = useRef<AbortController | null>(null);
  const interimRef = useRef("");
  const linesRef = useRef<TranscriptLine[]>([]);
  const runAssistRef = useRef<
    (action: QuickAction, customPrompt?: string) => Promise<void>
  >(() => Promise.resolve());
  const lastTriggerKeyRef = useRef<string | null>(null);
  const testLineIndexRef = useRef(0);

  const { lines, interim, error, aiReady, hearingAudio, hasMic, hasSystemAudio, isDemo } =
    useLiveTranscriptFeed(phase === "active");

  const clearTranscript = useCallback(() => {
    window.ghost?.clearLiveTranscript?.();
  }, []);

  linesRef.current = lines;
  interimRef.current = interim;

  useOverlayClickThrough(phase === "active", topPanelRef, controlBarRef, topPanelHidden);
  const pillTheme = usePillBackdrop(topPanelRef, phase === "active" && !topPanelHidden);

  const resetSessionState = useCallback(() => {
    clearTranscript();
    setStreamingText("");
    setActiveSuggestion("");
    setDealHealth(null);
    setSuggestionVisible(false);
    setSuggestionMounted(false);
    setTopPanelHidden(false);
    if (hideSuggestionTimerRef.current) {
      window.clearTimeout(hideSuggestionTimerRef.current);
      hideSuggestionTimerRef.current = null;
    }
    setListening(false);
    setPhase("idle");
    lastTriggerKeyRef.current = null;
    assistAbortRef.current?.abort();
    assistAbortRef.current = null;
    sessionStartRef.current = null;
    void window.ghost?.setOverlayMode("pill");
    document.documentElement.classList.remove("active-mode");
    document.body.classList.remove("active-mode");
  }, [clearTranscript]);

  const activateListening = useCallback(async () => {
    setStreamingText("");
    lastTriggerKeyRef.current = null;
    assistAbortRef.current?.abort();
    assistAbortRef.current = null;
    sessionStartRef.current = Date.now();

    const captureMode = useAppStore.getState().audioCaptureMode;
    if (!shouldUseMockAudio(captureMode)) {
      const permissions = await window.ghost?.getPermissionStatus?.();
      if (permissions && !permissions.microphone) {
        await window.ghost?.showMicHelper?.();
        await window.ghost?.ensureMicrophone?.();
      }
    }

    document.documentElement.classList.add("active-mode");
    document.body.classList.add("active-mode");
    await window.ghost?.setOverlayMode("active");
    setPhase("active");
    setListening(true);
    window.ghost?.setSessionListening?.(true);
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
    window.ghost?.setContentProtection(settings.invisible);
  }, [settings.invisible]);

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
        setSuggestionVisible(false);
        hideSuggestionTimerRef.current = window.setTimeout(() => {
          setSuggestionMounted(false);
          setActiveSuggestion("");
          hideSuggestionTimerRef.current = null;
        }, 320);
      }, getSuggestionReadDurationMs(text));
    },
    [clearHideSuggestionTimer],
  );

  const runAssist = useCallback(
    async (action: QuickAction, customPrompt?: string) => {
      assistAbortRef.current?.abort();
      const controller = new AbortController();
      assistAbortRef.current = controller;

      clearHideSuggestionTimer();
      setSuggestionMounted(true);
      setSuggestionVisible(true);
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
        } else {
          setSuggestionVisible(false);
          setSuggestionMounted(false);
        }
      }
    },
    [customSystemPrompt, smartMode, settings.outputLanguage, clearHideSuggestionTimer, scheduleHideSuggestion],
  );

  runAssistRef.current = runAssist;

  const runTestAi = useCallback(async () => {
    assistAbortRef.current?.abort();
    clearHideSuggestionTimer();
    setSuggestionMounted(true);
    setSuggestionVisible(true);
    setActiveSuggestion("");
    setDealHealth(null);
    setLoading(true);
    setStreamingText("");

    const prospectText =
      TEST_PROSPECT_LINES[testLineIndexRef.current % TEST_PROSPECT_LINES.length] ??
      TEST_PROSPECT_LINES[0];
    testLineIndexRef.current += 1;

    try {
      const result = await testGhostSuggestion(prospectText, {
        coachingContext: customSystemPrompt,
        product: useAppStore.getState().getActiveModeConfig().description,
      });
      if (!result) {
        setActiveSuggestion("Couldn't reach Ghost AI. Check your OpenAI API key.");
        setDealHealth(null);
        return;
      }
      setActiveSuggestion(result.suggestion);
      setDealHealth(result.dealHealth);
      scheduleHideSuggestion(result.suggestion);
    } finally {
      setLoading(false);
    }
  }, [customSystemPrompt, clearHideSuggestionTimer, scheduleHideSuggestion]);

  useEffect(() => {
    return window.ghost?.onAssist(() => void runAssist("assist"));
  }, [runAssist]);

  useEffect(() => {
    return window.ghost?.onClearSession(() => {
      clearTranscript();
      setStreamingText("");
      setActiveSuggestion("");
      setDealHealth(null);
      setSuggestionVisible(false);
      setSuggestionMounted(false);
      clearHideSuggestionTimer();
      lastTriggerKeyRef.current = null;
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

    const fromProspect = lastLine.speaker === "Prospect";
    const fromMicOnly =
      !hasSystemAudio && isLikelyProspectUtterance(lastLine.text);

    if (!fromProspect && !fromMicOnly) return;
    if (lastTriggerKeyRef.current === lastLine.id) return;

    lastTriggerKeyRef.current = lastLine.id;

    assistAbortRef.current?.abort();
    const controller = new AbortController();
    assistAbortRef.current = controller;

    clearHideSuggestionTimer();
    setSuggestionMounted(true);
    setSuggestionVisible(true);
    setActiveSuggestion("");
    setDealHealth(null);
    setLoading(true);
    setStreamingText("");

    const modeConfig = useAppStore.getState().getActiveModeConfig();

    void getGhostSuggestion(lastLine.text, linesRef.current, {
      coachingContext: customSystemPrompt,
      product: modeConfig.description,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!result) {
          console.error("[ghost] No suggestion returned — check OpenAI API key and network.");
          setSuggestionVisible(false);
          setSuggestionMounted(false);
          return;
        }
        setActiveSuggestion(result.suggestion);
        setDealHealth(result.health);
        scheduleHideSuggestion(result.suggestion);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("[ghost] Auto suggestion failed:", err);
      })
      .finally(() => {
        if (assistAbortRef.current === controller) {
          assistAbortRef.current = null;
        }
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
  }, [
    lines,
    listening,
    hasSystemAudio,
    customSystemPrompt,
    clearHideSuggestionTimer,
    scheduleHideSuggestion,
  ]);

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
    });
    notifyAppStoreChanged();

    void window.ghost?.requestMeetingSummary?.({
      meetingId: meeting.id,
      transcript: linesRef.current,
    });

    await window.ghost?.stopSession();
    useAppStore.getState().incrementFreeSessionUsage();
    useAppStore.getState().setSessionActive(false);
    void window.ghost?.focusDashboard(`/meetings/${meeting.id}`);
  };

  if (phase === "idle") return null;

  const displaySuggestion = loading ? streamingText : activeSuggestion;
  const showSuggestionCard = suggestionMounted && (loading || !!displaySuggestion);
  const liveText = buildLiveDisplayText(lines, interim) || (hearingAudio && listening ? "…" : "");
  const isStreaming = !!interim.trim() && listening;

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
            isDemo={isDemo}
            pillTheme={pillTheme}
          />
          {showSuggestionCard && (
            <SuggestionPill
              suggestion={displaySuggestion}
              loading={loading}
              visible={suggestionVisible}
              dealHealth={dealHealth}
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
          onAssist={() => void runAssist("assist")}
          onTestAi={() => void runTestAi()}
          onMock={() => window.ghost?.triggerMock?.()}
          showTestAi={import.meta.env.DEV}
          showMock={import.meta.env.DEV && isDemo}
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
