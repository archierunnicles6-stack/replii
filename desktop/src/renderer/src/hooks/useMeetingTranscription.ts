import { useCallback, useEffect, useRef, useState } from "react";
import type { TranscriptLine } from "../services/ai";
import {
  captureCallAudio,
  captureMicrophone,
  detectGhostAudioSetup,
  getSupportedRecorderMime,
  isCallAudioSource,
  type GhostAudioSetup,
  type GhostAudioSource,
} from "../services/audio-capture";
import { shouldUseMockAudio, startMockConversation, MOCK_CONVERSATION } from "../services/mock-audio";
import { normalizeTranscriptText } from "../services/transcript";
import { getOpenAIKey, transcribeAudioChunk } from "../services/whisper";
import { useSpeechRecognition } from "./useSpeechRecognition";

const CHUNK_MS = 1000;
const MIN_BLOB_BYTES = 32;

export type AudioCaptureMode = "auto" | "mic" | "system" | "mock";

function isDuplicateLine(prev: TranscriptLine[], text: string): boolean {
  const normalized = normalizeTranscriptText(text).toLowerCase();
  if (!normalized || normalized.length < 2) return true;

  for (let i = prev.length - 1; i >= Math.max(0, prev.length - 3); i--) {
    const existing = prev[i];
    if (!existing) continue;
    const existingNorm = normalizeTranscriptText(existing.text).toLowerCase();
    if (existingNorm === normalized) return true;
    if (existingNorm.includes(normalized) || normalized.includes(existingNorm)) return true;
  }
  return false;
}

function recentTranscriptText(lines: TranscriptLine[], maxChars = 120): string {
  return normalizeTranscriptText(lines.slice(-4).map((l) => l.text).join(" ")).slice(-maxChars);
}

function mergeLines(...groups: TranscriptLine[][]): TranscriptLine[] {
  const map = new Map<string, TranscriptLine>();
  for (const group of groups) {
    for (const line of group) map.set(line.id, line);
  }
  return [...map.values()].sort(
    (a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id),
  );
}

type TranscriberCallbacks = {
  onLine: (line: TranscriptLine) => void;
  onProcessing?: (active: boolean) => void;
  onChunk?: () => void;
};

class StreamTranscriber {
  private recorder: MediaRecorder | null = null;
  private processing = false;
  private queue: Blob[] = [];
  private stopped = false;

  constructor(
    private stream: MediaStream,
    private meetingLanguage: string,
    private sessionStart: number,
    private speaker: TranscriptLine["speaker"],
    private callbacks: TranscriberCallbacks,
  ) {}

  start(): void {
    const mimeType = getSupportedRecorderMime();
    if (!mimeType) return;

    this.recorder = new MediaRecorder(this.stream, { mimeType, audioBitsPerSecond: 128_000 });
    this.recorder.ondataavailable = (event) => {
      if (this.stopped || event.data.size < MIN_BLOB_BYTES) return;
      this.callbacks.onChunk?.();
      void this.enqueue(event.data, mimeType);
    };

    try {
      this.recorder.start(CHUNK_MS);
    } catch (err) {
      console.warn("[ghost] MediaRecorder start failed:", err);
    }
  }

  private async enqueue(blob: Blob, mimeType: string): Promise<void> {
    this.queue.push(blob);
    if (this.processing) return;
    this.processing = true;
    this.callbacks.onProcessing?.(true);

    while (this.queue.length > 0) {
      const chunk = this.queue.shift();
      if (!chunk || this.stopped) continue;

      const text = await transcribeAudioChunk(chunk, this.meetingLanguage, mimeType);
      if (!text) continue;

      this.callbacks.onLine({
        id: `${Date.now()}-${Math.random()}`,
        speaker: this.speaker,
        text: normalizeTranscriptText(text),
        timestamp: Math.floor((Date.now() - this.sessionStart) / 1000),
      });
    }

    this.processing = false;
    this.callbacks.onProcessing?.(false);
  }

  stop(): void {
    this.stopped = true;
    if (this.recorder?.state !== "inactive") {
      try {
        this.recorder?.stop();
      } catch {
        // ignore
      }
    }
    this.stream.getTracks().forEach((t) => t.stop());
  }
}

export interface MeetingTranscriptionState {
  lines: TranscriptLine[];
  interim: string;
  supported: boolean;
  error: string | null;
  mode: "hybrid" | "webspeech" | "whisper" | "call-audio" | "mock" | "idle";
  hasSystemAudio: boolean;
  hasMic: boolean;
  aiReady: boolean;
  hearingAudio: boolean;
  audioCaptureMode: AudioCaptureMode;
  audioSource: GhostAudioSource;
  audioSetup: GhostAudioSetup | null;
}

