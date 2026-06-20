import { useEffect, useRef, useState } from "react";
import { useMeetingTranscription } from "../hooks/useMeetingTranscription";
import { useAppStore } from "../store/useAppStore";

/** Runs mic transcription in the dashboard window (reliable mic access on macOS). */
export function SessionMicBridge() {
  const sessionActive = useAppStore((s) => s.sessionActive);
  const setSessionActive = useAppStore((s) => s.setSessionActive);
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
    window.replii?.pushLiveTranscript?.({
      lines: t.lines,
      interim: t.interim,
      error: t.error,
      hearingAudio: t.hearingAudio,
      isSpeaking: t.isSpeaking,
      hasMic: t.hasMic,
      hasSystemAudio: t.hasSystemAudio,
      aiReady: t.aiReady,
      audioSource: t.audioSource,
    });
  };

  useEffect(() => {
    const onStarted = () => {
      setSessionActive(true);
      setListening(true);
      window.setTimeout(pushNow, 100);
      window.setTimeout(pushNow, 500);
      window.setTimeout(pushNow, 1500);
    };
    const onStopped = () => setSessionActive(false);

    const offStarted = window.replii?.onSessionStarted?.(onStarted);
    const offStopped = window.replii?.onSessionStopped?.(onStopped);

    void window.replii?.getSettings?.().then((s) => {
      if (s.sessionActive) onStarted();
    });

    return () => {
      offStarted?.();
      offStopped?.();
    };
  }, [setSessionActive]);

  useEffect(() => {
    return window.replii?.onSessionListening?.((active) => setListening(active));
  }, []);

  useEffect(() => {
    return window.replii?.onRequestLiveTranscript?.(() => pushNow());
  }, []);

  useEffect(() => {
    return window.replii?.onClearLiveTranscript?.(() => transcriptionRef.current.clear());
  }, []);

  useEffect(() => {
    if (!sessionActive) return;
    pushNow();
    const id = window.setInterval(pushNow, 200);
    return () => window.clearInterval(id);
  }, [
    sessionActive,
    transcription.lines,
    transcription.interim,
    transcription.error,
    transcription.hearingAudio,
    transcription.isSpeaking,
    transcription.hasMic,
    transcription.hasSystemAudio,
    transcription.aiReady,
    transcription.audioSource,
  ]);

  useEffect(() => {
    if (!sessionActive || !transcription.error) return;

    const retry = window.setInterval(() => {
      void window.replii?.ensureMicrophone?.().then((granted) => {
        if (granted) pushNow();
      });
    }, 2000);

    return () => window.clearInterval(retry);
  }, [sessionActive, transcription.error]);

  return null;
}
