import { useEffect, useRef, useState } from "react";
import { useMeetingTranscription } from "../hooks/useMeetingTranscription";
import { useAppStore } from "../store/useAppStore";

/** Runs mic transcription in the dashboard window (reliable mic access on macOS). */
export function SessionMicBridge() {
  const [sessionActive, setSessionActive] = useState(false);
  const [listening, setListening] = useState(true);
  const meetingLanguage = useAppStore((s) => s.settings.meetingLanguage);
  const audioCaptureMode = useAppStore((s) => s.audioCaptureMode);

  const transcription = useMeetingTranscription(
    sessionActive && listening,
    meetingLanguage,
    audioCaptureMode,
  );
  const transcriptionRef = useRef(transcription);
  transcriptionRef.current = transcription;

  const pushNow = () => {
    const t = transcriptionRef.current;
    window.ghost?.pushLiveTranscript?.({
      lines: t.lines,
      interim: t.interim,
      error: t.error,
      hearingAudio: t.hearingAudio,
      hasMic: t.hasMic,
      hasSystemAudio: t.hasSystemAudio,
      aiReady: t.aiReady,
      audioSource: t.audioSource,
      isDemo: t.mode === "mock",
    });
  };

  useEffect(() => {
    const onStarted = () => {
      setSessionActive(true);
      setListening(true);
      window.setTimeout(pushNow, 100);
    };
    const onStopped = () => setSessionActive(false);

    const offStarted = window.ghost?.onSessionStarted?.(onStarted);
    const offStopped = window.ghost?.onSessionStopped?.(onStopped);

    void window.ghost?.getSettings?.().then((s) => {
      if (s.sessionActive) onStarted();
    });

    return () => {
      offStarted?.();
      offStopped?.();
    };
  }, []);

  useEffect(() => {
    return window.ghost?.onSessionListening?.((active) => setListening(active));
  }, []);

  useEffect(() => {
    return window.ghost?.onClearLiveTranscript?.(() => transcriptionRef.current.clear());
  }, []);

  useEffect(() => {
    return window.ghost?.onTriggerMock?.(() => {
      transcriptionRef.current.triggerMock();
      window.setTimeout(pushNow, 50);
    });
  }, []);

  useEffect(() => {
    if (!sessionActive) return;
    pushNow();
    const id = window.setInterval(pushNow, 400);
    return () => window.clearInterval(id);
  }, [
    sessionActive,
    transcription.lines,
    transcription.interim,
    transcription.error,
    transcription.hearingAudio,
    transcription.hasMic,
    transcription.hasSystemAudio,
    transcription.aiReady,
    transcription.audioSource,
  ]);

  useEffect(() => {
    if (!sessionActive || !transcription.error) return;

    const retry = window.setInterval(() => {
      void window.ghost?.ensureMicrophone?.().then((granted) => {
        if (granted) pushNow();
      });
    }, 2000);

    return () => window.clearInterval(retry);
  }, [sessionActive, transcription.error]);

  return null;
}