export function useMeetingTranscription(
  active: boolean,
  meetingLanguage = "English",
  audioCaptureMode: AudioCaptureMode = "auto",
): MeetingTranscriptionState & { clear: () => void; triggerMock: () => void } {
  const mockMode = shouldUseMockAudio(audioCaptureMode);
  const [mockLines, setMockLines] = useState<TranscriptLine[]>([]);
  const [mockInterim, setMockInterim] = useState("");
  const mockStopRef = useRef<(() => void) | null>(null);
  const mockIndexRef = useRef(0);

  const [whisperLines, setWhisperLines] = useState<TranscriptLine[]>([]);
  const [audioSource, setAudioSource] = useState<GhostAudioSource>(null);
  const [audioSetup, setAudioSetup] = useState<GhostAudioSetup | null>(null);
  const [hasMicCapture, setHasMicCapture] = useState(false);
  const [hasCallCapture, setHasCallCapture] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureProcessing, setCaptureProcessing] = useState(false);
  const [callAudioActive, setCallAudioActive] = useState(false);
  const transcribersRef = useRef<StreamTranscriber[]>([]);
  const sessionStartRef = useRef<number | null>(null);
  const aiReady = !!getOpenAIKey();

  const triggerMock = useCallback(() => {
    if (!mockMode) return;
    if (!sessionStartRef.current) sessionStartRef.current = Date.now();
    const prospects = MOCK_CONVERSATION.filter((e) => e.speaker === "Prospect");
    const entry = prospects[mockIndexRef.current % prospects.length];
    if (!entry) return;
    mockIndexRef.current += 1;
    setMockLines((prev) => {
      const line: TranscriptLine = {
        id: `mock-manual-${Date.now()}`,
        speaker: "Prospect",
        text: entry.text,
        timestamp: Math.floor((Date.now() - sessionStartRef.current!) / 1000),
      };
      if (isDuplicateLine(prev, line.text)) return prev;
      return [...prev, line];
    });
  }, [mockMode]);

  const [captureRetry, setCaptureRetry] = useState(0);
  const useMicPath = !mockMode && audioCaptureMode !== "system";
  const useCallAudioPath = !mockMode && audioCaptureMode === "system";

  const micSpeech = useSpeechRecognition(active && useMicPath, meetingLanguage, "You");

  const addWhisperLine = useCallback((line: TranscriptLine) => {
    setWhisperLines((prev) => {
      if (isDuplicateLine(prev, line.text)) return prev;
      return [...prev, line];
    });
  }, []);

  const clear = useCallback(() => {
    const wasMockRunning = !!mockStopRef.current;
    mockStopRef.current?.();
    mockStopRef.current = null;
    setMockLines([]);
    setMockInterim("");
    transcribersRef.current.forEach((t) => t.stop());
    transcribersRef.current = [];
    setWhisperLines([]);
    setAudioSource(null);
    setHasMicCapture(false);
    setHasCallCapture(false);
    setCaptureError(null);
    setCaptureProcessing(false);
    setCallAudioActive(false);
    if (!wasMockRunning) {
      sessionStartRef.current = null;
    }
    micSpeech.clear();
  }, [micSpeech]);

  useEffect(() => {
    if (!active || !mockMode) {
      mockStopRef.current?.();
      mockStopRef.current = null;
      return;
    }

    if (!sessionStartRef.current) sessionStartRef.current = Date.now();
    const sessionStart = sessionStartRef.current;

    mockStopRef.current = startMockConversation({
      sessionStart,
      onInterim: setMockInterim,
      onLine: (line) => {
        setMockLines((prev) => {
          if (isDuplicateLine(prev, line.text)) return prev;
          return [...prev, line];
        });
      },
    });

    return () => {
      mockStopRef.current?.();
      mockStopRef.current = null;
    };
  }, [active, mockMode]);

  const startTranscriber = useCallback(
    (stream: MediaStream, sessionStart: number, speaker: TranscriptLine["speaker"]) => {
      const transcriber = new StreamTranscriber(
        stream,
        meetingLanguage,
        sessionStart,
        speaker,
        {
          onLine: addWhisperLine,
          onProcessing: setCaptureProcessing,
          onChunk: () => setCallAudioActive(true),
        },
      );
      transcribersRef.current.push(transcriber);
      transcriber.start();
    },
    [addWhisperLine, meetingLanguage],
  );

  useEffect(() => {
    return window.ghost?.onMicGranted?.(() => setCaptureRetry((n) => n + 1));
  }, []);

  useEffect(() => {
    if (!active || mockMode) {
      transcribersRef.current.forEach((t) => t.stop());
      transcribersRef.current = [];
      if (!mockMode) {
        setHasMicCapture(false);
        setHasCallCapture(false);
      }
      setCallAudioActive(false);
      return;
    }

    if (!sessionStartRef.current) sessionStartRef.current = Date.now();

    let cancelled = false;

    void (async () => {
      setCaptureError(null);
      const setup = await detectGhostAudioSetup();
      if (cancelled) return;
      setAudioSetup(setup);

      await window.ghost?.ensureMicrophone?.();
      if (cancelled) return;

      if (!aiReady) return;

      const sessionStart = sessionStartRef.current ?? Date.now();
      let micOk = false;
      let callOk = false;

      if (useCallAudioPath) {
        const callAudio = await captureCallAudio();
        if (cancelled) {
          callAudio?.stream.getTracks().forEach((t) => t.stop());
        } else if (callAudio) {
          setAudioSource(callAudio.source);
          setHasCallCapture(true);
          callOk = true;
          startTranscriber(callAudio.stream, sessionStart, "Prospect");
        } else if (audioCaptureMode === "system") {
          setCaptureError("screen-blocked");
        }
      }

      if (useMicPath) {
        try {
          const micStream = await captureMicrophone();
          if (cancelled) {
            micStream.getTracks().forEach((t) => t.stop());
          } else {
            if (!callOk) setAudioSource("microphone");
            setHasMicCapture(true);
            micOk = true;
            startTranscriber(micStream, sessionStart, "You");
          }
        } catch {
          if (audioCaptureMode === "mic" || !callOk) {
            setCaptureError("not-allowed");
          }
        }
      }

      if (!micOk && !callOk) {
        setCaptureError(audioCaptureMode === "system" ? "screen-blocked" : "not-allowed");
      }
    })();

    return () => {
      cancelled = true;
      transcribersRef.current.forEach((t) => t.stop());
      transcribersRef.current = [];
    };
  }, [active, aiReady, audioCaptureMode, mockMode, startTranscriber, useCallAudioPath, useMicPath, captureRetry]);

  useEffect(() => {
    if (!active || mockMode || captureError !== "not-allowed") return;
    const id = window.setInterval(async () => {
      const status = await window.ghost?.getPermissionStatus?.();
      if (status?.microphone) setCaptureRetry((n) => n + 1);
    }, 2000);
    return () => window.clearInterval(id);
  }, [active, mockMode, captureError]);

  if (mockMode) {
    const lines = mockLines;
    const interim = normalizeTranscriptText(mockInterim);
    return {
      lines,
      interim,
      supported: true,
      error: null,
      mode: active ? "mock" : "idle",
      hasSystemAudio: true,
      hasMic: true,
      aiReady,
      hearingAudio: !!interim || lines.length > 0,
      audioCaptureMode: "mock",
      audioSource: null,
      audioSetup: null,
      clear,
      triggerMock,
    };
  }

  const lines = aiReady ? mergeLines(micSpeech.lines, whisperLines) : micSpeech.lines;

  const interim = normalizeTranscriptText(
    micSpeech.interim ||
      (captureProcessing ? `${recentTranscriptText(lines)} …` : recentTranscriptText(lines)),
  );

  const hasCallAudio = hasCallCapture || isCallAudioSource(audioSource) || callAudioActive;
  const micBlocked =
    (micSpeech.error === "not-allowed" || captureError === "not-allowed") &&
    !hasMicCapture &&
    micSpeech.lines.length === 0;

  const error =
    captureError === "screen-blocked"
      ? "screen-blocked"
      : micBlocked
        ? "not-allowed"
        : null;

  const hearingAudio =
    !!micSpeech.interim.trim() ||
    captureProcessing ||
    callAudioActive ||
    lines.length > 0;

  const mode: MeetingTranscriptionState["mode"] = !active
    ? "idle"
    : hasCallAudio && hasMicCapture
      ? "hybrid"
      : hasCallAudio
        ? "call-audio"
        : aiReady
          ? "whisper"
          : "webspeech";

  return {
    lines,
    interim,
    supported: micSpeech.supported,
    error,
    mode,
    hasSystemAudio: hasCallAudio,
    hasMic: hasMicCapture || (!micBlocked && (!!micSpeech.interim.trim() || micSpeech.lines.length > 0)),
    aiReady,
    hearingAudio,
    audioCaptureMode,
    audioSource,
    audioSetup,
    clear,
    triggerMock,
  };
}
