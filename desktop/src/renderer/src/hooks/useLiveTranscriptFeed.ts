import { useEffect, useState } from "react";
import type { TranscriptLine } from "../services/ai";

export interface LiveTranscriptFeed {
  lines: TranscriptLine[];
  interim: string;
  error: string | null;
  hearingAudio: boolean;
  isSpeaking: boolean;
  hasMic: boolean;
  hasSystemAudio: boolean;
  aiReady: boolean;
  audioSource: "desktop-capture" | "microphone" | null;
  isDemo: boolean;
}

const EMPTY: LiveTranscriptFeed = {
  lines: [],
  interim: "",
  error: null,
  hearingAudio: false,
  isSpeaking: false,
  hasMic: false,
  hasSystemAudio: false,
  aiReady: false,
  audioSource: null,
  isDemo: false,
};

export function useLiveTranscriptFeed(active: boolean): LiveTranscriptFeed {
  const [feed, setFeed] = useState<LiveTranscriptFeed>(EMPTY);

  useEffect(() => {
    if (!active) {
      setFeed(EMPTY);
      return;
    }

    const off = window.replii?.onLiveTranscript?.((state) => {
      setFeed({
        lines: state.lines,
        interim: state.interim,
        error: state.error,
        hearingAudio: state.hearingAudio,
        isSpeaking: state.isSpeaking ?? false,
        hasMic: state.hasMic,
        hasSystemAudio: state.hasSystemAudio,
        aiReady: state.aiReady,
        audioSource: state.audioSource,
        isDemo: false,
      });
    });

    window.replii?.requestLiveTranscript?.();
    const pollId = window.setInterval(() => {
      window.replii?.requestLiveTranscript?.();
    }, 250);

    return () => {
      off?.();
      window.clearInterval(pollId);
    };
  }, [active]);

  return feed;
}
